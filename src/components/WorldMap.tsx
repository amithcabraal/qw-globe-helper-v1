import React, { useState, memo, useCallback, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import MapControls from './MapControls';
import CountrySelect from './CountrySelect';
import { Loader2, AlertCircle } from 'lucide-react';
import { countryCodeMap, nameToCodeMap, isMainTerritory, calculateZoomAndCenter } from '../utils/mapHelpers';
import type { Feature, Geometry } from 'geojson';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

const WorldMap = () => {
  const [position, setPosition] = useState({ coordinates: [0, 20], zoom: 1 });
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapData, setMapData] = useState<any>(null);
  const [showAllCountries, setShowAllCountries] = useState(true);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(geoUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to load map data: ${response.statusText}`);
        }
        
        const data = await response.json();
        setMapData(data);

        // Check for country code in URL
        const countryCode = window.location.pathname.slice(1).toUpperCase();
        if (countryCode && countryCodeMap[countryCode]) {
          handleSelectCountry(countryCodeMap[countryCode]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load map data');
        console.error('Error loading map data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapData();
  }, []);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setPosition(pos => ({
      ...pos,
      zoom: Math.min(Math.max(pos.zoom + (direction === 'in' ? 0.5 : -0.5), 1), 8)
    }));
  }, []);

  const handleResetMap = useCallback(() => {
    setPosition({ coordinates: [0, 20], zoom: 1 });
    setShowAllCountries(true);
    setSelectedCountry(null);
    window.history.pushState({}, '', '/');
  }, []);

  const handleSelectCountry = useCallback((countryName: string) => {
    if (!mapData) return;

    try {
      const feature = mapData.objects.countries.geometries.find((geo: any) => 
        geo.properties.name === countryName && isMainTerritory(geo)
      );

      if (feature) {
        const featureObj: Feature<Geometry> = {
          type: 'Feature',
          geometry: feature.geometry,
          properties: feature.properties
        };

        const newPosition = calculateZoomAndCenter(featureObj);
        
        // Apply position change with animation
        setPosition(prev => ({
          ...prev,
          coordinates: newPosition.coordinates,
          zoom: newPosition.zoom
        }));
        
        setShowAllCountries(false);
        setSelectedCountry(countryName);

        const countryCode = nameToCodeMap[countryName];
        if (countryCode) {
          window.history.pushState({}, '', `/${countryCode.toLowerCase()}`);
        }
      }
    } catch (error) {
      console.error('Error selecting country:', error);
    }
  }, [mapData]);

  if (isLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white/80">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          <p className="text-gray-600 font-medium">Loading World Map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white/80">
        <div className="flex flex-col items-center gap-3 text-red-500">
          <AlertCircle className="w-12 h-12" />
          <p className="font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <CountrySelect
        selectedCountry={selectedCountry}
        onSelectCountry={handleSelectCountry}
      />
      
      <MapControls
        zoom={position.zoom}
        onZoom={handleZoom}
        selectedCountry={selectedCountry}
        showAllCountries={showAllCountries}
        onToggleCountries={() => setShowAllCountries(!showAllCountries)}
        onResetMap={handleResetMap}
      />
      
      <div className="w-full h-full border-2 border-gray-200 rounded-lg overflow-hidden">
        {mapData && (
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 100,
              center: [0, 20]
            }}
          >
            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates}
              onMoveEnd={setPosition}
              maxZoom={8}
              minZoom={1}
            >
              <Geographies geography={mapData}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const isSelected = 
                      geo.properties.name === selectedCountry && 
                      isMainTerritory(geo);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={isSelected ? "#3B82F6" : showAllCountries ? "#E5E7EB" : "#ffffff"}
                        stroke={isSelected ? "#3B82F6" : showAllCountries ? "#9CA3AF" : "#ffffff"}
                        strokeWidth={0.5}
                        style={{
                          default: {
                            outline: "none",
                            transition: "all 250ms",
                          },
                          hover: {
                            fill: isSelected ? "#2563EB" : showAllCountries ? "#D1D5DB" : "#ffffff",
                            outline: "none",
                            cursor: "pointer"
                          },
                          pressed: {
                            fill: isSelected ? "#1D4ED8" : showAllCountries ? "#9CA3AF" : "#ffffff",
                            outline: "none"
                          }
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        )}
      </div>
    </div>
  );
};

export default memo(WorldMap);