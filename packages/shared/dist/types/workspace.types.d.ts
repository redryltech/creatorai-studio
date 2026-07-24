export declare enum WorkspaceRole {
    OWNER = "owner",// Full control, can delete workspace
    ADMIN = "admin",// Manage members, settings, everything except delete workspace
    EDITOR = "editor",// Create/edit projects, assets, run workflows
    REVIEWER = "reviewer",// View + approve/reject assets only
    VIEWER = "viewer"
}
/**
 * Granular permission flags.
 * The service layer checks these on every mutation.
 */
export declare enum Permission {
    PROJECT_CREATE = "project.create",
    PROJECT_EDIT = "project.edit",
    PROJECT_DELETE = "project.delete",
    PROJECT_VIEW = "project.view",
    ASSET_CREATE = "asset.create",
    ASSET_EDIT = "asset.edit",
    ASSET_DELETE = "asset.delete",
    ASSET_VIEW = "asset.view",
    ASSET_DOWNLOAD = "asset.download",
    WORKFLOW_RUN = "workflow.run",
    WORKFLOW_CANCEL = "workflow.cancel",
    WORKFLOW_VIEW = "workflow.view",
    REVIEW_REQUEST = "review.request",
    REVIEW_APPROVE = "review.approve",
    REVIEW_REJECT = "review.reject",
    PUBLISH_SCHEDULE = "publish.schedule",
    PUBLISH_EXECUTE = "publish.execute",
    WORKSPACE_SETTINGS = "workspace.settings",
    WORKSPACE_MEMBERS = "workspace.members",
    WORKSPACE_BILLING = "workspace.billing",
    WORKSPACE_MEMORY = "workspace.memory",
    WORKSPACE_BRAND = "workspace.brand",
    MEMORY_VIEW = "memory.view",
    MEMORY_EDIT = "memory.edit",
    BRAND_VIEW = "brand.view",
    BRAND_EDIT = "brand.edit"
}
/**
 * Role → Permission mapping.
 * Evaluated at runtime by the permission service.
 */
export declare const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]>;
/**
 * Workspace — stored in Firestore `workspaces/{workspaceId}`.
 */
export interface Workspace {
    id: string;
    name: string;
    slug: string;
    description: string;
    ownerId: string;
    settings: WorkspaceSettings;
    usage: WorkspaceUsage;
    iconUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface WorkspaceSettings {
    defaultLanguage: string;
    defaultPlatform: string | null;
    defaultArtStyle: string | null;
    defaultVoiceId: string | null;
    autoApproveAssets: boolean;
    maxConcurrentWorkflows: number;
    enabledProviders: string[];
}
export interface WorkspaceUsage {
    projectCount: number;
    assetCount: number;
    workflowRunCount: number;
    storageUsedBytes: number;
    totalCostUsd: number;
    currentMonthCostUsd: number;
}
/**
 * Workspace member — stored in `workspaceMembers/{memberId}`.
 */
export interface WorkspaceMember {
    id: string;
    workspaceId: string;
    userId: string;
    email: string;
    displayName: string;
    role: WorkspaceRole;
    invitedBy: string;
    joinedAt: Date;
    updatedAt: Date;
}
/**
 * Workspace invitation — stored in `workspaceInvitations/{invitationId}`.
 */
export interface WorkspaceInvitation {
    id: string;
    workspaceId: string;
    workspaceName: string;
    email: string;
    role: WorkspaceRole;
    invitedBy: string;
    status: 'pending' | 'accepted' | 'declined' | 'expired';
    expiresAt: Date;
    createdAt: Date;
}
//# sourceMappingURL=workspace.types.d.ts.map