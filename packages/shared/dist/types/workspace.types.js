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
export var WorkspaceRole;
(function (WorkspaceRole) {
    WorkspaceRole["OWNER"] = "owner";
    WorkspaceRole["ADMIN"] = "admin";
    WorkspaceRole["EDITOR"] = "editor";
    WorkspaceRole["REVIEWER"] = "reviewer";
    WorkspaceRole["VIEWER"] = "viewer";
})(WorkspaceRole || (WorkspaceRole = {}));
/**
 * Granular permission flags.
 * The service layer checks these on every mutation.
 */
export var Permission;
(function (Permission) {
    // Projects
    Permission["PROJECT_CREATE"] = "project.create";
    Permission["PROJECT_EDIT"] = "project.edit";
    Permission["PROJECT_DELETE"] = "project.delete";
    Permission["PROJECT_VIEW"] = "project.view";
    // Assets
    Permission["ASSET_CREATE"] = "asset.create";
    Permission["ASSET_EDIT"] = "asset.edit";
    Permission["ASSET_DELETE"] = "asset.delete";
    Permission["ASSET_VIEW"] = "asset.view";
    Permission["ASSET_DOWNLOAD"] = "asset.download";
    // Workflows
    Permission["WORKFLOW_RUN"] = "workflow.run";
    Permission["WORKFLOW_CANCEL"] = "workflow.cancel";
    Permission["WORKFLOW_VIEW"] = "workflow.view";
    // Reviews
    Permission["REVIEW_REQUEST"] = "review.request";
    Permission["REVIEW_APPROVE"] = "review.approve";
    Permission["REVIEW_REJECT"] = "review.reject";
    // Publishing
    Permission["PUBLISH_SCHEDULE"] = "publish.schedule";
    Permission["PUBLISH_EXECUTE"] = "publish.execute";
    // Workspace
    Permission["WORKSPACE_SETTINGS"] = "workspace.settings";
    Permission["WORKSPACE_MEMBERS"] = "workspace.members";
    Permission["WORKSPACE_BILLING"] = "workspace.billing";
    Permission["WORKSPACE_MEMORY"] = "workspace.memory";
    Permission["WORKSPACE_BRAND"] = "workspace.brand";
    // AI Memory & Brand
    Permission["MEMORY_VIEW"] = "memory.view";
    Permission["MEMORY_EDIT"] = "memory.edit";
    Permission["BRAND_VIEW"] = "brand.view";
    Permission["BRAND_EDIT"] = "brand.edit";
})(Permission || (Permission = {}));
/**
 * Role → Permission mapping.
 * Evaluated at runtime by the permission service.
 */
export const ROLE_PERMISSIONS = {
    [WorkspaceRole.OWNER]: Object.values(Permission), // All permissions
    [WorkspaceRole.ADMIN]: Object.values(Permission).filter((p) => p !== Permission.WORKSPACE_BILLING),
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
//# sourceMappingURL=workspace.types.js.map