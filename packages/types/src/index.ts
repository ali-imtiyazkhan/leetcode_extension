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
