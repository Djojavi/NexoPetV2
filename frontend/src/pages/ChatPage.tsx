import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { createSocket } from '../lib/socket';
import {
  RECEIVE_MESSAGE,
  SEND_MESSAGE,
  STOP_TYPING,
  TYPING,
  USERS_ONLINE,
} from '../lib/chatEvents';

const MAX_LENGTH = 1000;
const TYPING_TIMEOUT_MS = 1500;

type ConnectionStatus = 'connecting' | 'connected' | 'unavailable';

interface ChatMessage {
  id: string;
  senderId?: string;
  senderName?: string;
  content: string;
  createdAt?: string;
}

interface OnlineUser {
  id: string;
  name: string;
}

function formatTime(iso?: string): string {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChatPage() {
  const { user, token } = useAuth();

  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingNames, setTypingNames] = useState<string[]>([]);
  const [text, setText] = useState('');

  const socketRef = useRef<Socket | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // --- Ciclo de vida del socket ---
  useEffect(() => {
    if (!token) {
      setStatus('unavailable');
      return;
    }

    const socket = createSocket(token);
    socketRef.current = socket;

    socket.on('connect', () => setStatus('connected'));
    // Mientras haya reintentos pendientes seguimos en "conectando" (sin errores visibles).
    socket.on('disconnect', () => setStatus('connecting'));
    socket.io.on('reconnect_failed', () => setStatus('unavailable'));

    socket.on(RECEIVE_MESSAGE, (msg: ChatMessage) => {
      if (!msg) return;
      // Ignoramos el eco de nuestros propios mensajes (ya los mostramos al enviar).
      if (msg.senderId && msg.senderId === user?.id) return;
      setMessages((prev) => [
        ...prev,
        { ...msg, id: msg.id ?? crypto.randomUUID() },
      ]);
    });

    socket.on(USERS_ONLINE, (users: OnlineUser[]) => {
      setOnlineUsers(Array.isArray(users) ? users : []);
    });

    socket.on(TYPING, (payload: { userId?: string; name?: string }) => {
      const name = payload?.name;
      if (!name || payload.userId === user?.id) return;
      setTypingNames((prev) => (prev.includes(name) ? prev : [...prev, name]));
    });

    socket.on(STOP_TYPING, (payload: { userId?: string; name?: string }) => {
      const name = payload?.name;
      if (!name) return;
      setTypingNames((prev) => prev.filter((n) => n !== name));
    });

    socket.connect();

    return () => {
      if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
      socket.removeAllListeners();
      socket.io.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user?.id]);

  // Auto-scroll al último mensaje o al indicador de escritura.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingNames]);

  const connected = status === 'connected';
  const trimmed = text.trim();
  const canSend = connected && trimmed.length > 0 && text.length <= MAX_LENGTH;

  function emitStopTyping() {
    if (!isTypingRef.current) return;
    isTypingRef.current = false;
    socketRef.current?.emit(STOP_TYPING);
  }

  function handleChange(value: string) {
    setText(value);
    if (!connected) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socketRef.current?.emit(TYPING);
    }
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(
      emitStopTyping,
      TYPING_TIMEOUT_MS,
    );
  }

  function handleSend() {
    if (!canSend) return;
    const content = trimmed;

    socketRef.current?.emit(SEND_MESSAGE, { content });

    // Mostramos el mensaje propio de inmediato (optimista).
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        senderId: user?.id,
        senderName: user?.name,
        content,
        createdAt: new Date().toISOString(),
      },
    ]);

    setText('');
    if (typingTimerRef.current) window.clearTimeout(typingTimerRef.current);
    emitStopTyping();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const typingLabel = useMemo(() => {
    if (typingNames.length === 0) return null;
    if (typingNames.length === 1) return `${typingNames[0]} está escribiendo…`;
    if (typingNames.length === 2)
      return `${typingNames[0]} y ${typingNames[1]} están escribiendo…`;
    return 'Varias personas están escribiendo…';
  }, [typingNames]);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-neutral-800">Chat</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Tele-consulta con el equipo veterinario.
        </p>
      </div>

      {status === 'unavailable' ? (
        <div className="rounded-2xl border border-accent-200 bg-accent-50 px-5 py-4 text-sm text-accent-700">
          El servicio de chat estará disponible pronto.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
        {/* Usuarios conectados */}
        <aside className="rounded-2xl border border-neutral-200/70 bg-surface p-4 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-700">
              Usuarios conectados
            </h3>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
              {onlineUsers.length}
            </span>
          </div>
          {onlineUsers.length === 0 ? (
            <p className="text-sm text-neutral-400">
              {connected ? 'Nadie más conectado.' : 'Sin conexión.'}
            </p>
          ) : (
            <ul className="space-y-2">
              {onlineUsers.map((u) => (
                <li key={u.id} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 rounded-full bg-success"
                    aria-hidden="true"
                  />
                  <span className="text-neutral-700">{u.name}</span>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Conversación */}
        <section className="flex h-[32rem] flex-col overflow-hidden rounded-2xl border border-neutral-200/70 bg-surface shadow-card">
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 ? (
              <p className="mt-8 text-center text-sm text-neutral-400">
                Aún no hay mensajes. ¡Inicia la conversación!
              </p>
            ) : (
              messages.map((msg) => {
                const self = msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${self ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm shadow-soft ${
                        self
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-100 text-neutral-800'
                      }`}
                    >
                      {!self && msg.senderName ? (
                        <p className="mb-0.5 text-xs font-semibold text-primary-700">
                          {msg.senderName}
                        </p>
                      ) : null}
                      <p className="whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <p
                        className={`mt-1 text-right text-[0.65rem] ${
                          self ? 'text-primary-100' : 'text-neutral-400'
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            {typingLabel ? (
              <p className="text-xs italic text-neutral-400">{typingLabel}</p>
            ) : null}
            <div ref={bottomRef} />
          </div>

          {/* Caja de texto */}
          <div className="border-t border-neutral-200 p-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <textarea
                  rows={1}
                  value={text}
                  onChange={(e) => handleChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={emitStopTyping}
                  disabled={!connected}
                  maxLength={MAX_LENGTH}
                  placeholder={
                    connected
                      ? 'Escribe un mensaje…'
                      : 'Chat no disponible por ahora'
                  }
                  aria-label="Mensaje"
                  className="max-h-32 w-full resize-none rounded-lg border border-neutral-200 bg-surface px-3.5 py-2.5 text-sm text-neutral-800 shadow-soft transition-colors placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:cursor-not-allowed disabled:bg-neutral-50"
                />
                {text.length > MAX_LENGTH - 100 ? (
                  <p className="mt-1 text-right text-xs text-neutral-400">
                    {text.length}/{MAX_LENGTH}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend}
                className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Enviar
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
