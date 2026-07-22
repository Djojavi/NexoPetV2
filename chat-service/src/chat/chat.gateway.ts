import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const raw = client.handshake.auth?.token as string | undefined;
    const token = raw?.startsWith('Bearer ') ? raw.slice(7) : raw;

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'super_secret_key_2026',
      });

      const displayName = payload.name ?? payload.email?.split('@')[0] ?? 'Usuario';

      this.chatService.addUser(client.id, {
        id: payload.sub,
        name: displayName,
        socketId: client.id,
      });

      // Enviar historial de mensajes recientes al cliente que se conectó
      const history = await this.chatService.getRecentMessages(50);
      client.emit('message_history', history);

      // Notificar a todos la lista actualizada de usuarios online
      this.server.emit('users_online', this.chatService.getOnlineUsers());

      console.log(`Usuario conectado: ${displayName} (${client.id})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = this.chatService.getUser(client.id);
    this.chatService.removeUser(client.id);
    this.server.emit('users_online', this.chatService.getOnlineUsers());

    if (user) {
      console.log(`Usuario desconectado: ${user.name} (${client.id})`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { content: string },
  ) {
    const user = this.chatService.getUser(client.id);
    if (!user || !body?.content?.trim()) return;

    const message = await this.chatService.saveMessage(
      user.id,
      user.name,
      body.content.trim(),
    );

    // Emitir a todos los clientes excepto al que envió
    client.broadcast.emit('receiveMessage', {
      id: message.id,
      senderId: message.senderId,
      senderName: message.senderName,
      content: message.content,
      createdAt: message.createdAt,
    });
  }

  @SubscribeMessage('typing')
  handleTyping(@ConnectedSocket() client: Socket) {
    const user = this.chatService.getUser(client.id);
    if (!user) return;

    client.broadcast.emit('typing', {
      userId: user.id,
      name: user.name,
    });
  }

  @SubscribeMessage('stop_typing')
  handleStopTyping(@ConnectedSocket() client: Socket) {
    const user = this.chatService.getUser(client.id);
    if (!user) return;

    client.broadcast.emit('stop_typing', {
      userId: user.id,
      name: user.name,
    });
  }
}
