
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2, Navigation, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string>('');
  const { toast } = useToast();
  
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Coordenadas de Arequipa
  const AREQUIPA_CENTER: [number, number] = [-16.409047, -71.537451];
  const AREQUIPA_BOUNDS = {
    north: -16.2,
    south: -16.6,
    east: -71.2,
    west: -71.8
  };

  // Inicializar mapa de forma simple y rápida
  const initializeMap = async () => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    try {
      console.log('🗺️ Cargando mapa rápido...');
      setMapError('');
      
      // Crear mapa básico
      const map = L.map(mapContainerRef.current, {
        center: AREQUIPA_CENTER,
        zoom: 13,
        zoomControl: true,
        attributionControl: false // Remover para cargar más rápido
      });

      // Usar tiles más rápidos
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: false
      }).addTo(map);

      mapRef.current = map;

      // Click en el mapa
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        
        if (isLocationInArequipa(lat, lng)) {
          updateMarker(lat, lng);
          await reverseGeocode(lat, lng);
        } else {
          toast({
            title: "Fuera de Arequipa",
            description: "Selecciona una ubicación dentro de Arequipa",
            variant: "destructive"
          });
        }
      });

      // Mapa listo
      map.whenReady(() => {
        console.log('✅ Mapa cargado');
        setMapReady(true);
        setMapError('');
      });

    } catch (error) {
      console.error('❌ Error cargando mapa:', error);
      setMapError('Error al cargar el mapa');
    }
  };

  const updateMarker = (lat: number, lng: number) => {
    if (!mapRef.current) return;
    
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
    }
  };

  const cleanupMap = () => {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    
    setMapReady(false);
  };

  // Effects
  useEffect(() => {
    if (isOpen && !mapReady && !mapRef.current) {
      // Delay más corto para cargar más rápido
      const timer = setTimeout(initializeMap, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      cleanupMap();
      setSearchQuery('');
      setSearchResults([]);
      setSelectedLocation(null);
    }
  }, [isOpen]);

  const isLocationInArequipa = (lat: number, lng: number): boolean => {
    return lat >= AREQUIPA_BOUNDS.south && 
           lat <= AREQUIPA_BOUNDS.north && 
           lng >= AREQUIPA_BOUNDS.west && 
           lng <= AREQUIPA_BOUNDS.east;
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`
      );
      
      const data = await response.json();
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
        
        if (!parts.some(part => part.toLowerCase().includes('arequipa'))) {
          parts.push('Arequipa');
        }
        
        address = parts.join(', ');
      }
      
      if (!address || address === 'Arequipa') {
        address = `Ubicación: ${lat.toFixed(6)}, ${lng.toFixed(6)}, Arequipa`;
      }

      setSelectedLocation({ lat, lng, address });
    } catch (error) {
      const exactAddress = `Ubicación: ${lat.toFixed(6)}, ${lng.toFixed(6)}, Arequipa`;
      setSelectedLocation({ lat, lng, address: exactAddress });
    }
  };

  const searchLocations = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const query = `${searchQuery}, Arequipa, Perú`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=pe&addressdetails=1`
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

  const selectSearchResult = async (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    await reverseGeocode(lat, lng);
    
    setSearchResults([]);
    setSearchQuery('');
    
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 17);
      updateMarker(lat, lng);
    }
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);

    try {
      if (Capacitor.isNativePlatform()) {
        const { Geolocation } = await import('@capacitor/geolocation');
        
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000
        });
        
        const { latitude, longitude } = position.coords;
        await handleLocationSuccess(latitude, longitude);
      } else {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
            enableHighAccuracy: true, 
            timeout: 10000
          });
        });
        
        const { latitude, longitude } = position.coords;
        await handleLocationSuccess(latitude, longitude);
      }
    } catch (error) {
      toast({
        title: "Error de GPS",
        description: "No se pudo obtener la ubicación",
        variant: "destructive"
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleLocationSuccess = async (latitude: number, longitude: number) => {
    if (isLocationInArequipa(latitude, longitude)) {
      if (mapRef.current) {
        mapRef.current.setView([latitude, longitude], 18);
        updateMarker(latitude, longitude);
      }
      
      await reverseGeocode(latitude, longitude);
      
      toast({
        title: "Ubicación Obtenida",
        description: "GPS activado correctamente"
      });
    } else {
      toast({
        title: "Fuera de Arequipa",
        description: "Tu ubicación está fuera de Arequipa",
        variant: "destructive"
      });
    }
  };

  const confirmSelection = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation.address);
      onClose();
      toast({
        title: "Ubicación Confirmada",
        description: "Dirección actualizada"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-4 pb-2 border-b">
            <DialogTitle>Seleccionar Ubicación en Arequipa</DialogTitle>
          </DialogHeader>
          
          <div className="p-4 pb-2 border-b">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Buscar dirección en Arequipa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchLocations()}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1 h-6 w-6"
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
                variant="default"
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
                GPS
              </Button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="px-4 pb-2">
              <div className="bg-white border rounded-lg shadow-lg max-h-32 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => selectSearchResult(result)}
                    className="w-full text-left p-3 hover:bg-blue-50 border-b last:border-b-0 text-sm"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 mt-1 text-blue-600" />
                      <p className="text-gray-900 font-medium">{result.display_name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 px-4 min-h-0">
            {mapError ? (
              <div className="w-full h-full bg-red-50 rounded-lg border-2 border-red-200 flex items-center justify-center" style={{ minHeight: '300px' }}>
                <div className="text-center p-4">
                  <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600">{mapError}</p>
                </div>
              </div>
            ) : !mapReady ? (
              <div className="w-full h-full bg-gray-100 rounded-lg border-2 flex items-center justify-center" style={{ minHeight: '300px' }}>
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600">Cargando mapa...</p>
                </div>
              </div>
            ) : (
              <div 
                ref={mapContainerRef}
                className="w-full h-full bg-gray-100 rounded-lg border-2"
                style={{ minHeight: '300px' }}
              />
            )}
          </div>

          {selectedLocation && (
            <div className="px-4 py-2 border-t bg-gray-50">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <MapPin className="h-4 w-4" />
                <span className="font-medium text-sm">Ubicación seleccionada:</span>
              </div>
              <p className="text-sm text-gray-700">{selectedLocation.address}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 p-4 pt-2 border-t">
            <Button variant="outline" onClick={onClose} size="sm">
              Cancelar
            </Button>
            <Button 
              onClick={confirmSelection}
              disabled={!selectedLocation}
              size="sm"
            >
              Confirmar Ubicación
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSelector;
