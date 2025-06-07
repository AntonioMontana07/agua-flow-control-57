
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2, Navigation } from 'lucide-react';
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
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [mapReady, setMapReady] = useState(false);
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

  // Inicializar mapa
  const initializeMap = () => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    try {
      console.log('🗺️ Inicializando mapa...');
      
      const map = L.map(mapContainerRef.current, {
        center: AREQUIPA_CENTER,
        zoom: 13,
        zoomControl: true,
        attributionControl: true
      });

      // Tiles de OpenStreetMap (gratuito)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapRef.current = map;

      // Click en el mapa para seleccionar ubicación
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        
        if (isLocationInArequipa(lat, lng)) {
          updateMarker(lat, lng);
          
          // Obtener dirección usando Nominatim (gratuito)
          try {
            const address = await reverseGeocode(lat, lng);
            setSelectedLocation({ lat, lng, address });
          } catch (error) {
            console.error('Error al obtener dirección:', error);
            const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}, Arequipa`;
            setSelectedLocation({ lat, lng, address: fallbackAddress });
          }
        } else {
          toast({
            title: "Fuera de Arequipa",
            description: "Selecciona una ubicación dentro de Arequipa",
            variant: "destructive"
          });
        }
      });

      // Mapa listo
      setTimeout(() => {
        map.invalidateSize();
        setMapReady(true);
        console.log('✅ Mapa cargado correctamente');
      }, 100);

    } catch (error) {
      console.error('❌ Error cargando mapa:', error);
      setMapReady(true);
    }
  };

  // Actualizar marcador en el mapa
  const updateMarker = (lat: number, lng: number) => {
    if (!mapRef.current) return;
    
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
    }
    
    mapRef.current.setView([lat, lng], 16);
  };

  // Limpiar mapa
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

  // Verificar si está en Arequipa
  const isLocationInArequipa = (lat: number, lng: number): boolean => {
    return lat >= AREQUIPA_BOUNDS.south && 
           lat <= AREQUIPA_BOUNDS.north && 
           lng >= AREQUIPA_BOUNDS.west && 
           lng <= AREQUIPA_BOUNDS.east;
  };

  // Geocodificación inversa usando Nominatim (gratuito)
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.display_name) {
      return data.display_name;
    } else {
      throw new Error('No se pudo obtener la dirección');
    }
  };

  // Búsqueda de ubicaciones usando Nominatim
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Arequipa, Peru')}&limit=5&accept-language=es`;
      
      const response = await fetch(url);
      const results = await response.json();
      
      if (results && results.length > 0) {
        const result = results[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        if (isLocationInArequipa(lat, lng)) {
          if (mapRef.current) {
            updateMarker(lat, lng);
          }
          
          setSelectedLocation({ 
            lat, 
            lng, 
            address: result.display_name 
          });
          
          toast({
            title: "Ubicación encontrada",
            description: "Ubicación encontrada en Arequipa"
          });
        } else {
          toast({
            title: "Fuera de Arequipa",
            description: "La búsqueda no encontró resultados en Arequipa",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Sin resultados",
          description: "No se encontraron resultados para la búsqueda",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      toast({
        title: "Error de búsqueda",
        description: "No se pudo realizar la búsqueda",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
      setSearchQuery('');
    }
  };

  // Obtener ubicación actual del GPS
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
      console.error('Error GPS:', error);
      toast({
        title: "Error de GPS",
        description: "No se pudo obtener la ubicación actual",
        variant: "destructive"
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Manejar ubicación exitosa del GPS
  const handleLocationSuccess = async (latitude: number, longitude: number) => {
    if (isLocationInArequipa(latitude, longitude)) {
      if (mapRef.current) {
        updateMarker(latitude, longitude);
      }
      
      try {
        const address = await reverseGeocode(latitude, longitude);
        setSelectedLocation({ lat: latitude, lng: longitude, address });
        
        toast({
          title: "Ubicación Obtenida",
          description: "GPS activado correctamente"
        });
      } catch (error) {
        console.error('Error al obtener dirección:', error);
        const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}, Arequipa`;
        setSelectedLocation({ lat: latitude, lng: longitude, address: fallbackAddress });
      }
    } else {
      toast({
        title: "Fuera de Arequipa",
        description: "Tu ubicación está fuera de Arequipa",
        variant: "destructive"
      });
    }
  };

  // Confirmar selección
  const confirmSelection = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation.address);
      onClose();
      toast({
        title: "Ubicación Confirmada",
        description: "Dirección actualizada correctamente"
      });
    }
  };

  // Effect para inicializar mapa
  useEffect(() => {
    if (isOpen) {
      // Pequeño delay para asegurar que el DOM esté listo
      const timer = setTimeout(() => {
        initializeMap();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Effect para limpiar al cerrar
  useEffect(() => {
    if (!isOpen) {
      cleanupMap();
      setSearchQuery('');
      setSelectedLocation(null);
    }
  }, [isOpen]);

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
                  onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-1 top-1 h-6 w-6"
                  onClick={searchLocation}
                  disabled={!searchQuery.trim() || isSearching}
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
            <p className="text-xs text-muted-foreground mt-1">
              💡 Busca una dirección, usa GPS o haz clic en el mapa para seleccionar ubicación
            </p>
          </div>

          <div className="flex-1 px-4 min-h-0">
            {!mapReady ? (
              <div className="w-full h-full bg-gray-100 rounded-lg border-2 flex items-center justify-center" style={{ minHeight: '400px' }}>
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600">Cargando mapa de Arequipa...</p>
                </div>
              </div>
            ) : (
              <div 
                ref={mapContainerRef}
                className="w-full h-full bg-gray-100 rounded-lg border-2"
                style={{ minHeight: '400px' }}
              />
            )}
          </div>

          {selectedLocation && (
            <div className="px-4 py-2 border-t bg-gray-50">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <MapPin className="h-4 w-4" />
                <span className="font-medium text-sm">Ubicación seleccionada:</span>
              </div>
              <p className="text-sm text-gray-700 break-words">{selectedLocation.address}</p>
              <p className="text-xs text-gray-500 mt-1">
                Coordenadas: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
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
              className="bg-green-600 hover:bg-green-700"
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
