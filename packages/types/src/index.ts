export interface User {
  id: string;
  name?: string;
}

export interface Room {
  slug: string;
  users: User[];
}

export interface SignalMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'broadcast_invite' | 'call_user';
  payload: any;
  from: string;
  to: string;
}

export interface SyncMessage {
  slug: string;
  update: Uint8Array | number[]; // Socket.io might serialize Uint8Array as number[] or Buffer
  from: string;
}

export interface ChatMessage {
  slug: string;
  from: string;
  text: string;
  timestamp: number;
}
