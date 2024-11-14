import { Feature, Geometry } from 'geojson';
import { geoPath, geoMercator } from 'd3-geo';

// Country code mappings remain the same
export const countryCodeMap: { [key: string]: string } = {
  // ... (keep existing country code mappings)
};

export const nameToCodeMap: { [key: string]: string } = Object.entries(countryCodeMap)
  .reduce((acc, [code, name]) => ({ ...acc, [name]: code }), {});

export const isMainTerritory = (geo: any): boolean => {
  if (!geo?.properties) return true;
  const { name, region } = geo.properties;
  
  switch (name) {
    case "France":
      return region === "Europe";
    case "United States":
      return region === "North America";
    case "Russia":
      return region === "Europe" || region === "Asia";
    case "Netherlands":
      return region === "Europe";
    default:
      return true;
  }
};

// Constants for projection configuration
const BASE_SCALE = 100;
const WORLD_WIDTH = 960;
const WORLD_HEIGHT = 500;
const DEFAULT_CENTER: [number, number] = [0, 20];

interface Bounds {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const getBoundingBox = (feature: Feature<Geometry>): Bounds | null => {
  try {
    const projection = geoMercator().scale(BASE_SCALE);
    const path = geoPath().projection(projection);
    const bounds = path.bounds(feature);
    
    return {
      x0: bounds[0][0],
      y0: bounds[0][1],
      x1: bounds[1][0],
      y1: bounds[1][1]
    };
  } catch (error) {
    console.error('Error calculating bounding box:', error);
    return null;
  }
};

const calculateOptimalScale = (bounds: Bounds, padding = 0.1): number => {
  const dx = bounds.x1 - bounds.x0;
  const dy = bounds.y1 - bounds.y0;
  const containerAspectRatio = WORLD_WIDTH / WORLD_HEIGHT;
  const boundingBoxAspectRatio = dx / dy;

  let scale;
  if (boundingBoxAspectRatio > containerAspectRatio) {
    // Width is the limiting factor
    scale = (WORLD_WIDTH * (1 - padding)) / dx;
  } else {
    // Height is the limiting factor
    scale = (WORLD_HEIGHT * (1 - padding)) / dy;
  }

  return scale * BASE_SCALE;
};

const calculateCenter = (bounds: Bounds): [number, number] => {
  const projection = geoMercator().scale(BASE_SCALE);
  
  const centerX = (bounds.x0 + bounds.x1) / 2;
  const centerY = (bounds.y0 + bounds.y1) / 2;
  
  // Convert pixel coordinates back to geographic coordinates
  const center = projection.invert!([centerX, centerY]);
  return [center[0], center[1]];
};

export const calculateZoomAndCenter = (feature: Feature<Geometry>): { coordinates: [number, number]; zoom: number } => {
  try {
    if (!feature?.geometry || !feature.properties?.name) {
      return { coordinates: DEFAULT_CENTER, zoom: 1 };
    }

    const bounds = getBoundingBox(feature);
    if (!bounds) {
      return { coordinates: DEFAULT_CENTER, zoom: 1 };
    }

    const optimalScale = calculateOptimalScale(bounds);
    const center = calculateCenter(bounds);

    // Convert scale to zoom level (log base 2 of scale ratio)
    const zoom = Math.log2(optimalScale / BASE_SCALE);

    // Clamp zoom level between 1 and 8
    const clampedZoom = Math.min(Math.max(zoom, 1), 8);

    // Adjust center based on country size and position
    const adjustedCenter: [number, number] = [
      center[0],
      // Adjust latitude to account for Mercator projection distortion
      center[1] + (Math.abs(center[1]) > 50 ? Math.sign(center[1]) * 10 : 0)
    ];

    return {
      coordinates: adjustedCenter,
      zoom: clampedZoom
    };
  } catch (error) {
    console.error('Error calculating zoom and center:', error);
    return { coordinates: DEFAULT_CENTER, zoom: 1 };
  }
};