export const camera = {
  x: 0,
  y: 0,
  zoom: 1
};

export function screenToWorld(sx, sy) {
    return {
        x: (sx - camera.x)/camera.zoom,
        y: (sy - camera.y)/camera.zoom
    };
}

export function applyCameraTransform(ctx) {
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.zoom, camera.zoom);
}