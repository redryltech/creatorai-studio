import { describe, it, expect, beforeEach } from 'vitest';
import { ArtifactManager } from '../artifacts/artifact-manager';
import { ArtifactType } from '../artifacts/artifact.types';

describe('ArtifactManager', () => {
  let manager: ArtifactManager;

  beforeEach(() => { manager = new ArtifactManager(); });

  it('stores and retrieves artifacts by ID', () => {
    const artifact = manager.store({
      nodeId: 'node-1', workflowRunId: 'run-1', projectId: 'proj-1', userId: 'user-1',
      type: ArtifactType.SCRIPT, data: { scenes: [1, 2, 3] }, sourceAgentId: 'script',
    });
    expect(manager.getById(artifact.id)).toBeDefined();
    expect(manager.getById(artifact.id)!.type).toBe(ArtifactType.SCRIPT);
  });

  it('retrieves artifacts by node ID', () => {
    manager.store({ nodeId: 'n1', workflowRunId: 'r', projectId: 'p', userId: 'u', type: ArtifactType.SCRIPT, data: { x: 1 }, sourceAgentId: 'script' });
    manager.store({ nodeId: 'n1', workflowRunId: 'r', projectId: 'p', userId: 'u', type: ArtifactType.IMAGE, data: { y: 2 }, sourceAgentId: 'image' });

    const artifacts = manager.getByNode('n1');
    expect(artifacts.length).toBe(2);
  });

  it('resolves nested data paths', () => {
    manager.store({ nodeId: 'script-0', workflowRunId: 'r', projectId: 'p', userId: 'u', type: ArtifactType.SCRIPT, data: { scenes: [{ id: 's1', text: 'hello' }], fullText: 'full' }, sourceAgentId: 'script' });

    expect(manager.resolve('script-0.scenes')).toEqual([{ id: 's1', text: 'hello' }]);
    expect(manager.resolve('script-0.fullText')).toBe('full');
  });

  it('returns undefined for non-existent paths', () => {
    expect(manager.resolve('nonexistent.field')).toBeUndefined();
  });

  it('returns undefined for deep non-existent paths', () => {
    manager.store({ nodeId: 'n', workflowRunId: 'r', projectId: 'p', userId: 'u', type: ArtifactType.GENERIC, data: { a: { b: 1 } }, sourceAgentId: 'x' });
    expect(manager.resolve('n.a.b')).toBe(1);
    expect(manager.resolve('n.a.c')).toBeUndefined();
  });

  it('computes checksum on store', () => {
    const a = manager.store({ nodeId: 'n', workflowRunId: 'r', projectId: 'p', userId: 'u', type: ArtifactType.GENERIC, data: { key: 'value' }, sourceAgentId: 'x' });
    expect(a.checksum).toBeTruthy();
    expect(a.checksum.length).toBe(16);
  });

  it('clear() removes all artifacts', () => {
    manager.store({ nodeId: 'n', workflowRunId: 'r', projectId: 'p', userId: 'u', type: ArtifactType.GENERIC, data: {}, sourceAgentId: 'x' });
    expect(manager.size).toBe(1);
    manager.clear();
    expect(manager.size).toBe(0);
  });

  it('exportAll returns all artifacts as array', () => {
    manager.store({ nodeId: 'n1', workflowRunId: 'r', projectId: 'p', userId: 'u', type: ArtifactType.SCRIPT, data: {}, sourceAgentId: 'x' });
    manager.store({ nodeId: 'n2', workflowRunId: 'r', projectId: 'p', userId: 'u', type: ArtifactType.IMAGE, data: {}, sourceAgentId: 'y' });
    expect(manager.exportAll().length).toBe(2);
  });
});
