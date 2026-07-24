export declare const COLLECTIONS: {
    readonly USERS: "users";
    readonly PROJECTS: "projects";
    readonly PIPELINES: "pipelines";
    readonly CONVERSATIONS: "conversations";
    readonly SCHEDULES: "schedules";
    readonly API_KEYS: "apiKeys";
    readonly SCENES: "scenes";
    readonly ASSETS: "assets";
    readonly OUTPUTS: "outputs";
    readonly HISTORY: "history";
};
/**
 * Build a path for a subcollection document.
 */
export declare function buildPath(parentCollection: string, parentId: string, subcollection: string, docId?: string): string;
/**
 * Firebase Storage path conventions.
 */
export declare const STORAGE_PATHS: {
    /** User-specific asset storage */
    readonly userAssets: (userId: string) => string;
    /** Project-specific asset storage */
    readonly projectAssets: (userId: string, projectId: string) => string;
    /** Scene image */
    readonly sceneImage: (userId: string, projectId: string, sceneId: string) => string;
    /** Scene video */
    readonly sceneVideo: (userId: string, projectId: string, sceneId: string) => string;
    /** Scene voiceover */
    readonly sceneVoiceover: (userId: string, projectId: string, sceneId: string) => string;
    /** Final rendered video */
    readonly finalVideo: (userId: string, projectId: string) => string;
    /** Thumbnail */
    readonly thumbnail: (userId: string, projectId: string) => string;
    /** Background music */
    readonly music: (userId: string, projectId: string) => string;
    /** Temp files (auto-cleaned) */
    readonly temp: (userId: string) => string;
};
//# sourceMappingURL=collections.d.ts.map