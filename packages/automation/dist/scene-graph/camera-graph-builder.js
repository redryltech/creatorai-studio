// ============================================================
// CreatorAI Studio — Camera Graph Builder
// ============================================================
// Constructs camera motion paths, keyframes, and look-at
// targets from storyboard camera information.
// ============================================================
export class CameraGraphBuilder {
    /**
     * Enhance a camera node with motion path keyframes
     * based on camera movement type from the storyboard.
     */
    static buildMotionPath(camera, movement, duration) {
        const start = { ...camera.position };
        const keyframes = [];
        const path = [];
        const steps = Math.max(2, Math.round(duration * 2));
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const pos = CameraGraphBuilder.interpolatePosition(start, movement, t, duration);
            const fov = CameraGraphBuilder.interpolateFov(camera.fieldOfView, movement, t);
            path.push(pos);
            keyframes.push({
                time: t * duration,
                position: pos,
                rotation: { pitch: 0, yaw: 0, roll: 0 },
                fov,
            });
        }
        return { ...camera, motionPath: path, keyframes };
    }
    static interpolatePosition(start, movement, t, dur) {
        const m = movement.replace(/ /g, '_').toLowerCase();
        switch (m) {
            case 'dolly_in':
            case 'push_in':
                return { x: start.x, y: start.y, z: start.z - t * 3 };
            case 'dolly_out':
            case 'pull_back':
                return { x: start.x, y: start.y, z: start.z + t * 3 };
            case 'crane_up':
                return { x: start.x, y: start.y + t * 4, z: start.z - t * 1 };
            case 'crane_down':
                return { x: start.x, y: start.y - t * 3, z: start.z };
            case 'orbit_right':
            case 'orbit':
                return { x: start.x + Math.sin(t * Math.PI * 0.5) * 4, y: start.y, z: start.z - Math.cos(t * Math.PI * 0.5) * 4 + 4 };
            case 'orbit_left':
                return { x: start.x - Math.sin(t * Math.PI * 0.5) * 4, y: start.y, z: start.z - Math.cos(t * Math.PI * 0.5) * 4 + 4 };
            case 'tracking_forward':
                return { x: start.x, y: start.y, z: start.z - t * 5 };
            case 'drone_ascend':
                return { x: start.x, y: start.y + t * 10, z: start.z - t * 3 };
            case 'drone_descend':
                return { x: start.x, y: Math.max(1, start.y - t * 8), z: start.z - t * 2 };
            case 'drone_orbit':
                return { x: Math.sin(t * Math.PI * 2) * 15, y: start.y, z: Math.cos(t * Math.PI * 2) * 15 };
            case 'fpv_forward':
                return { x: start.x, y: start.y, z: start.z - t * 10 };
            case 'pan_left':
            case 'pan_right':
                return start; // Camera pivots, doesn't translate
            case 'zoom_in':
            case 'zoom_out':
                return start; // Optical zoom only
            default:
                return start;
        }
    }
    static interpolateFov(baseFov, movement, t) {
        if (movement.includes('zoom_in'))
            return baseFov - t * 20;
        if (movement.includes('zoom_out'))
            return baseFov + t * 20;
        return baseFov;
    }
}
//# sourceMappingURL=camera-graph-builder.js.map