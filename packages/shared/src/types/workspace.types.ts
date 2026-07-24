// ============================================================
// CreatorAI Studio — Workspace & RBAC Domain Types
// ============================================================
// A Workspace is the top-level organizational unit.
// All projects, assets, workflows, AI memory, and brand
// profiles belong to a workspace.
//
// Hierarchy:
//   User → Workspace (many-to-many via WorkspaceMember)
//     └── Projects, Assets, Workflows, Memory, Brands
//
// Why workspaces?
// - Teams: Multiple people collaborate on content
// - Agencies: One account manages multiple client brands
// - Isolation: Each workspace has its own quota, memory, billing
// ============================================================

export enum WorkspaceRole {
  OWNER = 'owner',         // Full control, can delete workspace
  ADMIN = 'admin',         // Manage members, settings, everything except delete workspace
  EDITOR = 'editor',       // Create/edit projects, assets, run workflows
  REVIEWER = 'reviewer',   // View + approve/reject assets only
  VIEWER = 'viewer',       // Read-only access
}

/**
 * Granular permission flags.
 * The service layer checks these on every mutation.
 */
export enum Permission {
  // Projects
  PROJECT_CREATE = 'project.create',
  PROJECT_EDIT = 'project.edit',
  PROJECT_DELETE = 'project.delete',
  PROJECT_VIEW = 'project.view',

  // Assets
  ASSET_CREATE = 'asset.create',
  ASSET_EDIT = 'asset.edit',
  ASSET_DELETE = 'asset.delete',
  ASSET_VIEW = 'asset.view',
  ASSET_DOWNLOAD = 'asset.download',

  // Workflows
  WORKFLOW_RUN = 'workflow.run',
  WORKFLOW_CANCEL = 'workflow.cancel',
  WORKFLOW_VIEW = 'workflow.view',

  // Reviews
  REVIEW_REQUEST = 'review.request',
  REVIEW_APPROVE = 'review.approve',
  REVIEW_REJECT = 'review.reject',

  // Publishing
  PUBLISH_SCHEDULE = 'publish.schedule',
  PUBLISH_EXECUTE = 'publish.execute',

  // Workspace
  WORKSPACE_SETTINGS = 'workspace.settings',
  WORKSPACE_MEMBERS = 'workspace.members',
  WORKSPACE_BILLING = 'workspace.billing',
  WORKSPACE_MEMORY = 'workspace.memory',
  WORKSPACE_BRAND = 'workspace.brand',

  // AI Memory & Brand
  MEMORY_VIEW = 'memory.view',
  MEMORY_EDIT = 'memory.edit',
  BRAND_VIEW = 'brand.view',
  BRAND_EDIT = 'brand.edit',
}

/**
 * Role → Permission mapping.
 * Evaluated at runtime by the permission service.
 */
export const ROLE_PERMISSIONS: Record<WorkspaceRole, Permission[]> = {
  [WorkspaceRole.OWNER]: Object.values(Permission), // All permissions
  [WorkspaceRole.ADMIN]: Object.values(Permission).filter(
    (p) => p !== Permission.WORKSPACE_BILLING,
  ),
  [WorkspaceRole.EDITOR]: [
    Permission.PROJECT_CREATE, Permission.PROJECT_EDIT, Permission.PROJECT_VIEW, Permission.PROJECT_DELETE,
    Permission.ASSET_CREATE, Permission.ASSET_EDIT, Permission.ASSET_VIEW, Permission.ASSET_DOWNLOAD, Permission.ASSET_DELETE,
    Permission.WORKFLOW_RUN, Permission.WORKFLOW_CANCEL, Permission.WORKFLOW_VIEW,
    Permission.REVIEW_REQUEST,
    Permission.PUBLISH_SCHEDULE,
    Permission.MEMORY_VIEW, Permission.MEMORY_EDIT,
    Permission.BRAND_VIEW, Permission.BRAND_EDIT,
  ],
  [WorkspaceRole.REVIEWER]: [
    Permission.PROJECT_VIEW,
    Permission.ASSET_VIEW, Permission.ASSET_DOWNLOAD,
    Permission.WORKFLOW_VIEW,
    Permission.REVIEW_REQUEST, Permission.REVIEW_APPROVE, Permission.REVIEW_REJECT,
    Permission.MEMORY_VIEW, Permission.BRAND_VIEW,
  ],
  [WorkspaceRole.VIEWER]: [
    Permission.PROJECT_VIEW,
    Permission.ASSET_VIEW,
    Permission.WORKFLOW_VIEW,
    Permission.MEMORY_VIEW, Permission.BRAND_VIEW,
  ],
};

/**
 * Workspace — stored in Firestore `workspaces/{workspaceId}`.
 */
export interface Workspace {
  id: string;
  name: string;
  slug: string;                    // URL-friendly identifier
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
  autoApproveAssets: boolean;       // Skip review for auto-generated assets
  maxConcurrentWorkflows: number;
  enabledProviders: string[];       // Which AI providers this workspace can use
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
