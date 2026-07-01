var mapViewport = {
  scale: CONFIG.MAP_DEFAULT_ZOOM,
  panX: 0,
  panY: 0,
  dragging: false,
  didDrag: false,
  dragStartX: 0,
  dragStartY: 0,
  dragStartPanX: 0,
  dragStartPanY: 0,
  pointers: new Map(),
  pinchStartDist: 0,
  pinchStartScale: 1,
  initialized: false,
  lastDragAt: 0,
};

function initMapViewport() {
  if (mapViewport.initialized) return;
  mapViewport.initialized = true;

  const container = document.getElementById('map-container');
  const viewport = document.getElementById('map-viewport');
  const map = document.getElementById('map');
  if (!container || !viewport || !map) return;

  map.style.width = `${CONFIG.MAP_WIDTH}px`;
  map.style.height = `${CONFIG.MAP_HEIGHT}px`;

  const bg = document.getElementById('map-background');
  if (bg) {
    bg.addEventListener('load', () => {
      if (bg.naturalWidth && bg.naturalHeight) {
        CONFIG.MAP_WIDTH = bg.naturalWidth;
        CONFIG.MAP_HEIGHT = bg.naturalHeight;
        map.style.width = `${CONFIG.MAP_WIDTH}px`;
        map.style.height = `${CONFIG.MAP_HEIGHT}px`;
      }
      centerMapOnPoint(
        LOCATIONS[getState().player.position]?.x || CONFIG.MAP_WIDTH / 2,
        LOCATIONS[getState().player.position]?.y || CONFIG.MAP_HEIGHT / 2,
        false
      );
    });
  }

  container.addEventListener('pointerdown', onMapPointerDown);
  container.addEventListener('pointermove', onMapPointerMove);
  container.addEventListener('pointerup', onMapPointerUp);
  container.addEventListener('pointercancel', onMapPointerUp);
  container.addEventListener('wheel', onMapWheel, { passive: false });

  centerMapOnPoint(
    LOCATIONS[getState().player.position]?.x || CONFIG.MAP_WIDTH / 2,
    LOCATIONS[getState().player.position]?.y || CONFIG.MAP_HEIGHT / 2,
    false
  );
}

function applyMapTransform() {
  const viewport = document.getElementById('map-viewport');
  if (!viewport) return;
  clampMapPan();
  viewport.style.transform = `translate(${mapViewport.panX}px, ${mapViewport.panY}px) scale(${mapViewport.scale})`;
}

function clampMapPan() {
  const container = document.getElementById('map-container');
  if (!container) return;

  const cw = container.clientWidth;
  const ch = container.clientHeight;
  const mapW = CONFIG.MAP_WIDTH * mapViewport.scale;
  const mapH = CONFIG.MAP_HEIGHT * mapViewport.scale;

  if (mapW <= cw) {
    mapViewport.panX = (cw - mapW) / 2;
  } else {
    mapViewport.panX = Math.min(0, Math.max(cw - mapW, mapViewport.panX));
  }

  if (mapH <= ch) {
    mapViewport.panY = (ch - mapH) / 2;
  } else {
    mapViewport.panY = Math.min(0, Math.max(ch - mapH, mapViewport.panY));
  }
}

function centerMapOnPoint(x, y, animate) {
  const container = document.getElementById('map-container');
  if (!container) return;

  const cw = container.clientWidth;
  const ch = container.clientHeight;
  mapViewport.panX = cw / 2 - x * mapViewport.scale;
  mapViewport.panY = ch / 2 - y * mapViewport.scale;
  applyMapTransform();
}

function shouldIgnoreMapTap() {
  return Date.now() - mapViewport.lastDragAt < 250;
}

function onMapPointerDown(e) {
  if (e.target.closest('.location-node')) return;

  const container = document.getElementById('map-container');
  container.setPointerCapture(e.pointerId);
  mapViewport.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (mapViewport.pointers.size === 1) {
    mapViewport.dragging = true;
    mapViewport.didDrag = false;
    mapViewport.dragStartX = e.clientX;
    mapViewport.dragStartY = e.clientY;
    mapViewport.dragStartPanX = mapViewport.panX;
    mapViewport.dragStartPanY = mapViewport.panY;
    container.classList.add('is-dragging');
  } else if (mapViewport.pointers.size === 2) {
    mapViewport.dragging = false;
    mapViewport.pinchStartDist = getPointerDistance();
    mapViewport.pinchStartScale = mapViewport.scale;
  }
}

function onMapPointerMove(e) {
  if (!mapViewport.pointers.has(e.pointerId)) return;

  mapViewport.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (mapViewport.pointers.size >= 2) {
    const dist = getPointerDistance();
    if (mapViewport.pinchStartDist > 0) {
      const rect = document.getElementById('map-container').getBoundingClientRect();
      const points = Array.from(mapViewport.pointers.values());
      const cx = (points[0].x + points[1].x) / 2 - rect.left;
      const cy = (points[0].y + points[1].y) / 2 - rect.top;
      const ratio = dist / mapViewport.pinchStartDist;
      zoomAtPoint(cx, cy, mapViewport.pinchStartScale * ratio);
      mapViewport.didDrag = true;
    }
    return;
  }

  if (!mapViewport.dragging) return;

  const dx = e.clientX - mapViewport.dragStartX;
  const dy = e.clientY - mapViewport.dragStartY;

  if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
    mapViewport.didDrag = true;
  }

  mapViewport.panX = mapViewport.dragStartPanX + dx;
  mapViewport.panY = mapViewport.dragStartPanY + dy;
  applyMapTransform();
}

function onMapPointerUp(e) {
  const container = document.getElementById('map-container');
  if (container.hasPointerCapture(e.pointerId)) {
    container.releasePointerCapture(e.pointerId);
  }

  mapViewport.pointers.delete(e.pointerId);

  if (mapViewport.pointers.size === 0) {
    mapViewport.dragging = false;
    container.classList.remove('is-dragging');
    if (mapViewport.didDrag) {
      mapViewport.lastDragAt = Date.now();
    }
    mapViewport.didDrag = false;
  } else if (mapViewport.pointers.size === 1) {
    const remaining = Array.from(mapViewport.pointers.values())[0];
    mapViewport.dragging = true;
    mapViewport.dragStartX = remaining.x;
    mapViewport.dragStartY = remaining.y;
    mapViewport.dragStartPanX = mapViewport.panX;
    mapViewport.dragStartPanY = mapViewport.panY;
  }
}

function onMapWheel(e) {
  e.preventDefault();
  const rect = document.getElementById('map-container').getBoundingClientRect();
  const cx = e.clientX - rect.left;
  const cy = e.clientY - rect.top;
  const factor = e.deltaY > 0 ? 0.92 : 1.08;
  zoomAtPoint(cx, cy, mapViewport.scale * factor);
}

function zoomAtPoint(cx, cy, newScale) {
  newScale = Math.max(CONFIG.MAP_MIN_ZOOM, Math.min(CONFIG.MAP_MAX_ZOOM, newScale));

  const worldX = (cx - mapViewport.panX) / mapViewport.scale;
  const worldY = (cy - mapViewport.panY) / mapViewport.scale;

  mapViewport.scale = newScale;
  mapViewport.panX = cx - worldX * newScale;
  mapViewport.panY = cy - worldY * newScale;
  applyMapTransform();
}

function getPointerDistance() {
  const points = Array.from(mapViewport.pointers.values());
  if (points.length < 2) return 0;
  const dx = points[0].x - points[1].x;
  const dy = points[0].y - points[1].y;
  return Math.sqrt(dx * dx + dy * dy);
}
