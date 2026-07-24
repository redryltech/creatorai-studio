// ============================================================
// CreatorAI Studio — Team Management Service
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
const log = Logger.for('TeamService');
export class TeamService {
    static instance = null;
    organizations = new Map();
    members = [];
    auditLog = [];
    constructor() { }
    static getInstance() { if (!TeamService.instance)
        TeamService.instance = new TeamService(); return TeamService.instance; }
    static resetInstance() { TeamService.instance = null; }
    /** Create an organization. */
    createOrganization(params) {
        const org = {
            id: generateId(ID_PREFIXES.project), name: params.name,
            slug: params.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50),
            ownerId: params.ownerId, plan: params.plan ?? 'free',
            subscriptionId: null, memberCount: 1,
            createdAt: new Date(), updatedAt: new Date(),
        };
        this.organizations.set(org.id, org);
        this.addMember(org.id, params.ownerId, params.ownerId, 'owner', params.ownerId);
        this.audit(org.id, params.ownerId, 'organization.create', 'organization', org.id, { name: params.name });
        log.info('Organization created', { orgId: org.id, name: params.name });
        return org;
    }
    /** Add a member. */
    addMember(orgId, userId, email, role, invitedBy) {
        const member = { id: generateId(ID_PREFIXES.step), organizationId: orgId, userId, email, role, invitedBy, joinedAt: new Date() };
        this.members.push(member);
        const org = this.organizations.get(orgId);
        if (org) {
            org.memberCount++;
            org.updatedAt = new Date();
        }
        this.audit(orgId, invitedBy, 'member.add', 'member', member.id, { email, role });
        return member;
    }
    /** Remove a member. */
    removeMember(orgId, memberId, removedBy) {
        const idx = this.members.findIndex((m) => m.id === memberId && m.organizationId === orgId);
        if (idx === -1)
            return false;
        const member = this.members[idx];
        if (member.role === 'owner')
            throw new Error('Cannot remove organization owner');
        this.members.splice(idx, 1);
        const org = this.organizations.get(orgId);
        if (org) {
            org.memberCount = Math.max(0, org.memberCount - 1);
        }
        this.audit(orgId, removedBy, 'member.remove', 'member', memberId, { email: member.email });
        return true;
    }
    /** Change member role. */
    changeRole(orgId, memberId, newRole, changedBy) {
        const member = this.members.find((m) => m.id === memberId && m.organizationId === orgId);
        if (!member)
            return false;
        const oldRole = member.role;
        member.role = newRole;
        this.audit(orgId, changedBy, 'member.role_change', 'member', memberId, { from: oldRole, to: newRole });
        return true;
    }
    /** Get organization members. */
    getMembers(orgId) {
        return this.members.filter((m) => m.organizationId === orgId);
    }
    /** Get organizations for user. */
    getUserOrganizations(userId) {
        const memberOrgIds = this.members.filter((m) => m.userId === userId).map((m) => m.organizationId);
        return Array.from(this.organizations.values()).filter((o) => memberOrgIds.includes(o.id));
    }
    /** Get organization by ID. */
    getOrganization(orgId) {
        return this.organizations.get(orgId);
    }
    /** Get audit log. */
    getAuditLog(orgId, limit = 50) {
        return this.auditLog.filter((e) => e.organizationId === orgId).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
    }
    audit(orgId, userId, action, resource, resourceId, details) {
        this.auditLog.push({ id: generateId(ID_PREFIXES.step), organizationId: orgId, userId, action, resource, resourceId, details, ipAddress: null, timestamp: new Date() });
    }
}
//# sourceMappingURL=team-service.js.map