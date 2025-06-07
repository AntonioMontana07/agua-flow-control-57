
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
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string>('');
  const [isAutoLocating, setIsAutoLocating] = useState(false);
  const { toast } = useToast();
  
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Coordenadas y límites de Arequipa
  const AREQUIPA_CENTER: [number, number] = [-16.409047, -71.537451]; // [lat, lng] para Leaflet
  const AREQUIPA_BOUNDS = {
    north: -16.2,
    south: -16.6,
    east: -71.2,
    west: -71.8
  };

  // Inicializar mapa con Leaflet
  const initializeMap = async () => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    try {
      console.log('🗺️ Iniciando mapa con Leaflet (OpenStreetMap)...');
      setMapError('');
      
      // Crear mapa con Leaflet
      const map = L.map(mapContainerRef.current, {
        center: AREQUIPA_CENTER,
        zoom: 13,
        zoomControl: true,
        attributionControl: true
      });

      // Añadir capa de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapRef.current = map;

      // Event listener para clicks en el mapa
      map.on('click', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        console.log('📍 Click en mapa:', { lat, lng });
        
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

      // Evento cuando el mapa está listo
      map.whenReady(() => {
        console.log('✅ Mapa Leaflet cargado correctamente');
        setMapReady(true);
        setMapError('');
        
        // Automáticamente obtener ubicación GPS cuando el mapa esté listo
        console.log('🚀 Iniciando localización automática...');
        setTimeout(() => {
          autoGetCurrentLocation();
        }, 500);
      });

      // Manejar errores de carga de tiles
      map.on('tileerror', (error) => {
        console.warn('⚠️ Error cargando algunas partes del mapa:', error);
        // No mostrar error por tiles individuales
      });

    } catch (error) {
      console.error('❌ Error inicializando mapa:', error);
      setMapError('Error al cargar el mapa. Verifica tu conexión a internet.');
    }
  };

  const updateMarker = (lat: number, lng: number) => {
    if (!mapRef.current) return;
    
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], {
        icon: L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(mapRef.current);
    }
  };

  const cleanupMap = () => {
    console.log('🧹 Limpiando mapa...');
    
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    
    setMapReady(false);
    setIsAutoLocating(false);
  };

  // Effects
  useEffect(() => {
    if (isOpen && !mapReady && !mapRef.current) {
      const timer = setTimeout(initializeMap, 100);
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

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      console.log('🔍 Verificando permisos de ubicación...');
      
      if (Capacitor.isNativePlatform()) {
        const { Geolocation } = await import('@capacitor/geolocation');
        const permission = await Geolocation.checkPermissions();
        setHasLocationPermission(permission.location === 'granted');
        console.log('📱 Permisos móvil:', permission.location);
      } else {
        const hasGeo = !!navigator.geolocation;
        setHasLocationPermission(hasGeo);
        console.log('🌐 Geolocalización web disponible:', hasGeo);
      }
    } catch (error) {
      console.error('Error verificando permisos:', error);
      setHasLocationPermission(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      console.log('📱 Solicitando permisos de ubicación...');
      
      if (Capacitor.isNativePlatform()) {
        const { Geolocation } = await import('@capacitor/geolocation');
        
        const permission = await Geolocation.requestPermissions();
        console.log('📝 Resultado de solicitud móvil:', permission);
        
        setHasLocationPermission(permission.location === 'granted');
        
        if (permission.location === 'granted') {
          toast({
            title: "✅ Permisos Concedidos",
            description: "GPS activado correctamente"
          });
          return true;
        } else {
          toast({
            title: "❌ Permisos Requeridos",
            description: "Ve a Configuración para activar ubicación",
            variant: "destructive"
          });
          return false;
        }
      } else {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 10000,
              enableHighAccuracy: false
            });
          });
          
          setHasLocationPermission(true);
          toast({
            title: "✅ Ubicación Activada",
            description: "GPS disponible"
          });
          
          return true;
        } catch (error: any) {
          toast({
            title: "❌ Permisos Requeridos",
            description: "Activa la ubicación en tu navegador",
            variant: "destructive"
          });
          return false;
        }
      }
    } catch (error) {
      console.error('❌ Error solicitando permisos:', error);
      return false;
    }
  };

  const isLocationInArequipa = (lat: number, lng: number): boolean => {
    return lat >= AREQUIPA_BOUNDS.south && 
           lat <= AREQUIPA_BOUNDS.north && 
           lng >= AREQUIPA_BOUNDS.west && 
           lng <= AREQUIPA_BOUNDS.east;
  };

  const geocodeCurrentAddress = async () => {
    if (!currentValue?.trim()) return;
    
    try {
      console.log('🔍 Geocodificando dirección actual:', currentValue);
      const query = `${currentValue}, Arequipa, Perú`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=pe&addressdetails=1`
      );
      
      const data = await response.json();
      if (data?.[0]) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        if (isLocationInArequipa(lat, lng) && mapRef.current) {
          console.log('✅ Dirección encontrada:', { lat, lng });
          setSelectedLocation({ lat, lng, address: currentValue });
          mapRef.current.setView([lat, lng], 16);
          updateMarker(lat, lng);
        }
      }
    } catch (error) {
      console.error('Error geocodificando dirección:', error);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      console.log('🔍 Geocodificación inversa para:', { lat, lng });
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
        
        if (data.address.city_district || data.address.district) {
          parts.push(data.address.city_district || data.address.district);
        }
        
        if (!parts.some(part => part.toLowerCase().includes('arequipa'))) {
          parts.push('Arequipa');
        }
        
        address = parts.join(', ');
      }
      
      if (!address || address === 'Arequipa') {
        address = `Ubicación exacta: ${lat.toFixed(6)}, ${lng.toFixed(6)}, Arequipa`;
      }

      console.log('📍 Dirección obtenida:', address);
      setSelectedLocation({ lat, lng, address });
    } catch (error) {
      console.error('Error en geocodificación inversa:', error);
      const exactAddress = `Ubicación exacta: ${lat.toFixed(6)}, ${lng.toFixed(6)}, Arequipa`;
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
    
    console.log('🎯 Resultado de búsqueda seleccionado:', { lat, lng });
    
    await reverseGeocode(lat, lng);
    
    setSearchResults([]);
    setSearchQuery('');
    
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 17);
      updateMarker(lat, lng);
    }
  };

  const autoGetCurrentLocation = async () => {
    console.log('🔄 Iniciando localización automática GPS...');
    setIsAutoLocating(true);

    try {
      if (!hasLocationPermission) {
        const granted = await requestLocationPermission();
        if (!granted) {
          console.log('⚠️ Permisos de ubicación no concedidos - continuando sin GPS');
          setIsAutoLocating(false);
          return;
        }
      }

      if (Capacitor.isNativePlatform()) {
        const { Geolocation } = await import('@capacitor/geolocation');
        
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        });
        
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`📍 GPS automático móvil - Lat: ${latitude}, Lng: ${longitude}, Precisión: ${accuracy}m`);
        
        await handleAutoLocationSuccess(latitude, longitude, accuracy);
      } else {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            { 
              enableHighAccuracy: true, 
              timeout: 15000,
              maximumAge: 0
            }
          );
        });
        
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`📍 GPS automático web - Lat: ${latitude}, Lng: ${longitude}, Precisión: ${accuracy}m`);
        
        await handleAutoLocationSuccess(latitude, longitude, accuracy);
      }
    } catch (error: any) {
      console.log('⚠️ Localización automática falló (normal):', error);
    } finally {
      setIsAutoLocating(false);
    }
  };

  const getCurrentLocation = async () => {
    if (!hasLocationPermission) {
      const granted = await requestLocationPermission();
      if (!granted) return;
    }

    setIsGettingLocation(true);
    console.log('📡 Obteniendo ubicación GPS manual...');

    try {
      if (Capacitor.isNativePlatform()) {
        const { Geolocation } = await import('@capacitor/geolocation');
        
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0
        });
        
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`📍 GPS manual móvil - Lat: ${latitude}, Lng: ${longitude}, Precisión: ${accuracy}m`);
        
        await handleLocationSuccess(latitude, longitude, accuracy);
      } else {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            { 
              enableHighAccuracy: true, 
              timeout: 20000,
              maximumAge: 0
            }
          );
        });
        
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`📍 GPS manual web - Lat: ${latitude}, Lng: ${longitude}, Precisión: ${accuracy}m`);
        
        await handleLocationSuccess(latitude, longitude, accuracy);
      }
    } catch (error: any) {
      console.error('❌ Error obteniendo ubicación manual:', error);
      toast({
        title: "Error de Ubicación",
        description: "No se pudo obtener la ubicación GPS",
        variant: "destructive"
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleAutoLocationSuccess = async (latitude: number, longitude: number, accuracy?: number) => {
    console.log(`✅ Ubicación GPS automática obtenida - Precisión: ${accuracy ? Math.round(accuracy) + 'm' : 'desconocida'}`);
    
    if (isLocationInArequipa(latitude, longitude)) {
      if (mapRef.current) {
        mapRef.current.setView([latitude, longitude], 18);
        updateMarker(latitude, longitude);
      }
      
      await reverseGeocode(latitude, longitude);
      console.log('✅ Ubicación automática centrada en Arequipa');
    } else {
      console.log('⚠️ Ubicación automática fuera de Arequipa - mantener centro por defecto');
    }
  };

  const handleLocationSuccess = async (latitude: number, longitude: number, accuracy?: number) => {
    console.log(`✅ Ubicación GPS manual obtenida - Precisión: ${accuracy ? Math.round(accuracy) + 'm' : 'desconocida'}`);
    
    if (isLocationInArequipa(latitude, longitude)) {
      if (mapRef.current) {
        mapRef.current.setView([latitude, longitude], 18);
        updateMarker(latitude, longitude);
      }
      
      await reverseGeocode(latitude, longitude);
      
      const precisionMsg = accuracy 
        ? `Precisión GPS: ${Math.round(accuracy)}m` 
        : 'Ubicación GPS obtenida';
        
      toast({
        title: "Ubicación Exacta Obtenida",
        description: precisionMsg
      });
    } else {
      toast({
        title: "Fuera de Arequipa",
        description: "Tu ubicación actual está fuera de Arequipa",
        variant: "destructive"
      });
    }
  };

  const confirmSelection = () => {
    if (selectedLocation) {
      console.log('✅ Confirmando ubicación exacta:', selectedLocation);
      onSelectLocation(selectedLocation.address);
      onClose();
      toast({
        title: "Ubicación Exacta Confirmada",
        description: "Dirección actualizada con coordenadas precisas"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-3 sm:p-4 pb-2 border-b">
            <DialogTitle className="text-base sm:text-lg">Seleccionar Ubicación Exacta en Arequipa</DialogTitle>
          </DialogHeader>
          
          <div className="p-3 sm:p-4 pb-2 border-b">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Buscar dirección exacta en Arequipa..."
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
                variant="default"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isGettingLocation || isAutoLocating}
                className="gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg font-semibold transition-all duration-200 hover:shadow-xl hover:scale-105"
              >
                {isGettingLocation || isAutoLocating ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
                <span className="hidden sm:inline">
                  {isAutoLocating ? 'Localizando...' : 'Mi Ubicación'}
                </span>
                <span className="sm:hidden">
                  {isAutoLocating ? 'GPS...' : 'GPS'}
                </span>
              </Button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="px-3 sm:px-4 pb-2">
              <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-32 sm:max-h-40 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => selectSearchResult(result)}
                    className="w-full text-left p-3 hover:bg-blue-50 border-b last:border-b-0 text-sm sm:text-base transition-colors duration-200 focus:outline-none focus:bg-blue-50"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mt-1 text-blue-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-900 font-medium leading-relaxed break-words">
                          {result.display_name}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 px-3 sm:px-4 min-h-0">
            {mapError ? (
              <div className="relative w-full h-full bg-red-50 rounded-lg overflow-hidden border-2 border-red-200 flex items-center justify-center" style={{ minHeight: '300px' }}>
                <div className="text-center p-4">
                  <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600">{mapError}</p>
                </div>
              </div>
            ) : !mapReady ? (
              <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden border-2 flex items-center justify-center" style={{ minHeight: '300px' }}>
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600">
                    {isAutoLocating ? 'Cargando mapa y obteniendo GPS...' : 'Cargando mapa...'}
                  </p>
                </div>
              </div>
            ) : (
              <div 
                ref={mapContainerRef}
                className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden border-2"
                style={{ minHeight: '300px' }}
              />
            )}
          </div>

          {selectedLocation && (
            <div className="px-3 sm:px-4 py-2 border-t bg-gray-50">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <MapPin className="h-4 w-4" />
                <span className="font-medium text-sm">Ubicación exacta seleccionada:</span>
              </div>
              <p className="text-sm text-gray-700 break-words">
                {selectedLocation.address}
              </p>
              <p className="text-xs text-gray-500">
                Coordenadas precisas: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 p-3 sm:p-4 pt-2 border-t">
            <Button variant="outline" onClick={onClose} size="sm">
              Cancelar
            </Button>
            <Button 
              onClick={confirmSelection}
              disabled={!selectedLocation}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              Confirmar Ubicación Exacta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSelector;
