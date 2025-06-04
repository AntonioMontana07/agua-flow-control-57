
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
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);

  // Cargar Leaflet cuando se abre el diálogo (solo una vez)
  useEffect(() => {
    if (isOpen && !mapLoaded && !isInitializing) {
      setIsInitializing(true);
      loadLeafletMap();
    }
  }, [isOpen, mapLoaded, isInitializing]);

  // Cargar ubicación actual cuando hay currentValue y el mapa está listo
  useEffect(() => {
    if (isOpen && currentValue && mapLoaded && mapInstanceRef.current && !selectedLocation) {
      loadCurrentLocationFromAddress();
    }
  }, [isOpen, currentValue, mapLoaded, selectedLocation]);

  const loadCurrentLocationFromAddress = async () => {
    if (!currentValue?.trim() || !mapInstanceRef.current) return;
    
    try {
      console.log('Geocodificando dirección actual:', currentValue);
      // Buscar con mayor precisión incluyendo Perú y Arequipa
      const queries = [
        `${currentValue}, Arequipa, Perú`,
        `${currentValue}, Arequipa, Peru`,
        `${currentValue}, Peru`
      ];

      for (const query of queries) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1&countrycodes=pe&accept-language=es&bounded=1&viewbox=-71.8,-16.2,-71.2,-16.6`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const result = data[0];
            const lat = parseFloat(result.lat);
            const lng = parseFloat(result.lon);
            
            console.log('Ubicación encontrada:', lat, lng);
            
            if (mapInstanceRef.current && markerRef.current && window.L) {
              mapInstanceRef.current.setView([lat, lng], 16);
              markerRef.current.setLatLng([lat, lng]);
            }
            
            setSelectedLocation({ lat, lng, address: currentValue });
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error al geocodificar dirección actual:', error);
    }
  };

  const loadLeafletMap = () => {
    // Verificar si Leaflet ya está cargado
    if (window.L && !mapInstanceRef.current) {
      console.log('Leaflet ya está cargado, inicializando mapa...');
      setMapLoaded(true);
      initTimeoutRef.current = setTimeout(initializeMap, 100);
      return;
    }

    if (window.L && mapInstanceRef.current) {
      console.log('Mapa ya inicializado');
      setMapLoaded(true);
      setIsInitializing(false);
      return;
    }

    console.log('Cargando Leaflet...');

    // Cargar CSS de Leaflet si no existe
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      cssLink.crossOrigin = '';
      document.head.appendChild(cssLink);
    }

    // Cargar JavaScript de Leaflet si no existe
    if (!document.querySelector('script[src*="leaflet.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.onload = () => {
        console.log('Leaflet cargado exitosamente');
        setMapLoaded(true);
        initTimeoutRef.current = setTimeout(initializeMap, 100);
      };
      script.onerror = () => {
        console.error('Error al cargar Leaflet');
        setIsInitializing(false);
        toast({
          title: "Error al cargar el mapa",
          description: "No se pudo cargar el componente del mapa",
          variant: "destructive"
        });
      };
      document.head.appendChild(script);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.L || mapInstanceRef.current) {
      console.log('No se puede inicializar el mapa:', {
        hasMapRef: !!mapRef.current,
        hasLeaflet: !!window.L,
        hasMapInstance: !!mapInstanceRef.current
      });
      setIsInitializing(false);
      return;
    }

    try {
      console.log('Inicializando mapa...');
      
      // Coordenadas del centro de Arequipa, Perú
      const arequipaCenter: [number, number] = [-16.409047, -71.537451];

      const map = window.L.map(mapRef.current, {
        preferCanvas: true,
        zoomControl: true,
        maxZoom: 19,
        minZoom: 10
      }).setView(arequipaCenter, 13);

      // Agregar capa de OpenStreetMap optimizada
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
        detectRetina: true,
        updateWhenIdle: true,
        keepBuffer: 4,
        maxNativeZoom: 18
      }).addTo(map);

      mapInstanceRef.current = map;

      // Agregar marcador arrastrable
      const marker = window.L.marker(arequipaCenter, {
        draggable: true,
        riseOnHover: true
      }).addTo(map);

      markerRef.current = marker;

      // Evento cuando se arrastra el marcador
      marker.on('dragend', (e: any) => {
        const position = e.target.getLatLng();
        reverseGeocode(position.lat, position.lng);
      });

      // Evento click en el mapa
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        reverseGeocode(lat, lng);
      });

      // Evento cuando el mapa termina de cargar
      map.whenReady(() => {
        console.log('Mapa listo');
        setIsInitializing(false);
        map.invalidateSize();
      });

      console.log('Mapa inicializado correctamente');
    } catch (error) {
      console.error('Error inicializando mapa:', error);
      setIsInitializing(false);
      toast({
        title: "Error en el mapa",
        description: "No se pudo inicializar el mapa correctamente",
        variant: "destructive"
      });
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      console.log('Geocodificación inversa para:', lat, lng);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es&zoom=18`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        // Construir dirección más precisa
        let address = '';
        if (data.address) {
          const parts = [];
          if (data.address.house_number && data.address.road) {
            parts.push(`${data.address.road} ${data.address.house_number}`);
          } else if (data.address.road) {
            parts.push(data.address.road);
          }
          if (data.address.neighbourhood || data.address.suburb) {
            parts.push(data.address.neighbourhood || data.address.suburb);
          }
          if (data.address.city_district || data.address.city) {
            parts.push(data.address.city_district || data.address.city);
          }
          
          address = parts.length > 0 ? parts.join(', ') : data.display_name;
        } else {
          address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }
        
        console.log('Dirección encontrada:', address);
        setSelectedLocation({ lat, lng, address });
      } else {
        setSelectedLocation({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
      }
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
      setSelectedLocation({ lat, lng, address: `${lat.toFixed(6)}, ${lng.toFixed(6)}` });
    }
  };

  const searchLocations = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      console.log('Buscando:', searchQuery);
      
      // Buscar con mayor precisión en Arequipa
      const query = `${searchQuery}, Arequipa, Perú`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&addressdetails=1&countrycodes=pe&accept-language=es&bounded=1&viewbox=-71.8,-16.2,-71.2,-16.6&extratags=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('Resultados de búsqueda:', data.length);
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
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
    
    console.log('Seleccionando resultado:', lat, lng);
    
    if (mapInstanceRef.current && markerRef.current && window.L) {
      mapInstanceRef.current.setView([lat, lng], 17);
      markerRef.current.setLatLng([lat, lng]);
    }
    
    setSelectedLocation({ lat, lng, address: result.display_name });
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
        console.log('Ubicación actual obtenida:', latitude, longitude);
        
        if (mapInstanceRef.current && markerRef.current && window.L) {
          mapInstanceRef.current.setView([latitude, longitude], 17);
          markerRef.current.setLatLng([latitude, longitude]);
        }
        
        reverseGeocode(latitude, longitude);
        setIsGettingLocation(false);
        
        toast({
          title: "Ubicación obtenida",
          description: "Tu ubicación actual ha sido detectada",
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsGettingLocation(false);
        
        let errorMessage = "No se pudo obtener la ubicación";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permisos de ubicación denegados. Por favor, permite el acceso a tu ubicación.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Ubicación no disponible";
            break;
          case error.TIMEOUT:
            errorMessage = "Tiempo de espera agotado";
            break;
        }
        
        toast({
          title: "Error de ubicación",
          description: errorMessage,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000
      }
    );
  };

  const confirmSelection = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation.address);
      onClose();
      toast({
        title: "Ubicación seleccionada",
        description: "Dirección actualizada correctamente"
      });
    }
  };

  // Limpiar al cerrar
  const handleClose = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedLocation(null);
    onClose();
  };

  // Invalidar el tamaño del mapa cuando se abre el diálogo
  useEffect(() => {
    if (isOpen && mapInstanceRef.current && mapLoaded && !isInitializing) {
      const timer = setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mapLoaded, isInitializing]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] max-w-[95vw] max-h-[95vh] p-0">
        <div className="flex flex-col h-[80vh]">
          {/* Header */}
          <DialogHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle>Seleccionar Ubicación</DialogTitle>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {/* Search Bar */}
          <div className="px-4 pb-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Buscar dirección en Arequipa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchLocations()}
                  className="pr-10"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={searchLocations}
                  disabled={isSearching || !searchQuery.trim()}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="gap-2"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                Mi ubicación
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="px-4 pb-2">
              <div className="bg-white border rounded-lg shadow-lg max-h-32 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => selectSearchResult(result)}
                    className="w-full text-left p-2 hover:bg-gray-50 border-b last:border-b-0 text-sm"
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{result.display_name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Map Container */}
          <div className="flex-1 px-4">
            <div className="relative w-full h-full bg-gray-200 rounded-lg overflow-hidden">
              {!mapLoaded || isInitializing ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {isInitializing ? 'Inicializando mapa...' : 'Cargando mapa...'}
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
            <div className="px-4 py-2 bg-muted/30">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Ubicación seleccionada:</p>
                  <p className="text-xs text-muted-foreground break-words">
                    {selectedLocation.address}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 p-4 pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmSelection}
              disabled={!selectedLocation}
              className="bg-primary hover:bg-primary/90"
            >
              Confirmar Ubicación
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Declarar tipos para Leaflet
declare global {
  interface Window {
    L: any;
  }
}

export default LocationSelector;
