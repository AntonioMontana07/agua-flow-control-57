import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationData {
  address: string;
  lat: number;
  lng: number;
}

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (locationData: LocationData) => void;
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
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const { toast } = useToast();
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Inicializar mapa con Leaflet
  const initializeMap = async () => {
    if (!mapContainerRef.current || mapRef.current) return;

    console.log('🗺️ Inicializando mapa Leaflet...');
    setIsLoadingMap(true);

    try {
      // Obtener ubicación actual del usuario
      const position = await getCurrentPosition();
      const { latitude: lat, longitude: lng } = position.coords;

      // Crear mapa centrado en la ubicación actual
      const map = L.map(mapContainerRef.current).setView([lat, lng], 15);
      mapRef.current = map;

      // Agregar capa de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Agregar marcador en la ubicación actual
      const currentLocationMarker = L.marker([lat, lng])
        .addTo(map)
        .bindPopup('📍 Tu ubicación actual')
        .openPopup();

      markerRef.current = currentLocationMarker;

      // Obtener dirección de la ubicación actual
      const address = await reverseGeocode(lat, lng);
      setSelectedLocation({ lat, lng, address });

      // Event listener para clicks en el mapa
      map.on('click', async (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        console.log(`🎯 Click en mapa: ${clickLat}, ${clickLng}`);

        try {
          // Mover marcador a la nueva ubicación
          if (markerRef.current) {
            markerRef.current.setLatLng([clickLat, clickLng]);
          } else {
            markerRef.current = L.marker([clickLat, clickLng]).addTo(map);
          }

          // Obtener dirección de la nueva ubicación
          const newAddress = await reverseGeocode(clickLat, clickLng);
          setSelectedLocation({ lat: clickLat, lng: clickLng, address: newAddress });

          toast({
            title: "📍 Nueva ubicación seleccionada",
            description: "Ubicación actualizada en el mapa"
          });
        } catch (error) {
          console.error('❌ Error al procesar click:', error);
        }
      });

      console.log('✅ Mapa Leaflet inicializado correctamente');
      toast({
        title: "🗺️ Mapa cargado",
        description: "Ubicación actual detectada"
      });

    } catch (error) {
      console.error('❌ Error al inicializar mapa:', error);
      
      // Fallback: mapa centrado en una ubicación por defecto
      const defaultLat = -12.0464;
      const defaultLng = -77.0428; // Lima, Perú
      
      const map = L.map(mapContainerRef.current).setView([defaultLat, defaultLng], 10);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      toast({
        title: "⚠️ Ubicación no disponible",
        description: "Mapa cargado en ubicación por defecto. Haz clic para seleccionar",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMap(false);
    }
  };

  // Obtener posición GPS del usuario
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        { 
          enableHighAccuracy: true, 
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  // Geocodificación inversa usando Nominatim
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'BIOX LocationSelector/1.0' } }
      );
      
      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error('❌ Error en geocodificación inversa:', error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  // Búsqueda de ubicaciones
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    console.log(`🔍 Buscando: "${searchQuery}"`);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&addressdetails=1`,
        { headers: { 'User-Agent': 'BIOX LocationSelector/1.0' } }
      );
      
      const results = await response.json();
      
      if (results && results.length > 0) {
        const result = results[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        // Centrar mapa en el resultado
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 16);
          
          // Mover marcador
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
          }
        }
        
        setSelectedLocation({ 
          lat, 
          lng, 
          address: result.display_name 
        });
        
        toast({
          title: "✅ Ubicación encontrada",
          description: "Resultado mostrado en el mapa"
        });
      } else {
        toast({
          title: "❌ Sin resultados",
          description: "No se encontraron resultados para la búsqueda",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Error en búsqueda:', error);
      toast({
        title: "❌ Error de búsqueda",
        description: "No se pudo realizar la búsqueda",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
      setSearchQuery('');
    }
  };

  // Obtener ubicación GPS actual
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    console.log('📱 Obteniendo ubicación GPS...');

    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      // Centrar mapa en ubicación actual
      if (mapRef.current) {
        mapRef.current.setView([latitude, longitude], 16);
        
        // Mover marcador
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        } else {
          markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);
        }
      }
      
      const address = await reverseGeocode(latitude, longitude);
      setSelectedLocation({ lat: latitude, lng: longitude, address });
      
      toast({
        title: "📱 Ubicación actualizada",
        description: "GPS detectado correctamente"
      });
      
    } catch (error) {
      console.error('❌ Error GPS:', error);
      toast({
        title: "❌ Error de GPS",
        description: "No se pudo obtener la ubicación actual",
        variant: "destructive"
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Confirmar selección con coordenadas exactas
  const confirmSelection = () => {
    if (selectedLocation) {
      // Enviar coordenadas exactas en lugar de la dirección
      const locationData: LocationData = {
        address: `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng
      };
      
      onSelectLocation(locationData);
      onClose();
      
      toast({
        title: "✅ Coordenadas guardadas",
        description: "Ubicación establecida con coordenadas exactas"
      });
    }
  };

  // Effects
  useEffect(() => {
    if (isOpen) {
      console.log('🚀 Modal abierto - inicializando mapa Leaflet...');
      setTimeout(initializeMap, 200);
    }
    
    return () => {
      if (mapRef.current) {
        console.log('🧹 Limpiando mapa Leaflet...');
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedLocation(null);
      setIsLoadingMap(true);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-2xl h-[85vh] max-h-[600px] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-3 pb-2 border-b flex-shrink-0">
          <DialogTitle className="text-base sm:text-lg">🗺️ Seleccionar Ubicación</DialogTitle>
        </DialogHeader>
        
        <div className="p-3 pb-2 border-b flex-shrink-0">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Buscar ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                className="text-sm"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1 h-6 w-6"
                onClick={searchLocation}
                disabled={!searchQuery.trim() || isSearching}
              >
                {isSearching ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Search className="h-3 w-3" />
                )}
              </Button>
            </div>
            <Button
              variant="default"
              size="sm"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="gap-1 px-2 sm:px-3"
            >
              {isGettingLocation ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Navigation className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">Mi Ubicación</span>
              <span className="sm:hidden">GPS</span>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            💡 Busca una ubicación, usa GPS o haz clic directamente en el mapa
          </p>
        </div>

        <div className="flex-1 px-3 min-h-0 overflow-hidden">
          <div className="relative w-full h-full bg-gray-100 rounded-lg border overflow-hidden" style={{ minHeight: '250px' }}>
            {isLoadingMap && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-xs text-gray-600">Cargando mapa...</p>
                </div>
              </div>
            )}
            <div 
              ref={mapContainerRef}
              className="w-full h-full"
              style={{ minHeight: '250px' }}
            />
          </div>
        </div>

        {selectedLocation && (
          <div className="px-3 py-2 border-t bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <MapPin className="h-3 w-3" />
              <span className="font-medium text-xs">Ubicación seleccionada:</span>
            </div>
            <p className="text-xs text-gray-700 break-words line-clamp-2">{selectedLocation.address}</p>
            <p className="text-xs text-gray-500 mt-1">
              📍 {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        )}

        <div className="flex justify-center p-3 pt-2 border-t flex-shrink-0">
          <Button 
            onClick={confirmSelection}
            disabled={!selectedLocation}
            size="sm"
            className="bg-green-600 hover:bg-green-700 gap-2 w-full sm:w-auto"
          >
            <MapPin className="h-4 w-4" />
            Establecer Ubicación
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSelector;
