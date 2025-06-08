
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

// Icono personalizado para "yo" (ubicación actual)
const createPersonIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background: #3b82f6;
        border: 3px solid white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <div style="
        position: absolute;
        top: 45px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(59, 130, 246, 0.9);
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: bold;
        white-space: nowrap;
      ">yo</div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    className: 'custom-person-icon'
  });
};

// Icono personalizado para "ubicación seleccionada"
const createSelectedLocationIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background: #ef4444;
        border: 3px solid white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
      <div style="
        position: absolute;
        top: 45px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(239, 68, 68, 0.9);
        color: white;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: bold;
        white-space: nowrap;
      ">ubicación seleccionada</div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    className: 'custom-selected-icon'
  });
};

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
  const selectedMarkerRef = useRef<L.Marker | null>(null);
  const currentLocationMarkerRef = useRef<L.Marker | null>(null);

  // Obtener posición GPS del usuario con MÁXIMA precisión usando múltiples intentos
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      console.log('🎯 Iniciando proceso de GPS de máxima precisión...');
      
      let bestPosition: GeolocationPosition | null = null;
      let attempts = 0;
      const maxAttempts = 5;
      const positions: GeolocationPosition[] = [];

      const tryGetPosition = () => {
        attempts++;
        console.log(`📍 Intento GPS ${attempts}/${maxAttempts}...`);

        navigator.geolocation.getCurrentPosition(
          (position) => {
            positions.push(position);
            console.log(`✅ GPS ${attempts} - Precisión: ${position.coords.accuracy}m`);
            console.log(`📍 Coordenadas ${attempts}: ${position.coords.latitude}, ${position.coords.longitude}`);

            // Si es el primer intento o tiene mejor precisión, guardarlo
            if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
              bestPosition = position;
              console.log(`🏆 Nueva mejor posición - Precisión: ${position.coords.accuracy}m`);
            }

            // Si tenemos buena precisión (menos de 10m) o hemos completado todos los intentos
            if (position.coords.accuracy <= 10 || attempts >= maxAttempts) {
              console.log(`✅ GPS FINAL - Mejor precisión: ${bestPosition.coords.accuracy}m`);
              resolve(bestPosition);
            } else {
              // Intentar otra vez después de una pausa
              setTimeout(tryGetPosition, 1000);
            }
          },
          (error) => {
            console.error(`❌ Error GPS intento ${attempts}:`, error);
            
            if (attempts >= maxAttempts) {
              if (bestPosition) {
                console.log(`⚠️ Usando mejor posición disponible - Precisión: ${bestPosition.coords.accuracy}m`);
                resolve(bestPosition);
              } else {
                reject(error);
              }
            } else {
              // Intentar otra vez con configuración menos estricta
              setTimeout(tryGetPosition, 1000);
            }
          },
          { 
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
          }
        );
      };

      // Comenzar el proceso
      tryGetPosition();
    });
  };

  // Inicializar mapa con Leaflet
  const initializeMap = async () => {
    if (!mapContainerRef.current || mapRef.current) return;

    console.log('🗺️ Inicializando mapa con GPS de máxima precisión...');
    setIsLoadingMap(true);

    try {
      // Obtener ubicación actual del usuario con máxima precisión
      const position = await getCurrentPosition();
      const { latitude: lat, longitude: lng, accuracy } = position.coords;

      console.log(`🎯 UBICACIÓN FINAL PRECISA - Precisión: ${accuracy}m`);
      console.log(`📍 COORDENADAS FINALES: ${lat}, ${lng}`);

      // Crear mapa centrado en la ubicación actual con zoom alto para precisión
      const map = L.map(mapContainerRef.current).setView([lat, lng], 20);
      mapRef.current = map;

      // Agregar capa de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 22
      }).addTo(map);

      // Agregar marcador "yo" (ubicación actual fija)
      const personIcon = createPersonIcon();
      const currentLocationMarker = L.marker([lat, lng], { icon: personIcon })
        .addTo(map)
        .bindPopup(`📍 Tu ubicación PRECISA<br>Precisión: ${Math.round(accuracy)}m<br>Lat: ${lat.toFixed(8)}<br>Lng: ${lng.toFixed(8)}`);

      currentLocationMarkerRef.current = currentLocationMarker;

      // Agregar marcador de "ubicación seleccionada" (inicialmente en la misma posición)
      const selectedIcon = createSelectedLocationIcon();
      const selectedMarker = L.marker([lat, lng], { icon: selectedIcon })
        .addTo(map)
        .bindPopup('🎯 Ubicación seleccionada');

      selectedMarkerRef.current = selectedMarker;

      // Obtener dirección de la ubicación actual
      const address = await reverseGeocode(lat, lng);
      setSelectedLocation({ lat, lng, address });

      // Event listener para clicks en el mapa
      map.on('click', async (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        console.log(`🎯 Click en mapa: ${clickLat}, ${clickLng}`);

        try {
          // Mover SOLO el marcador de ubicación seleccionada
          if (selectedMarkerRef.current) {
            selectedMarkerRef.current.setLatLng([clickLat, clickLng]);
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

      console.log('✅ Mapa inicializado con GPS de máxima precisión');
      toast({
        title: "🎯 GPS de Alta Precisión",
        description: `Ubicación precisa obtenida (±${Math.round(accuracy)}m)`
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
        maxZoom: 22
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

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'BIOX LocationSelector/1.0' } }
      );
      
      const data = await response.json();
      return data.display_name || `${lat.toFixed(8)}, ${lng.toFixed(8)}`;
    } catch (error) {
      console.error('❌ Error en geocodificación inversa:', error);
      return `${lat.toFixed(8)}, ${lng.toFixed(8)}`;
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
          mapRef.current.setView([lat, lng], 18);
          
          // Mover SOLO el marcador de ubicación seleccionada
          if (selectedMarkerRef.current) {
            selectedMarkerRef.current.setLatLng([lat, lng]);
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

  // Obtener ubicación GPS actual con máxima precisión
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    console.log('🎯 Iniciando GPS de máxima precisión...');

    try {
      const position = await getCurrentPosition();
      const { latitude, longitude, accuracy } = position.coords;
      
      console.log(`🎯 NUEVA UBICACIÓN PRECISA - Precisión: ${accuracy}m`);
      console.log(`📍 COORDENADAS: ${latitude}, ${longitude}`);
      
      // Centrar mapa en ubicación actual con zoom alto
      if (mapRef.current) {
        mapRef.current.setView([latitude, longitude], 20);
        
        // Actualizar marcador "yo" con nueva ubicación precisa
        if (currentLocationMarkerRef.current) {
          currentLocationMarkerRef.current.setLatLng([latitude, longitude]);
          currentLocationMarkerRef.current.bindPopup(`📍 Tu ubicación PRECISA<br>Precisión: ${Math.round(accuracy)}m<br>Lat: ${latitude.toFixed(8)}<br>Lng: ${longitude.toFixed(8)}`);
        }
        
        // Mover SOLO el marcador de ubicación seleccionada a la ubicación actual
        if (selectedMarkerRef.current) {
          selectedMarkerRef.current.setLatLng([latitude, longitude]);
        }
      }
      
      const address = await reverseGeocode(latitude, longitude);
      setSelectedLocation({ lat: latitude, lng: longitude, address });
      
      toast({
        title: "🎯 GPS de Alta Precisión",
        description: `Ubicación actualizada (±${Math.round(accuracy)}m)`
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
      const locationData: LocationData = {
        address: `${selectedLocation.lat.toFixed(8)}, ${selectedLocation.lng.toFixed(8)}`,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng
      };
      
      onSelectLocation(locationData);
      onClose();
      
      toast({
        title: "✅ Coordenadas de alta precisión guardadas",
        description: "Ubicación establecida con máxima exactitud"
      });
    }
  };

  // Effects
  useEffect(() => {
    if (isOpen) {
      console.log('🚀 Modal abierto - inicializando GPS de máxima precisión...');
      setTimeout(initializeMap, 200);
    }
    
    return () => {
      if (mapRef.current) {
        console.log('🧹 Limpiando mapa Leaflet...');
        mapRef.current.remove();
        mapRef.current = null;
        selectedMarkerRef.current = null;
        currentLocationMarkerRef.current = null;
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
          <DialogTitle className="text-base sm:text-lg">🎯 Selector de Ubicación de Alta Precisión</DialogTitle>
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
              <span className="hidden sm:inline">GPS Preciso</span>
              <span className="sm:hidden">GPS</span>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2">
            🎯 GPS de alta precisión activado - Múltiples intentos para máxima exactitud
          </p>
        </div>

        <div className="flex-1 px-3 min-h-0 overflow-hidden">
          <div className="relative w-full h-full bg-gray-100 rounded-lg border overflow-hidden" style={{ minHeight: '250px' }}>
            {isLoadingMap && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                <div className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-xs text-gray-600">Obteniendo GPS de alta precisión...</p>
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
              <span className="font-medium text-xs">Ubicación de alta precisión:</span>
            </div>
            <p className="text-xs text-gray-700 break-words line-clamp-2">{selectedLocation.address}</p>
            <p className="text-xs text-gray-500 mt-1">
              🎯 {selectedLocation.lat.toFixed(8)}, {selectedLocation.lng.toFixed(8)}
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
            Establecer Ubicación Precisa
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSelector;
