// ============================================================
// CreatorAI Studio — Scene Graph Planner
// ============================================================
// Converts Storyboard + CharacterDatabase into structured
// scene graphs with spatial relationships, camera rigs,
// lighting setups, and animation states.
// ============================================================
import { generateId, ID_PREFIXES } from '@creatorai/shared';
import { Logger } from '@creatorai/agents';
const log = Logger.for('SceneGraphPlanner');
// ── Helpers ──
const v3 = (x, y, z) => ({ x, y, z });
const rot = (p, y, r) => ({ pitch: p, yaw: y, roll: r });
const bbox = (min, max) => ({ min, max });
// Camera position mapping
const CAMERA_POS = {
    ground_level: v3(0, 0.3, 5), waist_level: v3(0, 1, 5), eye_level: v3(0, 1.7, 5),
    overhead: v3(0, 8, 2), aerial: v3(0, 20, 10), crane_high: v3(0, 6, 8), floor: v3(0, 0.1, 4),
};
const LENS_FOV = {
    '24mm': 84, '35mm': 63, '50mm': 47, '85mm': 28, '135mm': 18,
    ultra_wide: 100, telephoto: 15, macro: 40,
};
// Env → node templates
const ENV_NODES = {
    highway: [{ type: 'road', name: 'Highway', pos: v3(0, 0, 0) }, { type: 'sky', name: 'Sky', pos: v3(0, 50, 0) }, { type: 'mountain', name: 'Distant Mountains', pos: v3(0, 5, -200) }],
    mountains: [{ type: 'mountain', name: 'Mountain Range', pos: v3(0, 30, -100) }, { type: 'sky', name: 'Sky', pos: v3(0, 50, 0) }, { type: 'tree', name: 'Forest', pos: v3(-20, 0, -30) }],
    studio: [{ type: 'environment', name: 'Studio Floor', pos: v3(0, 0, 0) }, { type: 'environment', name: 'Backdrop', pos: v3(0, 2, -5) }],
    city: [{ type: 'building', name: 'Skyline', pos: v3(0, 15, -50) }, { type: 'road', name: 'Street', pos: v3(0, 0, 0) }, { type: 'sky', name: 'Sky', pos: v3(0, 50, 0) }],
    night_city: [{ type: 'building', name: 'Neon Buildings', pos: v3(0, 15, -50) }, { type: 'road', name: 'Wet Street', pos: v3(0, 0, 0) }],
    countryside: [{ type: 'environment', name: 'Rolling Hills', pos: v3(0, 0, -50) }, { type: 'sky', name: 'Sunset Sky', pos: v3(0, 50, 0) }, { type: 'tree', name: 'Trees', pos: v3(-15, 0, -20) }],
    luxury_garage: [{ type: 'building', name: 'Garage', pos: v3(0, 3, -8) }, { type: 'environment', name: 'Concrete Floor', pos: v3(0, 0, 0) }],
    race_track: [{ type: 'road', name: 'Track Surface', pos: v3(0, 0, 0) }, { type: 'building', name: 'Grandstand', pos: v3(30, 5, -20) }],
    forest: [{ type: 'tree', name: 'Dense Forest', pos: v3(0, 5, -15) }, { type: 'environment', name: 'Forest Floor', pos: v3(0, 0, 0) }],
    beach: [{ type: 'water', name: 'Ocean', pos: v3(0, 0, -30) }, { type: 'environment', name: 'Sand', pos: v3(0, 0, 0) }, { type: 'sky', name: 'Sky', pos: v3(0, 50, 0) }],
    desert: [{ type: 'environment', name: 'Desert Sand', pos: v3(0, 0, 0) }, { type: 'sky', name: 'Harsh Sky', pos: v3(0, 50, 0) }],
    ocean: [{ type: 'water', name: 'Ocean', pos: v3(0, -2, 0) }, { type: 'sky', name: 'Sky', pos: v3(0, 50, 0) }],
    snow: [{ type: 'environment', name: 'Snow Ground', pos: v3(0, 0, 0) }, { type: 'mountain', name: 'Snow Peaks', pos: v3(0, 30, -100) }],
    space: [{ type: 'sky', name: 'Space', pos: v3(0, 0, 0) }, { type: 'environment', name: 'Stars', pos: v3(0, 0, -500) }],
};
// Lighting → light node templates
const LIGHTING_MAP = {
    golden_hour: [{ type: 'sun', name: 'Golden Sun', intensity: 0.8, temp: 3500, pos: v3(-30, 15, -20) }],
    dramatic: [{ type: 'spot', name: 'Key Light', intensity: 1.0, temp: 5500, pos: v3(-5, 5, 5) }, { type: 'rim', name: 'Rim Light', intensity: 0.6, temp: 6500, pos: v3(5, 3, -3) }],
    rim_light: [{ type: 'rim', name: 'Rim', intensity: 0.8, temp: 6000, pos: v3(3, 4, -2) }, { type: 'fill', name: 'Fill', intensity: 0.3, temp: 5500, pos: v3(-3, 2, 4) }],
    neon: [{ type: 'area', name: 'Neon Blue', intensity: 0.7, temp: 8000, pos: v3(-4, 3, 2) }, { type: 'area', name: 'Neon Pink', intensity: 0.5, temp: 3000, pos: v3(4, 3, -2) }],
    studio: [{ type: 'area', name: 'Key Softbox', intensity: 1.0, temp: 5600, pos: v3(-3, 5, 3) }, { type: 'fill', name: 'Fill', intensity: 0.4, temp: 5600, pos: v3(3, 3, 3) }, { type: 'rim', name: 'Hair Light', intensity: 0.5, temp: 5600, pos: v3(0, 5, -3) }],
    moonlight: [{ type: 'moon', name: 'Moonlight', intensity: 0.3, temp: 7500, pos: v3(10, 30, -10) }],
    natural: [{ type: 'sun', name: 'Daylight', intensity: 0.9, temp: 5600, pos: v3(0, 40, -20) }, { type: 'hdri', name: 'Sky Fill', intensity: 0.3, temp: 6500, pos: v3(0, 50, 0) }],
    softbox: [{ type: 'area', name: 'Softbox', intensity: 0.9, temp: 5500, pos: v3(-2, 4, 4) }],
    hard_light: [{ type: 'spot', name: 'Hard Spot', intensity: 1.2, temp: 5500, pos: v3(-4, 6, 5) }],
    back_light: [{ type: 'area', name: 'Backlight', intensity: 0.7, temp: 6000, pos: v3(0, 3, -5) }],
    hdr: [{ type: 'hdri', name: 'HDR Dome', intensity: 1.0, temp: 5600, pos: v3(0, 20, 0) }],
    blue_hour: [{ type: 'sun', name: 'Blue Hour Sun', intensity: 0.4, temp: 9000, pos: v3(-20, 5, -30) }],
    volumetric_fog: [{ type: 'spot', name: 'Volumetric Key', intensity: 0.8, temp: 5500, pos: v3(-3, 5, 5) }],
    low_key: [{ type: 'spot', name: 'Low Key Spot', intensity: 0.6, temp: 4500, pos: v3(-5, 4, 3) }],
    high_key: [{ type: 'area', name: 'Broad Key', intensity: 1.2, temp: 5800, pos: v3(0, 6, 4) }, { type: 'fill', name: 'Fill', intensity: 0.8, temp: 5800, pos: v3(3, 3, 3) }],
    spotlight: [{ type: 'spot', name: 'Spotlight', intensity: 1.5, temp: 5500, pos: v3(0, 8, 0) }],
};
// Motion → animation state
const MOTION_TO_ANIM = {
    static_pose: 'idle', walking: 'walking', running: 'running', driving: 'driving',
    drifting: 'driving', slow_motion: 'idle', fast_motion: 'running', rising: 'idle',
    flying: 'hovering', jumping: 'jumping', floating: 'hovering', spinning: 'turning',
    subtle_movement: 'idle', falling: 'jumping',
};
export class SceneGraphPlanner {
    /**
     * Build scene graphs for all frames in a storyboard.
     */
    static plan(storyboard, charDb, directorPlan) {
        const startTime = performance.now();
        log.info('Scene graph planning', { frames: storyboard.frames.length, entities: charDb.entities.length });
        const scenes = storyboard.frames.map((frame, idx) => {
            const dirScene = directorPlan?.scenes[idx];
            return SceneGraphPlanner.buildSceneGraph(frame, charDb, dirScene);
        });
        // Global anchors (persistent world positions for entities)
        const globalAnchors = {};
        const continuityAnchors = {};
        for (const entity of charDb.entities) {
            const pos = entity.category === 'vehicle' ? v3(0, 0.5, 0) : v3(-1, 0, 1);
            globalAnchors[entity.id] = pos;
            continuityAnchors[entity.id] = { position: pos, rotation: rot(0, 0, 0) };
        }
        const totalNodes = scenes.reduce((s, g) => s + Object.keys(g.nodes).length, 0);
        const totalRels = scenes.reduce((s, g) => s + g.relationships.length, 0);
        const avgComplexity = scenes.length > 0
            ? Math.round(scenes.reduce((s, g) => s + g.metrics.complexityScore, 0) / scenes.length)
            : 0;
        const processingTimeMs = Math.round(performance.now() - startTime);
        log.info('Scene graph package built', { scenes: scenes.length, totalNodes, totalRels, avgComplexity, processingTimeMs });
        return {
            id: generateId(ID_PREFIXES.pipeline),
            productionTitle: storyboard.title,
            scenes,
            globalAnchors,
            continuityAnchors,
            metadata: {
                totalScenes: scenes.length,
                totalNodes,
                totalRelationships: totalRels,
                avgComplexity,
                generatedAt: new Date().toISOString(),
                engine: 'scene-graph-planner-v1',
                processingTimeMs,
            },
        };
    }
    // ══════════════════════════════════════════════════════════
    // Single Scene Graph Builder
    // ══════════════════════════════════════════════════════════
    static buildSceneGraph(frame, charDb, dirScene) {
        const graphId = `graph-${frame.sceneOrder}`;
        const nodes = {};
        const relationships = [];
        let nodeCounter = 0;
        const makeId = () => `node_${frame.sceneOrder}_${++nodeCounter}`;
        // ── Root node ──
        const rootId = makeId();
        nodes[rootId] = SceneGraphPlanner.makeNode(rootId, 'root', 'Scene Root', null, v3(0, 0, 0));
        // ── Environment nodes ──
        const env = (dirScene?.environment ?? frame.style.mood ?? 'studio');
        const envTemplates = ENV_NODES[env] ?? ENV_NODES.studio;
        const envNodeIds = [];
        for (const tmpl of envTemplates) {
            const nid = makeId();
            nodes[nid] = SceneGraphPlanner.makeNode(nid, tmpl.type, tmpl.name, rootId, tmpl.pos);
            nodes[rootId].childrenIds.push(nid);
            envNodeIds.push(nid);
        }
        // ── Entity nodes (from CharacterDatabase) ──
        const entityNodeIds = [];
        for (const entity of charDb.entities) {
            if (!entity.scenePresence.includes(frame.sceneId))
                continue;
            const nid = makeId();
            const pos = entity.category === 'vehicle' ? v3(0, 0.5, 0) : v3(-1.5, 0, 0.5);
            const type = entity.category === 'vehicle' ? 'vehicle' :
                entity.category === 'human' ? 'character' :
                    entity.category === 'animal' ? 'animal' :
                        entity.category === 'prop' ? 'prop' : 'product';
            const animState = MOTION_TO_ANIM[(dirScene?.motionStyle ?? frame.motion.subjectMotion ?? 'idle').replace(/ /g, '_')] ?? 'idle';
            const node = SceneGraphPlanner.makeNode(nid, type, entity.displayName, rootId, pos);
            node.entityId = entity.id;
            node.seed = entity.globalSeed;
            node.importance = entity.priority;
            node.visibility = entity.visibilityScore / 100;
            node.animationState = animState;
            node.metadata = { identityBlock: entity.identityBlock, category: entity.category };
            if (entity.category === 'vehicle') {
                node.scale = v3(2.2, 1.1, 0.8);
                node.boundingBox = bbox(v3(-1.1, 0, -0.4), v3(1.1, 1.1, 0.4));
                if (animState === 'driving') {
                    node.velocity = v3(0, 0, -15); // moving forward
                    node.direction = v3(0, 0, -1);
                }
            }
            nodes[nid] = node;
            nodes[rootId].childrenIds.push(nid);
            entityNodeIds.push(nid);
            // Relationship: entity ON environment
            if (envNodeIds.length > 0) {
                relationships.push({
                    id: `rel_${relationships.length + 1}`,
                    type: 'on_top_of',
                    sourceNodeId: nid,
                    targetNodeId: envNodeIds[0],
                    strength: 1.0,
                    metadata: {},
                });
            }
        }
        // Relationships between entities
        for (let i = 0; i < entityNodeIds.length; i++) {
            for (let j = i + 1; j < entityNodeIds.length; j++) {
                const a = nodes[entityNodeIds[i]];
                const b = nodes[entityNodeIds[j]];
                const dist = Math.sqrt((a.position.x - b.position.x) ** 2 + (a.position.z - b.position.z) ** 2);
                relationships.push({
                    id: `rel_${relationships.length + 1}`,
                    type: dist < 3 ? 'near' : 'far',
                    sourceNodeId: entityNodeIds[i],
                    targetNodeId: entityNodeIds[j],
                    strength: Math.max(0, 1 - dist / 20),
                    metadata: { distance: Math.round(dist * 10) / 10 },
                });
            }
        }
        // ── Prop nodes (from assets) ──
        for (const propName of frame.assets.props) {
            const nid = makeId();
            nodes[nid] = SceneGraphPlanner.makeNode(nid, 'prop', propName, entityNodeIds[0] ?? rootId, v3(0.3, 0.8, 0.2));
            nodes[nid].importance = 2;
            if (entityNodeIds[0]) {
                relationships.push({
                    id: `rel_${relationships.length + 1}`,
                    type: 'attached_to',
                    sourceNodeId: nid,
                    targetNodeId: entityNodeIds[0],
                    strength: 0.9,
                    metadata: {},
                });
            }
        }
        // ── Camera node ──
        const camPos = CAMERA_POS[frame.camera.position] ?? v3(0, 1.7, 5);
        const fov = LENS_FOV[frame.camera.lens] ?? 47;
        const cameraNode = {
            ...SceneGraphPlanner.makeNode(makeId(), 'camera', 'Main Camera', rootId, camPos),
            type: 'camera',
            targetNodeId: entityNodeIds[0] ?? null,
            focusDistance: camPos.z,
            lens: frame.camera.lens,
            fieldOfView: fov,
            depthOfField: { near: Math.max(0.5, camPos.z - 2), far: camPos.z + 10, focusRange: 2 },
            motionPath: [camPos],
            keyframes: [{ time: 0, position: camPos, rotation: rot(0, 0, 0), fov }],
            lookAtTarget: entityNodeIds[0] ?? null,
            safeFrame: { top: 0.05, bottom: 0.05, left: 0.05, right: 0.05 },
        };
        nodes[cameraNode.id] = cameraNode;
        // Relationship: camera LOOKING AT target
        if (cameraNode.targetNodeId) {
            relationships.push({
                id: `rel_${relationships.length + 1}`,
                type: 'looking_at',
                sourceNodeId: cameraNode.id,
                targetNodeId: cameraNode.targetNodeId,
                strength: 1.0,
                metadata: { lens: frame.camera.lens, fov },
            });
        }
        // ── Light nodes ──
        const lightingKey = (dirScene?.lighting ?? 'natural');
        const lightTemplates = LIGHTING_MAP[lightingKey] ?? LIGHTING_MAP.natural;
        const lightNodes = lightTemplates.map((lt) => {
            const nid = makeId();
            const lightNode = {
                ...SceneGraphPlanner.makeNode(nid, lt.type === 'sun' || lt.type === 'moon' ? 'sun' : 'light_source', lt.name, rootId, lt.pos),
                type: lt.type === 'sun' || lt.type === 'moon' ? 'sun' : 'light_source',
                lightType: lt.type,
                intensity: lt.intensity,
                temperature: lt.temp,
                color: SceneGraphPlanner.tempToHex(lt.temp),
                shadowDirection: v3(lt.pos.x > 0 ? -1 : 1, -1, lt.pos.z > 0 ? -1 : 1),
                castShadow: lt.type !== 'fill' && lt.type !== 'hdri',
                radius: lt.type === 'point' || lt.type === 'spot' ? 5 : 50,
                falloff: lt.type === 'point' ? 2 : 1,
            };
            nodes[nid] = lightNode;
            return lightNode;
        });
        // Light → entity relationships
        for (const light of lightNodes) {
            for (const eid of entityNodeIds) {
                relationships.push({
                    id: `rel_${relationships.length + 1}`,
                    type: light.castShadow ? 'receives_shadow' : 'emits_light',
                    sourceNodeId: light.id,
                    targetNodeId: eid,
                    strength: light.intensity,
                    metadata: {},
                });
            }
        }
        // ── Particle system (from effects) ──
        const effects = dirScene?.visualEffects ?? [];
        const particleEffects = ['dust_particles', 'rain_effect', 'snow_effect', 'smoke_effect', 'sparks', 'fog_effect'];
        for (const eff of particleEffects) {
            if (effects.includes(eff) || frame.motion.particleMotion.toLowerCase().includes(eff.replace('_effect', '').replace('_particles', ''))) {
                const nid = makeId();
                nodes[nid] = SceneGraphPlanner.makeNode(nid, 'particle_system', eff.replace(/_/g, ' '), rootId, v3(0, 2, 0));
                nodes[nid].animationState = 'particle_motion';
                nodes[nid].metadata = { effect: eff };
            }
        }
        // ── Metrics ──
        const nodeList = Object.values(nodes);
        const metrics = {
            objectCount: nodeList.length,
            characterCount: nodeList.filter((n) => n.type === 'character').length,
            vehicleCount: nodeList.filter((n) => n.type === 'vehicle').length,
            lightCount: lightNodes.length,
            complexityScore: Math.min(100, nodeList.length * 5 + relationships.length * 3),
            motionScore: Math.min(100, nodeList.filter((n) => n.animationState !== 'idle').length * 20),
            crowdDensity: Math.min(100, nodeList.filter((n) => n.type === 'character').length * 25),
            environmentDensity: Math.min(100, envNodeIds.length * 20),
            depthComplexity: Math.min(100, new Set(nodeList.map((n) => Math.round(n.position.z))).size * 15),
        };
        return {
            sceneId: frame.sceneId,
            frameId: frame.frameId,
            graphId,
            worldOrigin: v3(0, 0, 0),
            worldUp: v3(0, 1, 0),
            sceneBounds: bbox(v3(-50, -1, -200), v3(50, 50, 50)),
            rootNodeId: rootId,
            nodes,
            relationships,
            cameraNode,
            lightNodes,
            metrics,
            metadata: {
                objectCount: nodeList.length,
                timestamp: frame.timing.startTimeSec,
                durationSec: frame.timing.durationSec,
            },
        };
    }
    // ── Helpers ──
    static makeNode(id, type, name, parentId, pos) {
        return {
            id, uuid: `${id}-${Date.now().toString(36)}`, type, name,
            parentId, childrenIds: [],
            position: pos, rotation: rot(0, 0, 0), scale: v3(1, 1, 1),
            boundingBox: bbox(v3(pos.x - 0.5, pos.y, pos.z - 0.5), v3(pos.x + 0.5, pos.y + 1, pos.z + 0.5)),
            velocity: v3(0, 0, 0), acceleration: v3(0, 0, 0), direction: v3(0, 0, -1),
            visibility: 1, importance: 5, animationState: 'idle',
            physics: { isStatic: true, mass: 1, gravity: true, friction: 0.5, restitution: 0.3 },
            entityId: null, seed: 0, metadata: {},
        };
    }
    static tempToHex(kelvin) {
        if (kelvin <= 3500)
            return '#FFB347';
        if (kelvin <= 5000)
            return '#FFF4E0';
        if (kelvin <= 6500)
            return '#FFFFFF';
        if (kelvin <= 8000)
            return '#CCE5FF';
        return '#99CCFF';
    }
}
//# sourceMappingURL=scene-graph-planner.js.map