
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2, X, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (address: string) => void;
  currentValue?: string;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: any;
}

interface MapLocation {
  lat: number;
  lng: number;
  address: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  currentValue
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const { toast } = useToast();

  // Coordenadas y límites de Arequipa
  const AREQUIPA_CENTER: [number, number] = [-16.409047, -71.537451];
  const AREQUIPA_BOUNDS = {
    north: -16.2,
    south: -16.6,
    east: -71.2,
    west: -71.8
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Cargar mapa cuando se abre
  useEffect(() => {
    if (isOpen && !mapLoaded && !isInitializing) {
      loadLeafletMap();
    }
  }, [isOpen]);

  // Cargar ubicación actual cuando hay currentValue
  useEffect(() => {
    if (isOpen && currentValue && mapLoaded && !selectedLocation) {
      geocodeCurrentAddress();
    }
  }, [isOpen, currentValue, mapLoaded]);

  const geocodeCurrentAddress = async () => {
    if (!currentValue?.trim()) return;
    
    try {
      const query = `${currentValue}, Arequipa, Perú`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(query)}&` +
        `limit=1&addressdetails=1&countrycodes=pe&` +
        `viewbox=${AREQUIPA_BOUNDS.west},${AREQUIPA_BOUNDS.north},${AREQUIPA_BOUNDS.east},${AREQUIPA_BOUNDS.south}&` +
        `bounded=1`
      );
      
      const data = await response.json();
      if (data?.[0]) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        if (isLocationInArequipa(lat, lng)) {
          updateMapLocation(lat, lng, currentValue);
        }
      }
    } catch (error) {
      console.error('Error geocodificando:', error);
    }
  };

  const isLocationInArequipa = (lat: number, lng: number): boolean => {
    return lat >= AREQUIPA_BOUNDS.south && 
           lat <= AREQUIPA_BOUNDS.north && 
           lng >= AREQUIPA_BOUNDS.west && 
           lng <= AREQUIPA_BOUNDS.east;
  };

  const loadLeafletMap = async () => {
    if (window.L) {
      initializeMap();
      return;
    }

    setIsInitializing(true);

    try {
      // Cargar CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(cssLink);
      }

      // Cargar JS
      if (!document.querySelector('script[src*="leaflet.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          setMapLoaded(true);
          setTimeout(initializeMap, 100);
        };
        script.onerror = () => {
          setIsInitializing(false);
          toast({
            title: "Error al cargar mapa",
            description: "No se pudo cargar Leaflet",
            variant: "destructive"
          });
        };
        document.head.appendChild(script);
      }
    } catch (error) {
      setIsInitializing(false);
      toast({
        title: "Error",
        description: "Error al cargar el mapa",
        variant: "destructive"
      });
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.L || mapInstanceRef.current) return;

    try {
      const map = window.L.map(mapRef.current, {
        preferCanvas: true,
        zoomControl: true,
        maxZoom: 19,
        minZoom: 12
      }).setView(AREQUIPA_CENTER, 14);

      // Tiles optimizados
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
        detectRetina: true
      }).addTo(map);

      // Restringir vista a Arequipa
      const bounds = window.L.latLngBounds(
        [AREQUIPA_BOUNDS.south, AREQUIPA_BOUNDS.west],
        [AREQUIPA_BOUNDS.north, AREQUIPA_BOUNDS.east]
      );
      map.setMaxBounds(bounds);

      mapInstanceRef.current = map;

      // Marcador
      const marker = window.L.marker(AREQUIPA_CENTER, {
        draggable: true
      }).addTo(map);
      markerRef.current = marker;

      // Eventos
      marker.on('dragend', (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        if (isLocationInArequipa(lat, lng)) {
          reverseGeocode(lat, lng);
        } else {
          marker.setLatLng(AREQUIPA_CENTER);
          toast({
            title: "Ubicación fuera de Arequipa",
            description: "Solo se permiten ubicaciones en Arequipa",
            variant: "destructive"
          });
        }
      });

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        if (isLocationInArequipa(lat, lng)) {
          marker.setLatLng([lat, lng]);
          reverseGeocode(lat, lng);
        } else {
          toast({
            title: "Ubicación fuera de Arequipa",
            description: "Solo se permiten ubicaciones en Arequipa",
            variant: "destructive"
          });
        }
      });

      map.whenReady(() => {
        setMapLoaded(true);
        setIsInitializing(false);
        map.invalidateSize();
      });

    } catch (error) {
      setIsInitializing(false);
      toast({
        title: "Error",
        description: "No se pudo inicializar el mapa",
        variant: "destructive"
      });
    }
  };

  const updateMapLocation = (lat: number, lng: number, address: string) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16);
      markerRef.current.setLatLng([lat, lng]);
    }
    setSelectedLocation({ lat, lng, address });
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
        `format=json&lat=${lat}&lon=${lng}&` +
        `addressdetails=1&zoom=18&accept-language=es`
      );
      
      const data = await response.json();
      let address = '';

      if (data.address) {
        const parts = [];
        
        // Construir dirección precisa
        if (data.address.house_number && data.address.road) {
          parts.push(`${data.address.road} ${data.address.house_number}`);
        } else if (data.address.road) {
          parts.push(data.address.road);
        }
        
        if (data.address.neighbourhood) {
          parts.push(data.address.neighbourhood);
        } else if (data.address.suburb) {
          parts.push(data.address.suburb);
        }
        
        if (data.address.city_district) {
          parts.push(data.address.city_district);
        }
        
        // Agregar "Arequipa" si no está presente
        if (!parts.some(part => part.toLowerCase().includes('arequipa'))) {
          parts.push('Arequipa');
        }
        
        address = parts.join(', ');
      } else {
        address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }

      setSelectedLocation({ lat, lng, address });
    } catch (error) {
      setSelectedLocation({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
    }
  };

  const searchLocations = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const query = `${searchQuery}, Arequipa, Perú`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(query)}&` +
        `limit=5&addressdetails=1&countrycodes=pe&` +
        `viewbox=${AREQUIPA_BOUNDS.west},${AREQUIPA_BOUNDS.north},${AREQUIPA_BOUNDS.east},${AREQUIPA_BOUNDS.south}&` +
        `bounded=1`
      );
      
      const data = await response.json();
      const arequipaResults = data.filter((result: SearchResult) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        return isLocationInArequipa(lat, lng);
      });
      
      setSearchResults(arequipaResults);
    } catch (error) {
      toast({
        title: "Error de búsqueda",
        description: "No se pudo realizar la búsqueda",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    updateMapLocation(lat, lng, result.display_name);
    setSearchResults([]);
    setSearchQuery('');
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocalización no disponible",
        description: "Tu dispositivo no soporta geolocalización",
        variant: "destructive"
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        if (isLocationInArequipa(latitude, longitude)) {
          updateMapLocation(latitude, longitude, 'Mi ubicación actual');
          reverseGeocode(latitude, longitude);
          toast({
            title: "Ubicación obtenida",
            description: "Ubicación actual detectada"
          });
        } else {
          toast({
            title: "Fuera de Arequipa",
            description: "Tu ubicación actual está fuera de Arequipa",
            variant: "destructive"
          });
        }
        setIsGettingLocation(false);
      },
      () => {
        setIsGettingLocation(false);
        toast({
          title: "Error de ubicación",
          description: "No se pudo obtener tu ubicación",
          variant: "destructive"
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const confirmSelection = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation.address);
      onClose();
      toast({
        title: "Ubicación confirmada",
        description: "Dirección actualizada correctamente"
      });
    }
  };

  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedLocation(null);
    onClose();
  };

  // Invalidar tamaño del mapa al abrir
  useEffect(() => {
    if (isOpen && mapInstanceRef.current && mapLoaded) {
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 300);
    }
  }, [isOpen, mapLoaded]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-3 sm:p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base sm:text-lg">Seleccionar Ubicación en Arequipa</DialogTitle>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {/* Search Bar */}
          <div className="p-3 sm:p-4 pb-2 border-b">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Buscar dirección en Arequipa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchLocations()}
                  className="pr-10 text-sm"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1 h-6 w-6 sm:h-8 sm:w-8"
                  onClick={searchLocations}
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? (
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="gap-2 text-xs sm:text-sm px-2 sm:px-3"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Navigation className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
                <span className="hidden sm:inline">Mi ubicación</span>
                <span className="sm:hidden">GPS</span>
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="px-3 sm:px-4 pb-2">
              <div className="bg-white border rounded-lg shadow-lg max-h-24 sm:max-h-32 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => selectSearchResult(result)}
                    className="w-full text-left p-2 hover:bg-gray-50 border-b last:border-b-0 text-xs sm:text-sm"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{result.display_name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Map Container */}
          <div className="flex-1 px-3 sm:px-4 min-h-0">
            <div className="relative w-full h-full bg-gray-200 rounded-lg overflow-hidden">
              {!mapLoaded || isInitializing ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Cargando mapa...
                    </p>
                  </div>
                </div>
              ) : (
                <div ref={mapRef} className="w-full h-full" />
              )}
            </div>
          </div>

          {/* Selected Location Info */}
          {selectedLocation && (
            <div className="px-3 sm:px-4 py-2 bg-muted/30 border-t">
              <div className="flex items-start gap-2">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mt-1 text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium">Ubicación seleccionada:</p>
                  <p className="text-xs text-muted-foreground break-words">
                    {selectedLocation.address}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 p-3 sm:p-4 pt-2 border-t">
            <Button variant="outline" onClick={handleClose} size="sm">
              Cancelar
            </Button>
            <Button 
              onClick={confirmSelection}
              disabled={!selectedLocation}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

declare global {
  interface Window {
    L: any;
  }
}

export default LocationSelector;
