// ============================================================
// CreatorAI Studio — Firestore Collection Names
// ============================================================
// Single source of truth for collection names.
// Never hardcode collection names — always reference this file.
// ============================================================

export const COLLECTIONS = {
  USERS: 'users',
  PROJECTS: 'projects',
  PIPELINES: 'pipelines',
  CONVERSATIONS: 'conversations',
  SCHEDULES: 'schedules',
  API_KEYS: 'apiKeys',

  // Subcollections (nested under parent)
  SCENES: 'scenes',
  ASSETS: 'assets',
  OUTPUTS: 'outputs',
  HISTORY: 'history', // Archived conversation messages
} as const;

/**
 * Build a path for a subcollection document.
 */
export function buildPath(
  parentCollection: string,
  parentId: string,
  subcollection: string,
  docId?: string,
): string {
  const base = `${parentCollection}/${parentId}/${subcollection}`;
  return docId ? `${base}/${docId}` : base;
}

/**
 * Firebase Storage path conventions.
 */
export const STORAGE_PATHS = {
  /** User-specific asset storage */
  userAssets: (userId: string) => `users/${userId}/assets`,

  /** Project-specific asset storage */
  projectAssets: (userId: string, projectId: string) =>
    `users/${userId}/projects/${projectId}/assets`,

  /** Scene image */
  sceneImage: (userId: string, projectId: string, sceneId: string) =>
    `users/${userId}/projects/${projectId}/scenes/${sceneId}/image`,

  /** Scene video */
  sceneVideo: (userId: string, projectId: string, sceneId: string) =>
    `users/${userId}/projects/${projectId}/scenes/${sceneId}/video`,

  /** Scene voiceover */
  sceneVoiceover: (userId: string, projectId: string, sceneId: string) =>
    `users/${userId}/projects/${projectId}/scenes/${sceneId}/voiceover`,

  /** Final rendered video */
  finalVideo: (userId: string, projectId: string) =>
    `users/${userId}/projects/${projectId}/output/video`,

  /** Thumbnail */
  thumbnail: (userId: string, projectId: string) =>
    `users/${userId}/projects/${projectId}/output/thumbnail`,

  /** Background music */
  music: (userId: string, projectId: string) =>
    `users/${userId}/projects/${projectId}/music`,

  /** Temp files (auto-cleaned) */
  temp: (userId: string) => `users/${userId}/temp`,
} as const;
