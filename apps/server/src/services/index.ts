// ============================================================
// CreatorAI Studio — Service Layer Factory
// ============================================================

import { getFirestore, getStorageBucket } from '../config/firebase';
import {
  ProjectRepository, TimelineRepository,
  AssetRepository, AssetVersionRepository, ReviewRepository,
  WorkspaceRepository, WorkspaceMemberRepository, WorkspaceInvitationRepository,
  AIMemoryRepository, BrandProfileRepository,
  AuditLogRepository,
  FirebaseStorageProvider,
} from '@creatorai/database';
import { ProjectService } from './project.service';
import { AssetService } from './asset.service';
import { WorkspaceService } from './workspace.service';
import { MemoryService } from './memory.service';

let _projectService: ProjectService | null = null;
let _assetService: AssetService | null = null;
let _workspaceService: WorkspaceService | null = null;
let _memoryService: MemoryService | null = null;

export function getProjectService(): ProjectService {
  if (!_projectService) {
    const db = getFirestore();
    _projectService = new ProjectService(new ProjectRepository(db), new TimelineRepository(db));
  }
  return _projectService;
}

export function getAssetService(): AssetService {
  if (!_assetService) {
    const db = getFirestore();
    const bucket = getStorageBucket();
    _assetService = new AssetService(
      new AssetRepository(db), new AssetVersionRepository(db), new ReviewRepository(db),
      new TimelineRepository(db), new FirebaseStorageProvider(bucket),
    );
  }
  return _assetService;
}

export function getWorkspaceService(): WorkspaceService {
  if (!_workspaceService) {
    const db = getFirestore();
    _workspaceService = new WorkspaceService(
      new WorkspaceRepository(db), new WorkspaceMemberRepository(db),
      new WorkspaceInvitationRepository(db), new AuditLogRepository(db),
    );
  }
  return _workspaceService;
}

export function getMemoryService(): MemoryService {
  if (!_memoryService) {
    const db = getFirestore();
    _memoryService = new MemoryService(
      new AIMemoryRepository(db), new BrandProfileRepository(db), getWorkspaceService(),
    );
  }
  return _memoryService;
}
