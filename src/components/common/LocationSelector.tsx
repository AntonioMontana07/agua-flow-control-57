
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2, Navigation, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Configurar token de Mapbox
mapboxgl.accessToken = 'pk.eyJ1Ijoib2xpdmVyYXZlbjA1IiwiYSI6ImNtYm1vY2ZnZzFkcHoybXB6cnh1cjUwOTIifQ.6msn-8p6pZHC_R_wdBpjLw';

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
  const [locationPermissionStatus, setLocationPermissionStatus] = useState<string>('prompt');
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string>('');
  const { toast } = useToast();
  
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Coordenadas y límites de Arequipa - más precisos
  const AREQUIPA_CENTER: [number, number] = [-71.537451, -16.409047];
  const AREQUIPA_BOUNDS = {
    north: -16.2,
    south: -16.6,
    east: -71.2,
    west: -71.8
  };

  // Inicializar mapa optimizado
  const initializeMap = async () => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    try {
      console.log('🗺️ Iniciando mapa Mapbox optimizado...');
      setMapError('');
      
      // Verificar que el token esté configurado
      if (!mapboxgl.accessToken) {
        throw new Error('Token de Mapbox no configurado');
      }

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: AREQUIPA_CENTER,
        zoom: 13,
        pitch: 0,
        bearing: 0,
        language: 'es',
        // Optimizaciones de rendimiento
        optimizeForTerrain: true,
        antialias: true,
        preserveDrawingBuffer: false,
        refreshExpiredTiles: false,
        maxZoom: 20,
        minZoom: 10
      });

      mapRef.current = map;

      // Añadir controles de navegación
      map.addControl(
        new mapboxgl.NavigationControl({
          showCompass: true,
          showZoom: true
        }), 
        'top-right'
      );

      // Event listener optimizado para clicks
      map.on('click', async (e) => {
        const { lng, lat } = e.lngLat;
        console.log('📍 Click en mapa:', { lat, lng });
        
        if (isLocationInArequipa(lat, lng)) {
          updateMarker(lng, lat);
          await reverseGeocode(lat, lng);
        } else {
          toast({
            title: "Fuera de Arequipa",
            description: "Selecciona una ubicación dentro de Arequipa",
            variant: "destructive"
          });
        }
      });

      // Event listeners optimizados
      map.on('load', () => {
        console.log('✅ Mapa cargado correctamente');
        setMapReady(true);
        setMapError('');
        
        // Geocodificar dirección actual si existe
        if (currentValue && !selectedLocation) {
          setTimeout(() => geocodeCurrentAddress(), 1000);
        }
      });

      map.on('error', (error) => {
        console.error('❌ Error del mapa:', error);
        setMapError('Error cargando el mapa. Reintentando...');
        
        // Reintentar después de 3 segundos
        setTimeout(() => {
          setMapError('');
          initializeMap();
        }, 3000);
      });

      map.on('idle', () => {
        console.log('🎯 Mapa listo para interacciones');
      });

    } catch (error) {
      console.error('❌ Error inicializando mapa:', error);
      setMapError('Error al cargar el mapa. Verificando conexión...');
      
      // Reintentar después de 5 segundos
      setTimeout(() => {
        setMapError('');
        initializeMap();
      }, 5000);
    }
  };

  // Función optimizada para actualizar marcador
  const updateMarker = (lng: number, lat: number) => {
    if (!mapRef.current) return;
    
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    } else {
      markerRef.current = new mapboxgl.Marker({
        color: '#3B82F6',
        scale: 1.2
      })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);
    }
  };

  // Limpiar mapa
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
    setMapError('');
  };

  // Effect para inicializar
  useEffect(() => {
    if (isOpen && !mapReady && !mapRef.current) {
      const timer = setTimeout(initializeMap, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Effect para limpiar
  useEffect(() => {
    if (!isOpen) {
      cleanupMap();
      setSearchQuery('');
      setSearchResults([]);
      setSelectedLocation(null);
    }
  }, [isOpen]);

  // Verificar permisos al cargar
  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const { Geolocation } = await import('@capacitor/geolocation');
        const permission = await Geolocation.checkPermissions();
        setLocationPermissionStatus(permission.location);
        setHasLocationPermission(permission.location === 'granted');
        console.log('📱 Permisos móvil:', permission.location);
      } else {
        const hasGeo = !!navigator.geolocation;
        setHasLocationPermission(hasGeo);
        console.log('🌐 Geolocalización web:', hasGeo);
      }
    } catch (error) {
      console.error('Error verificando permisos:', error);
      setHasLocationPermission(false);
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
          mapRef.current.setCenter([lng, lat]);
          mapRef.current.setZoom(16);
          updateMarker(lng, lat);
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
      mapRef.current.setCenter([lng, lat]);
      mapRef.current.setZoom(17);
      
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(mapRef.current);
      }
    }
  };

  const getCurrentLocation = async () => {
    if (!hasLocationPermission) {
      toast({
        title: "Permisos Requeridos",
        description: "Ve a Configuración y permite el acceso a ubicación",
        variant: "destructive"
      });
      return;
    }

    setIsGettingLocation(true);
    console.log('📡 Obteniendo ubicación GPS de alta precisión...');

    try {
      if (Capacitor.isNativePlatform()) {
        // Configuración de alta precisión para móvil
        const { Geolocation } = await import('@capacitor/geolocation');
        
        console.log('📱 Solicitando ubicación móvil con alta precisión...');
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0
        });
        
        const { latitude, longitude, accuracy } = position.coords;
        console.log(`📍 GPS móvil - Lat: ${latitude}, Lng: ${longitude}, Precisión: ${accuracy}m`);
        
        await handleLocationSuccess(latitude, longitude, accuracy);
      } else {
        // Configuración de alta precisión para web
        console.log('🌐 Solicitando ubicación web con alta precisión...');
        
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
        console.log(`📍 GPS web - Lat: ${latitude}, Lng: ${longitude}, Precisión: ${accuracy}m`);
        
        await handleLocationSuccess(latitude, longitude, accuracy);
      }
    } catch (error) {
      console.error('❌ Error obteniendo ubicación:', error);
      toast({
        title: "Error de ubicación",
        description: "No se pudo obtener tu ubicación exacta. Verifica que el GPS esté activado.",
        variant: "destructive"
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleLocationSuccess = async (latitude: number, longitude: number, accuracy?: number) => {
    console.log(`✅ Ubicación GPS obtenida - Precisión: ${accuracy ? Math.round(accuracy) + 'm' : 'desconocida'}`);
    
    if (isLocationInArequipa(latitude, longitude)) {
      if (mapRef.current) {
        mapRef.current.setCenter([longitude, latitude]);
        mapRef.current.setZoom(18);
        updateMarker(longitude, latitude);
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
          
          {!hasLocationPermission && locationPermissionStatus === 'denied' && (
            <div className="p-3 bg-orange-50 border-b border-orange-200">
              <div className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  Para usar tu ubicación exacta, ve a Configuración de la app y permite el acceso a ubicación
                </span>
              </div>
            </div>
          )}
          
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
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="gap-2 text-xs sm:text-sm px-2 sm:px-3 bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                {isGettingLocation ? (
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                ) : (
                  <Navigation className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                )}
                <span className="hidden sm:inline font-medium">GPS Exacto</span>
                <span className="sm:hidden font-medium">GPS</span>
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
                  <p className="text-sm text-red-600 mb-2">{mapError}</p>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      setMapError('');
                      initializeMap();
                    }}
                  >
                    Reintentar
                  </Button>
                </div>
              </div>
            ) : !mapReady ? (
              <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden border-2 flex items-center justify-center" style={{ minHeight: '300px' }}>
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600">Cargando mapa optimizado...</p>
                  <p className="text-xs text-gray-500 mt-1">Esto puede tomar unos segundos</p>
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
