import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';
import './DomeGallery.css';

const DEFAULTS = {
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 35
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const wrapAngleSigned = (deg: number) => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};

function buildItems(pool: any[], seg: number) {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const totalSlots = coords.length;
  if (pool.length === 0) return coords.map(c => ({ ...c, src: '', alt: '' }));

  const normalizedImages = pool.map(image => {
    if (typeof image === 'string') return { src: `/img/${image}`, alt: '' };
    return { src: image.src || '', alt: image.alt || '' };
  });

  const shuffledImages = [...normalizedImages].sort(() => 0.5 - Math.random());
  const usedImages = Array.from({ length: totalSlots }, (_, i) => shuffledImages[i % shuffledImages.length]);

  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    alt: usedImages[i].alt
  }));
}

export default function DomeGallery({
  images = [],
  fit = 0.8,
  minRadius = 600,
  maxRadius = Infinity,
  overlayBlurColor = '#080808',
  maxVerticalRotationDeg = 0,
  dragSensitivity = DEFAULTS.dragSensitivity,
  enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
  segments = DEFAULTS.segments,
  dragDampening = 2,
  imageBorderRadius = '30px',
  openedImageBorderRadius = '30px',
  grayscale = true
}: any) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const focusedElRef = useRef<any>(null);
  const originalTileInfoRef = useRef<any>(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef<any>(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef<any>(null);
  const openingRef = useRef(false);

  const applyTransform = (xDeg: number, yDeg: number) => {
    if (sphereRef.current) {
      sphereRef.current.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  };

  const items = useMemo(() => buildItems(images, segments), [images, segments]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      const w = cr.width, h = cr.height;
      const minDim = Math.min(w, h);
      let radius = minDim * fit;
      radius = clamp(radius, minRadius, maxRadius);
      root.style.setProperty('--radius', `${Math.round(radius)}px`);
      root.style.setProperty('--overlay-blur-color', overlayBlurColor);
      root.style.setProperty('--tile-radius', imageBorderRadius);
      root.style.setProperty('--enlarge-radius', openedImageBorderRadius);
      root.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');
      applyTransform(rotationRef.current.x, rotationRef.current.y);
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [fit, minRadius, maxRadius, overlayBlurColor, grayscale, imageBorderRadius, openedImageBorderRadius]);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) cancelAnimationFrame(inertiaRAF.current);
    inertiaRAF.current = null;
  }, []);

  const startInertia = useCallback((vx: number, vy: number) => {
    let vX = vx * 80, vY = vy * 80;
    const d = clamp(dragDampening ?? 0.6, 0, 1);
    const frictionMul = 0.94 + 0.055 * d;
    const step = () => {
      vX *= frictionMul; vY *= frictionMul;
      if (Math.abs(vX) < 0.01 && Math.abs(vY) < 0.01) return;
      const nextX = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
      const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
      rotationRef.current = { x: nextX, y: nextY };
      applyTransform(nextX, nextY);
      inertiaRAF.current = requestAnimationFrame(step);
    };
    stopInertia();
    inertiaRAF.current = requestAnimationFrame(step);
  }, [dragDampening, maxVerticalRotationDeg, stopInertia]);

  useGesture({
    onDragStart: ({ event }) => {
      stopInertia();
      draggingRef.current = true;
      movedRef.current = false;
      const evt = event as any;
      startRotRef.current = { ...rotationRef.current };
      startPosRef.current = { x: evt.clientX, y: evt.clientY };
    },
    onDrag: ({ event, last, velocity, direction }) => {
      if (!draggingRef.current) return;
      const evt = event as any;
      const dx = evt.clientX - startPosRef.current.x;
      const dy = evt.clientY - startPosRef.current.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) movedRef.current = true;
      const nextX = clamp(startRotRef.current.x - dy / dragSensitivity, -maxVerticalRotationDeg, maxVerticalRotationDeg);
      const nextY = wrapAngleSigned(startRotRef.current.y + dx / dragSensitivity);
      rotationRef.current = { x: nextX, y: nextY };
      applyTransform(nextX, nextY);
      if (last) {
        draggingRef.current = false;
        startInertia(velocity[0] * direction[0], velocity[1] * direction[1]);
      }
    }
  }, { target: mainRef, eventOptions: { passive: true } });

  const closeItem = () => {
    const overlay = viewerRef.current?.querySelector('.enlarge') as HTMLElement;
    if (!overlay || !originalTileInfoRef.current) {
      if (overlay) overlay.remove();
      if (focusedElRef.current) focusedElRef.current.style.visibility = '';
      rootRef.current?.removeAttribute('data-enlarging');
      openingRef.current = false;
      return;
    }

    const { tx, ty, sx, sy } = originalTileInfoRef.current;
    overlay.style.transform = `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`;
    overlay.style.opacity = '0';
    rootRef.current?.removeAttribute('data-enlarging');

    setTimeout(() => {
      overlay.remove();
      if (focusedElRef.current) focusedElRef.current.style.visibility = '';
      focusedElRef.current = null;
      originalTileInfoRef.current = null;
      openingRef.current = false;
    }, enlargeTransitionMs);
  };

  const openItem = (el: HTMLElement) => {
    if (openingRef.current || movedRef.current) return;
    openingRef.current = true;
    focusedElRef.current = el;
    const tileR = el.getBoundingClientRect();
    const frameR = frameRef.current!.getBoundingClientRect();
    const mainR = mainRef.current!.getBoundingClientRect();
    
    el.style.visibility = 'hidden';
    const overlay = document.createElement('div');
    overlay.className = 'enlarge';
    overlay.style.cssText = `position:absolute;left:${frameR.left - mainR.left}px;top:${frameR.top - mainR.top}px;width:${frameR.width}px;height:${frameR.height}px;z-index:30;transition:all ${enlargeTransitionMs}ms ease;`;
    const img = document.createElement('img');
    img.src = el.querySelector('img')!.src;
    overlay.appendChild(img);
    viewerRef.current!.appendChild(overlay);

    const tx = tileR.left - frameR.left;
    const ty = tileR.top - frameR.top;
    const sx = tileR.width / frameR.width;
    const sy = tileR.height / frameR.height;
    originalTileInfoRef.current = { tx, ty, sx, sy };

    overlay.style.transform = `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`;
    overlay.style.opacity = '0';

    setTimeout(() => {
      overlay.style.opacity = '1';
      overlay.style.transform = 'translate(0,0) scale(1)';
      rootRef.current?.setAttribute('data-enlarging', 'true');
    }, 16);
  };

  return (
    <div ref={rootRef} className="sphere-root" style={{ ['--segments-x' as any]: segments, ['--segments-y' as any]: segments }}>
      <main ref={mainRef} className="sphere-main">
        <div className="stage">
          <div ref={sphereRef} className="sphere">
            {items.map((it, i) => (
              <div key={i} className="item" data-offset-x={it.x} data-offset-y={it.y} data-size-x={it.sizeX} data-size-y={it.sizeY}
                style={{ ['--offset-x' as any]: it.x, ['--offset-y' as any]: it.y, ['--item-size-x' as any]: it.sizeX, ['--item-size-y' as any]: it.sizeY }}>
                <div className="item__image" onClick={(e) => openItem(e.currentTarget)}>
                  <img src={it.src} draggable={false} alt="" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="overlay" /><div className="overlay overlay--blur" />
        <div className="viewer" ref={viewerRef}>
          <div ref={scrimRef} className="scrim" onClick={closeItem} />
          <div ref={frameRef} className="frame" />
        </div>
      </main>
    </div>
  );
}
