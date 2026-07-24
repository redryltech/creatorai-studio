import type { IdentityLock } from './image.types';
import type { CharacterDatabase } from '../character/character.types';
import type { AssetMemoryPackage } from '../asset-memory/asset.types';

export class IdentityLockEngine {
  static lock(sceneId: string, charDb: CharacterDatabase, assetMem?: AssetMemoryPackage): IdentityLock {
    const chars = charDb.entities.filter(e => e.category === 'human' && e.scenePresence.includes(sceneId)).map(e => ({ entityId: e.id, identityBlock: e.identityBlock, seed: e.globalSeed }));
    const vehicles = charDb.entities.filter(e => e.category === 'vehicle' && e.scenePresence.includes(sceneId)).map(e => ({ entityId: e.id, identityBlock: e.identityBlock, seed: e.globalSeed, color: e.vehicleProfile?.primaryColor ?? '' }));
    const objects = charDb.entities.filter(e => e.category === 'prop' && e.scenePresence.includes(sceneId)).map(e => ({ name: e.displayName, description: e.identityBlock }));
    const brandColors = assetMem?.brandKit?.primaryColors ?? [];
    const brandStyle = assetMem?.styleGuide?.visualStyle ?? '';
    const globalSeed = charDb.entities[0]?.globalSeed ?? 42;
    const sceneSeedMap = charDb.entities[0]?.sceneSeed;
    const sceneSeed = typeof sceneSeedMap === 'object' && sceneSeedMap !== null ? ((sceneSeedMap as Record<string, number>)[sceneId] ?? globalSeed) : globalSeed;
    const consistencyScore = Math.min(100, (chars.length > 0 ? 30 : 0) + (vehicles.length > 0 ? 30 : 0) + (brandColors.length > 0 ? 20 : 10) + 20);
    return { characterLock: chars, vehicleLock: vehicles, objectLock: objects, brandLock: { colors: brandColors, style: brandStyle }, globalSeed, sceneSeed, consistencyScore };
  }
}
