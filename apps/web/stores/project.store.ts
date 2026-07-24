// ============================================================
// CreatorAI Studio — Project Store (Zustand)
// ============================================================

import { create } from 'zustand';
import { api } from '@/lib/api-client';

interface ProjectState {
  /** List of user's projects */
  projects: unknown[];
  /** Currently selected project */
  currentProject: unknown | null;
  /** Loading state */
  loading: boolean;
  /** Error */
  error: string | null;
  /** Pagination */
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  // Actions
  loadProjects: (params?: { page?: number; status?: string }) => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  createProject: (data: {
    title: string;
    contentType: string;
    targetPlatforms: string[];
    settings?: Record<string, unknown>;
  }) => Promise<unknown>;
  updateProject: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  clearCurrentProject: () => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  loadProjects: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await api.projects.list(params);
      set({
        projects: response.items,
        pagination: response.pagination,
        loading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load projects',
        loading: false,
      });
    }
  },

  loadProject: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const project = await api.projects.get(id);
      set({ currentProject: project, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load project',
        loading: false,
      });
    }
  },

  createProject: async (data) => {
    set({ loading: true, error: null });
    try {
      const project = await api.projects.create(data);
      set((state) => ({
        projects: [project, ...state.projects],
        loading: false,
      }));
      return project;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create project',
        loading: false,
      });
      throw error;
    }
  },

  updateProject: async (id, data) => {
    try {
      await api.projects.update(id, data);
      set((state) => ({
        projects: state.projects.map((p: any) =>
          p.id === id ? { ...p, ...data } : p,
        ),
        currentProject:
          (state.currentProject as any)?.id === id
            ? { ...(state.currentProject as any), ...data }
            : state.currentProject,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update project' });
    }
  },

  deleteProject: async (id) => {
    try {
      await api.projects.delete(id);
      set((state) => ({
        projects: state.projects.filter((p: any) => p.id !== id),
        currentProject:
          (state.currentProject as any)?.id === id ? null : state.currentProject,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete project' });
    }
  },

  clearCurrentProject: () => set({ currentProject: null }),
}));
