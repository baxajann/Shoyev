'use client';

import { User, Issue, IssueStatus } from './types';
import { MOCK_USERS, MOCK_ISSUES } from './mockData';

const ISSUES_KEY = 'citytrack_issues_v2';
const CURRENT_USER_KEY = 'citytrack_user';

export function getIssues(): Issue[] {
  if (typeof window === 'undefined') return MOCK_ISSUES;
  const stored = localStorage.getItem(ISSUES_KEY);
  if (!stored) {
    localStorage.setItem(ISSUES_KEY, JSON.stringify(MOCK_ISSUES));
    return MOCK_ISSUES;
  }
  return JSON.parse(stored);
}

export function saveIssues(issues: Issue[]): void {
  localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
}

export function addIssue(issue: Issue): void {
  const issues = getIssues();
  issues.unshift(issue);
  saveIssues(issues);
}

export function updateIssue(updated: Issue): void {
  const issues = getIssues();
  const idx = issues.findIndex((i) => i.id === updated.id);
  if (idx !== -1) {
    issues[idx] = updated;
    saveIssues(issues);
  }
}

export function updateIssueStatus(
  id: string,
  status: IssueStatus,
  extra?: Partial<Issue>
): void {
  const issues = getIssues();
  const idx = issues.findIndex((i) => i.id === id);
  if (idx !== -1) {
    issues[idx] = {
      ...issues[idx],
      status,
      updatedAt: new Date().toISOString(),
      ...extra,
    };
    saveIssues(issues);
  }
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  if (!stored) return null;
  return JSON.parse(stored);
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function login(email: string, password: string): User | null {
  const user = MOCK_USERS.find(
    (u) => u.email === email && u.password === password
  );
  if (user) {
    setCurrentUser(user);
    return user;
  }
  return null;
}

export function logout(): void {
  setCurrentUser(null);
}

export function generateId(): string {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
