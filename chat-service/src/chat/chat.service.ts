import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ConnectedUser {
  id: string;
  name: string;
  socketId: string;
}

@Injectable()
export class ChatService {
  private connectedUsers = new Map<string, ConnectedUser>();

  constructor(private readonly prisma: PrismaService) {}

  addUser(socketId: string, user: ConnectedUser) {
    this.connectedUsers.set(socketId, user);
  }

  removeUser(socketId: string) {
    this.connectedUsers.delete(socketId);
  }

  getUser(socketId: string): ConnectedUser | undefined {
    return this.connectedUsers.get(socketId);
  }

  getOnlineUsers(): { id: string; name: string }[] {
    return Array.from(this.connectedUsers.values()).map((u) => ({
      id: u.id,
      name: u.name,
    }));
  }

  async saveMessage(senderId: string, senderName: string, content: string) {
    return this.prisma.message.create({
      data: { senderId, senderName, content },
    });
  }

  async getRecentMessages(limit = 50) {
    const messages = await this.prisma.message.findMany({
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
    return messages;
  }
}
