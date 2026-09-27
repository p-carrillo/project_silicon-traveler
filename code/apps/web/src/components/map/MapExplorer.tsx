'use client';

import { useEffect, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from 'react';
import Link from 'next/link';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { getMapPins, getMapState, saveMapState } from '@/lib/api';
import type { MapPin, MapState, Photo } from '@/types';
import { getTranslations } from '@/lib/i18n/translations';
import { resolveActiveFrame } from './active-frame';

const WORLD_GEO_BOUNDS = {
  minLng: -180,
  maxLng: 180,
  minLat: -90,
  maxLat: 90,
};
const projection = geoNaturalEarth1()
  .scale(180 / Math.PI)
  .translate([0, 0]);
const pathGenerator = geoPath(projection);
const WORLD_PROJECTED_BOUNDS = pathGenerator.bounds({ type: 'Sphere' } as any);
const WORLD_PROJECTED_WIDTH = WORLD_PROJECTED_BOUNDS[1][0] - WORLD_PROJECTED_BOUNDS[0][0];
const WORLD_PROJECTED_HEIGHT = WORLD_PROJECTED_BOUNDS[1][1] - WORLD_PROJECTED_BOUNDS[0][1];
const DEFAULT_ZOOM = 1.2;

type Viewport = {
  center: { x: number; y: number };
  zoom: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clampViewport(viewport: Viewport): Viewport {
  const viewWidth = WORLD_PROJECTED_WIDTH / viewport.zoom;
  const viewHeight = WORLD_PROJECTED_HEIGHT / viewport.zoom;
  const halfWidth = viewWidth / 2;
  const halfHeight = viewHeight / 2;

  const minX = WORLD_PROJECTED_BOUNDS[0][0] + halfWidth;
  const maxX = WORLD_PROJECTED_BOUNDS[1][0] - halfWidth;
  const minY = WORLD_PROJECTED_BOUNDS[0][1] + halfHeight;
  const maxY = WORLD_PROJECTED_BOUNDS[1][1] - halfHeight;

  return {
    center: {
      x: clamp(viewport.center.x, minX, maxX),
      y: clamp(viewport.center.y, minY, maxY),
    },
    zoom: clamp(viewport.zoom, 1, 12),
  };
}

function getBbox(viewport: Viewport) {
  const viewWidth = WORLD_PROJECTED_WIDTH / viewport.zoom;
  const viewHeight = WORLD_PROJECTED_HEIGHT / viewport.zoom;

  return {
    minX: viewport.center.x - viewWidth / 2,
    maxX: viewport.center.x + viewWidth / 2,
    minY: viewport.center.y - viewHeight / 2,
    maxY: viewport.center.y + viewHeight / 2,
  };
}

function roundCoord(value: number): number {
  return Math.round(value * 100000) / 100000;
}

function normalizeBbox(bbox: { minLng: number; minLat: number; maxLng: number; maxLat: number }) {
  return {
    minLng: roundCoord(clamp(bbox.minLng, WORLD_GEO_BOUNDS.minLng, WORLD_GEO_BOUNDS.maxLng)),
    minLat: roundCoord(clamp(bbox.minLat, WORLD_GEO_BOUNDS.minLat, WORLD_GEO_BOUNDS.maxLat)),
    maxLng: roundCoord(clamp(bbox.maxLng, WORLD_GEO_BOUNDS.minLng, WORLD_GEO_BOUNDS.maxLng)),
    maxLat: roundCoord(clamp(bbox.maxLat, WORLD_GEO_BOUNDS.minLat, WORLD_GEO_BOUNDS.maxLat)),
  };
}

type TopologyLike = {
  type: 'Topology';
  objects: Record<string, { type: string }>;
};

function isTopologyLike(value: unknown): value is TopologyLike {
  if (!value || typeof value !== 'object') return false;
  const record = value as { type?: unknown; objects?: unknown };
  return record.type === 'Topology' && typeof record.objects === 'object' && record.objects !== null;
}

function toGeoJson(data: unknown): unknown {
  if (!isTopologyLike(data)) return data;
  const objectKeys = Object.keys(data.objects);
  if (objectKeys.length === 0) return null;
  const firstKey = objectKeys[0];
  return feature(data as any, data.objects[firstKey] as any);
}

function geoJsonToPath(geojson: any): string[] {
  if (!geojson) return [];
  const path = pathGenerator(geojson as any);
  if (!path) return [];
  return [path];
}

export default function MapExplorer({
  locale = 'es',
  latestPhoto = null,
}: {
  locale?: string;
  latestPhoto?: Photo | null;
}) {
  const t = getTranslations(locale);
  const numberFormatter = new Intl.NumberFormat(locale);
  const initialCenter = projection([0, 20]) || [0, 0];
  const [viewport, setViewport] = useState<Viewport>({
    center: { x: initialCenter[0], y: initialCenter[1] },
    zoom: DEFAULT_ZOOM,
  });
  const [pins, setPins] = useState<MapPin[]>([]);
  const [query, setQuery] = useState('');
  const [isLoadingPins, setIsLoadingPins] = useState(false);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [mapState, setMapState] = useState<MapState | null>(null);
  const [ready, setReady] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    startViewport: Viewport;
  } | null>(null);
  const lastPhotoRef = useRef<number | null>(null);

  const [landPaths, setLandPaths] = useState<string[]>([]);

  const bbox = useMemo(() => {
    const projected = getBbox(viewport);
    const corners = [
      [projected.minX, projected.minY],
      [projected.maxX, projected.minY],
      [projected.minX, projected.maxY],
      [projected.maxX, projected.maxY],
    ];

    const lngs: number[] = [];
    const lats: number[] = [];
    corners.forEach(([x, y]) => {
      const inverted = projection.invert?.([x, y]);
      if (!inverted) return;
      lngs.push(inverted[0]);
      lats.push(inverted[1]);
    });

    if (!lngs.length || !lats.length) {
      return normalizeBbox({
        minLng: WORLD_GEO_BOUNDS.minLng,
        minLat: WORLD_GEO_BOUNDS.minLat,
        maxLng: WORLD_GEO_BOUNDS.maxLng,
        maxLat: WORLD_GEO_BOUNDS.maxLat,
      });
    }

    return normalizeBbox({
      minLng: Math.min(...lngs),
      minLat: Math.min(...lats),
      maxLng: Math.max(...lngs),
      maxLat: Math.max(...lats),
    });
  }, [viewport]);
  const viewBox = useMemo(() => {
    const viewWidth = WORLD_PROJECTED_WIDTH / viewport.zoom;
    const viewHeight = WORLD_PROJECTED_HEIGHT / viewport.zoom;
    const minX = viewport.center.x - viewWidth / 2;
    const minY = viewport.center.y - viewHeight / 2;
    return `${minX} ${minY} ${viewWidth} ${viewHeight}`;
  }, [viewport]);
  const centerGeo = useMemo(() => {
    const inverted = projection.invert?.([viewport.center.x, viewport.center.y]);
    if (!inverted) return { lat: 0, lng: 0 };
    return { lng: inverted[0], lat: inverted[1] };
  }, [viewport.center.x, viewport.center.y]);
  const pinScale = useMemo(() => {
    const scale = 1 / Math.pow(viewport.zoom, 0.65);
    return clamp(scale, 0.25, 1.05);
  }, [viewport.zoom]);
  const activeFrame = useMemo(
    () => resolveActiveFrame(selectedPin, latestPhoto),
    [selectedPin, latestPhoto]
  );

  useEffect(() => {
    let isMounted = true;
    const loadBasemap = async () => {
      try {
        const primary = await fetch('/map/world-50m.topo.json');
        const response = primary.ok ? primary : await fetch('/map/world-110m.json');
        if (!response.ok) throw new Error('Failed to load basemap');
        const raw = await response.json();
        const geo = toGeoJson(raw);
        if (!isMounted) return;
        setLandPaths(geo ? geoJsonToPath(geo) : []);
      } catch {
        if (!isMounted) return;
        setLandPaths([]);
      }
    };

    loadBasemap();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    getMapState().then((state) => {
      if (!isMounted) return;
      if (state) {
        const centerLng = (state.bbox.minLng + state.bbox.maxLng) / 2;
        const centerLat = (state.bbox.minLat + state.bbox.maxLat) / 2;
        const projected = projection([centerLng, centerLat]) || [0, 0];
        setViewport((prev) =>
          clampViewport({
            center: { x: projected[0], y: projected[1] },
            zoom: state.zoom || prev.zoom,
          })
        );
        setMapState(state);
        lastPhotoRef.current = state.lastPhotoId;
      }
      setReady(true);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const handle = setTimeout(() => {
      saveMapState(bbox, viewport.zoom).then((state) => {
        if (state) setMapState(state);
      });
    }, 650);

    return () => clearTimeout(handle);
  }, [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat, viewport.zoom, ready]);

  useEffect(() => {
    if (!ready) return;
    let isMounted = true;
    const handle = setTimeout(() => {
      setIsLoadingPins(true);
      getMapPins(bbox, 350, query, locale)
        .then((data) => {
          if (!isMounted) return;
          setPins(data.pins);
          setIsLoadingPins(false);
        })
        .catch(() => {
          if (!isMounted) return;
          setIsLoadingPins(false);
        });
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(handle);
    };
  }, [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat, query, ready, locale]);

  useEffect(() => {
    if (!selectedPin) return;
    const stillVisible = pins.some((pin) => pin.id === selectedPin.id);
    if (!stillVisible) setSelectedPin(null);
  }, [pins, selectedPin]);

  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(async () => {
      const state = await getMapState();
      if (!state) return;
      if (lastPhotoRef.current !== state.lastPhotoId) {
        lastPhotoRef.current = state.lastPhotoId;
        setMapState(state);
        setIsLoadingPins(true);
        const data = await getMapPins(bbox, 350, query, locale);
        setPins(data.pins);
        setIsLoadingPins(false);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat, query, ready, locale]);

  const handlePointerDown = (event: PointerEvent<SVGSVGElement>) => {
    const target = event.target as Element | null;
    if (target?.closest('[data-pin="true"]')) {
      return;
    }
    const svg = svgRef.current;
    if (!svg) return;
    svg.setPointerCapture(event.pointerId);

    dragRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      startViewport: viewport,
    };
  };

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    const svg = svgRef.current;
    if (!drag || !drag.active || !svg) return;

    const rect = svg.getBoundingClientRect();
    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    const viewWidth = WORLD_PROJECTED_WIDTH / drag.startViewport.zoom;
    const viewHeight = WORLD_PROJECTED_HEIGHT / drag.startViewport.zoom;

    const lngDelta = (deltaX / rect.width) * viewWidth;
    const latDelta = (deltaY / rect.height) * viewHeight;

    const nextViewport = clampViewport({
      center: {
        x: drag.startViewport.center.x - lngDelta,
        y: drag.startViewport.center.y - latDelta,
      },
      zoom: drag.startViewport.zoom,
    });

    setViewport(nextViewport);
  };

  const handlePointerUp = (event: PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (svg) {
      svg.releasePointerCapture(event.pointerId);
    }
    if (dragRef.current) {
      dragRef.current.active = false;
    }
  };

  const handleWheel = (event: WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const direction = event.deltaY > 0 ? 1 : -1;
    const zoomFactor = direction > 0 ? 0.9 : 1.12;
    setViewport((current) => clampViewport({
      center: current.center,
      zoom: current.zoom * zoomFactor,
    }));
  };

  const zoomIn = () => {
    setViewport((current) => clampViewport({
      center: current.center,
      zoom: current.zoom * 1.2,
    }));
  };

  const zoomOut = () => {
    setViewport((current) => clampViewport({
      center: current.center,
      zoom: current.zoom / 1.2,
    }));
  };

  const pinCountLabel = t.map.pinCount(numberFormatter.format(pins.length));

  return (
    <div className="mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
      <section className="relative rounded-3xl bg-white shadow-[0_40px_120px_-80px_rgba(0,0,0,0.6)] border border-zinc-200 overflow-hidden">
        <div className="absolute inset-x-0 top-0 z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 bg-white/90 backdrop-blur border-b border-zinc-200">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.4em] text-zinc-500">
            <span>{t.map.viewport}</span>
            <span className="text-zinc-400">{pinCountLabel}</span>
            {isLoadingPins && <span className="text-zinc-400">{t.map.updating}</span>}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-1 md:flex-none">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.map.filterPlaceholder}
                className="flex-1 md:w-[280px] bg-transparent border-b border-zinc-300 focus:border-zinc-900 outline-none text-xs uppercase tracking-[0.3em] placeholder:text-zinc-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={zoomOut}
                className="h-9 w-9 rounded-full border border-zinc-300 text-zinc-500 hover:text-zinc-900 hover:border-zinc-900 transition"
              >
                -
              </button>
              <button
                type="button"
                onClick={zoomIn}
                className="h-9 w-9 rounded-full border border-zinc-300 text-zinc-500 hover:text-zinc-900 hover:border-zinc-900 transition"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="pt-16">
          <div className="relative w-full aspect-[2/1] min-h-[60vh] max-h-[85vh] lg:max-h-[70vh]">
            <svg
              ref={svgRef}
              viewBox={viewBox}
              preserveAspectRatio="xMidYMid meet"
              className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.08),transparent_55%)]"
              style={{ touchAction: 'none' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onWheel={handleWheel}
            >
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="0.3" />
                </pattern>
                <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0.6" stdDeviation="0.6" floodColor="rgba(0,0,0,0.4)" />
                </filter>
              </defs>
              <rect
                x={WORLD_PROJECTED_BOUNDS[0][0]}
                y={WORLD_PROJECTED_BOUNDS[0][1]}
                width={WORLD_PROJECTED_WIDTH}
                height={WORLD_PROJECTED_HEIGHT}
                fill="url(#grid)"
                pointerEvents="none"
              />
              {landPaths.map((path, index) => (
                <path
                  key={`land-${index}`}
                  d={path}
                  fill="rgba(0,0,0,0.06)"
                  stroke="rgba(0,0,0,0.18)"
                  strokeWidth="0.45"
                  fillRule="evenodd"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  pointerEvents="none"
                />
              ))}
              {pins.map((pin) => {
                const projected = projection([pin.coordinates.x, pin.coordinates.y]);
                if (!projected) return null;
                const [x, y] = projected;
                const isSelected = selectedPin?.id === pin.id;
                const coreRadius = (isSelected ? 1.7 : 1.05) * pinScale;
                const haloRadius = (isSelected ? 3.6 : 2.4) * pinScale;
                return (
                  <g
                    key={pin.id}
                    transform={`translate(${x}, ${y})`}
                    onClick={() => setSelectedPin(pin)}
                    onPointerDown={(event) => event.stopPropagation()}
                    onPointerUp={(event) => event.stopPropagation()}
                    style={{ cursor: 'pointer' }}
                    filter={isSelected ? 'url(#soft-shadow)' : undefined}
                    data-pin="true"
                  >
                    <circle
                      r={coreRadius}
                      fill={isSelected ? '#111111' : '#222222'}
                      stroke="white"
                      strokeWidth={0.35}
                      vectorEffect="non-scaling-stroke"
                    />
                    <circle
                      r={haloRadius}
                      fill="transparent"
                      stroke="rgba(0,0,0,0.35)"
                      strokeWidth={0.25}
                      vectorEffect="non-scaling-stroke"
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </section>

      <aside className="rounded-3xl bg-zinc-900 text-zinc-100 p-6 flex flex-col gap-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400">{t.map.mapState}</p>
          <div className="mt-3 space-y-2 text-xs text-zinc-200">
            <div className="flex items-center justify-between">
              <span>{t.map.zoom}</span>
              <span>{viewport.zoom.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t.map.center}</span>
              <span>
                {centerGeo.lat.toFixed(2)}, {centerGeo.lng.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t.map.updated}</span>
              <span>{mapState ? new Date(mapState.updatedAt).toLocaleTimeString(locale) : '--'}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-4">
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-400">{t.map.selectedFrame}</p>
          {activeFrame ? (
            <div className="mt-4 space-y-4">
              <Link href={`/photo/${activeFrame.dateSlug}`} className="block aspect-[4/3] overflow-hidden rounded-2xl border border-zinc-800 bg-black hover:border-zinc-600 transition-colors">
                <img
                  src={activeFrame.imageSrc}
                  alt={activeFrame.title}
                  className="w-full h-full object-cover filter grayscale"
                />
              </Link>
              <div>
                <h3 className="text-lg font-serif leading-tight">{activeFrame.title}</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400 mt-2">
                  {activeFrame.location || t.archive.unknownLocation}
                </p>
                <p className="text-xs text-zinc-400 mt-2">
                  {new Date(activeFrame.publishedAt).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                {activeFrame.narrative && (
                  <p className="text-sm text-zinc-300 mt-4 leading-relaxed">
                    {activeFrame.narrative}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-zinc-400">
              {t.map.selectPin}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
