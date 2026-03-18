export type Role = 'user' | 'moderator' | 'worker' | 'admin';

export type IssueStatus =
  | 'new'
  | 'moderation'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  avatar?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
}

export interface Issue {
  id: string;
  userId: string;
  userName: string;
  categoryId: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  photoBefore?: string;
  photoAfter?: string;
  status: IssueStatus;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_LABELS: Record<IssueStatus, string> = {
  new: 'Новая',
  moderation: 'На модерации',
  in_progress: 'В работе',
  resolved: 'Решено',
  closed: 'Закрыто',
};

export const STATUS_COLORS: Record<IssueStatus, string> = {
  new: 'bg-slate-100 text-slate-700 border-slate-300',
  moderation: 'bg-amber-50 text-amber-700 border-amber-300',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-300',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-300',
  closed: 'bg-teal-50 text-teal-700 border-teal-300',
};

export const STATUS_DOT: Record<IssueStatus, string> = {
  new: 'bg-slate-400',
  moderation: 'bg-amber-400',
  in_progress: 'bg-blue-500',
  resolved: 'bg-emerald-500',
  closed: 'bg-teal-500',
};

export const ROLE_LABELS: Record<Role, string> = {
  user: 'Житель',
  moderator: 'Диспетчер',
  worker: 'Исполнитель',
  admin: 'Администратор',
};
