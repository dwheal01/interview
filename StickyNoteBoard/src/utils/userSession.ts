import type { LocalUser } from '../types';

const USER_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#e11d48", "#8b5cf6"];

export function getLocalUser(): LocalUser | null {
  const userId = localStorage.getItem("sticky-user-id");
  const username = localStorage.getItem("sticky-username");
  const color = localStorage.getItem("sticky-user-color");

  if (!userId || !username || !color) {
    return null;
  }

  return { userId, username, color };
}

export function createLocalUser(username: string): LocalUser {
  // Generate or get existing userId
  let userId = localStorage.getItem("sticky-user-id");
  if (!userId) {
    userId = crypto.randomUUID?.() ?? String(Date.now());
    localStorage.setItem("sticky-user-id", userId);
  }

  // Get or assign color
  let color = localStorage.getItem("sticky-user-color");
  if (!color) {
    color = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
    localStorage.setItem("sticky-user-color", color);
  }

  // Store username
  localStorage.setItem("sticky-username", username);

  return { userId, username, color };
}

