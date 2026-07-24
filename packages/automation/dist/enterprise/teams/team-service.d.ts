import type { Organization, TeamMember, TeamRole, AuditEvent } from '../types/enterprise.types';
export declare class TeamService {
    private static instance;
    private organizations;
    private members;
    private auditLog;
    private constructor();
    static getInstance(): TeamService;
    static resetInstance(): void;
    /** Create an organization. */
    createOrganization(params: {
        name: string;
        ownerId: string;
        plan?: string;
    }): Organization;
    /** Add a member. */
    addMember(orgId: string, userId: string, email: string, role: TeamRole, invitedBy: string): TeamMember;
    /** Remove a member. */
    removeMember(orgId: string, memberId: string, removedBy: string): boolean;
    /** Change member role. */
    changeRole(orgId: string, memberId: string, newRole: TeamRole, changedBy: string): boolean;
    /** Get organization members. */
    getMembers(orgId: string): TeamMember[];
    /** Get organizations for user. */
    getUserOrganizations(userId: string): Organization[];
    /** Get organization by ID. */
    getOrganization(orgId: string): Organization | undefined;
    /** Get audit log. */
    getAuditLog(orgId: string, limit?: number): AuditEvent[];
    private audit;
}
//# sourceMappingURL=team-service.d.ts.map