import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';
const SOCKET_BASE_URL = import.meta.env.VITE_SOCKET_URL || API_BASE_URL.replace(/\/api$/, '');

export interface AdminNavigationTemplate {
  template_id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  icon?: string;
  sort_order: number;
  schema_version?: string;
  knowledge_graph_attributes?: Record<string, unknown> | null;
  status_steps?: Array<{
    index: number;
    id: string;
    title: string;
    description?: string;
    status?: string;
  }>;
  workflow_summary?: Record<string, unknown> | null;
  source_path?: string;
  updated_at: string;
}

export interface AdminNavigationCategory {
  category_id: string;
  category: string;
  subcategory?: string;
  icon?: string;
  sort_order: number;
  schema_version?: string;
  knowledge_graph_attributes?: Record<string, unknown> | null;
  updated_at: string;
  templates: AdminNavigationTemplate[];
  subcategories: Record<string, AdminNavigationTemplate[]>;
}

export interface AdminNavigationResponse {
  success: boolean;
  categories: AdminNavigationCategory[];
}

export async function fetchAdminNavigation(): Promise<AdminNavigationCategory[]> {
  const response = await fetch(`${API_BASE_URL}/admin/navigation`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load admin navigation: ${response.status}`);
  }

  const payload = (await response.json()) as AdminNavigationResponse;
  if (!payload.success) {
    throw new Error('Admin navigation responded with failure');
  }

  return payload.categories || [];
}

export type AdminNavSocketMessage = {
  event: string;
  payload: unknown;
  timestamp: string;
  source?: string;
};

let socketInstance: Socket | null = null;

export function getAdminNavSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(SOCKET_BASE_URL, {
      path: '/socket.io',
      transports: ['websocket'],
    });
  }
  return socketInstance;
}

export function subscribeToAdminNavigation(
  handler: (message: AdminNavSocketMessage) => void
): () => void {
  const socket = getAdminNavSocket();
  socket.on('admin-nav:update', handler);
  return () => {
    socket.off('admin-nav:update', handler);
  };
}
