import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2, X, Navigation, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import L from 'leaflet';

// Fix for default markers in Leaflet
import 'leaflet/dist/leaflet.css';

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
  const { toast } = useToast();
  
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Coordenadas y límites de Arequipa
  const AREQUIPA_CENTER: [number, number] = [-16.409047, -71.537451];
  const AREQUIPA_BOUNDS = {
    north: -16.2,
    south: -16.6,
    east: -71.2,
    west: -71.8
  };

  // Inicializar el mapa
  useEffect(() => {
    if (isOpen && mapContainerRef.current && !mapRef.current) {
      console.log('🗺️ Inicializando mapa interactivo...');
      
      // Configurar iconos de Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      mapRef.current = L.map(mapContainerRef.current).setView(AREQUIPA_CENTER, 13);

      // Añadir capa de mapa
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(mapRef.current);

      // Manejar clicks en el mapa
      mapRef.current.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        
        if (isLocationInArequipa(lat, lng)) {
          console.log('📍 Ubicación seleccionada en mapa:', lat, lng);
          
          // Añadir/mover marcador
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng]).addTo(mapRef.current!);
          }
          
          // Obtener dirección
          await reverseGeocode(lat, lng);
        } else {
          toast({
            title: "Fuera de Arequipa",
            description: "Selecciona una ubicación dentro de Arequipa",
            variant: "destructive"
          });
        }
      });

      // Geocodificar dirección actual si existe
      if (currentValue && !selectedLocation) {
        geocodeCurrentAddress();
      }
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  // Verificar permisos de ubicación al cargar
  useEffect(() => {
    checkLocationPermission();
  }, []);

  // Geocodificar dirección actual
  useEffect(() => {
    if (isOpen && currentValue && !selectedLocation) {
      geocodeCurrentAddress();
    }
  }, [isOpen, currentValue]);

  const checkLocationPermission = async () => {
    console.log('🔍 Verificando permisos de ubicación...');
    
    if (Capacitor.isNativePlatform()) {
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        
        const permission = await Geolocation.checkPermissions();
        console.log('📱 Estado actual de permisos de ubicación:', permission);
        
        setLocationPermissionStatus(permission.location);
        
        if (permission.location === 'granted') {
          setHasLocationPermission(true);
          console.log('✅ Permisos de ubicación ya concedidos');
        } else if (permission.location === 'prompt' || permission.location === 'prompt-with-rationale') {
          console.log('❓ Solicitando permisos de ubicación...');
          const requestResult = await Geolocation.requestPermissions();
          setLocationPermissionStatus(requestResult.location);
          setHasLocationPermission(requestResult.location === 'granted');
          
          if (requestResult.location === 'granted') {
            console.log('✅ Permisos de ubicación concedidos');
            toast({
              title: "✅ Permisos Concedidos",
              description: "Ya puedes usar tu ubicación actual"
            });
          } else {
            console.log('❌ Permisos de ubicación denegados');
            toast({
              title: "⚠️ Permisos de Ubicación",
              description: "Para usar tu ubicación, ve a Configuración y permite el acceso",
              variant: "destructive"
            });
          }
        } else {
          console.log('❌ Permisos de ubicación denegados permanentemente');
          setHasLocationPermission(false);
        }
      } catch (error) {
        console.error('❌ Error al verificar permisos de ubicación:', error);
      }
    } else {
      if (navigator.geolocation) {
        setHasLocationPermission(true);
      }
    }
  };

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
          setSelectedLocation({ lat, lng, address: currentValue });
          
          // Centrar mapa y añadir marcador
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 16);
            
            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
            } else {
              markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
            }
          }
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
    
    setSelectedLocation({ lat, lng, address: result.display_name });
    setSearchResults([]);
    setSearchQuery('');
    
    // Centrar mapa y añadir marcador
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 16);
      
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
      }
    }
  };

  const getCurrentLocation = async () => {
    if (!hasLocationPermission) {
      toast({
        title: "⚠️ Permisos Requeridos",
        description: "Ve a Configuración y permite el acceso a ubicación",
        variant: "destructive"
      });
      await checkLocationPermission();
      return;
    }

    setIsGettingLocation(true);

    try {
      if (Capacitor.isNativePlatform()) {
        const { Geolocation } = await import('@capacitor/geolocation');
        
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000
        });
        
        const { latitude, longitude } = position.coords;
        
        if (isLocationInArequipa(latitude, longitude)) {
          // Centrar mapa en ubicación actual
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 17);
            
            if (markerRef.current) {
              markerRef.current.setLatLng([latitude, longitude]);
            } else {
              markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);
            }
          }
          
          await reverseGeocode(latitude, longitude);
          toast({
            title: "✅ Ubicación Obtenida",
            description: "Ubicación actual detectada correctamente"
          });
        } else {
          toast({
            title: "Fuera de Arequipa",
            description: "Tu ubicación actual está fuera de Arequipa",
            variant: "destructive"
          });
        }
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            
            if (isLocationInArequipa(latitude, longitude)) {
              // Centrar mapa en ubicación actual
              if (mapRef.current) {
                mapRef.current.setView([latitude, longitude], 17);
                
                if (markerRef.current) {
                  markerRef.current.setLatLng([latitude, longitude]);
                } else {
                  markerRef.current = L.marker([latitude, longitude]).addTo(mapRef.current);
                }
              }
              
              reverseGeocode(latitude, longitude);
              toast({
                title: "✅ Ubicación Obtenida",
                description: "Ubicación actual detectada"
              });
            } else {
              toast({
                title: "Fuera de Arequipa",
                description: "Tu ubicación actual está fuera de Arequipa",
                variant: "destructive"
              });
            }
          },
          (error) => {
            console.error('Error getting location:', error);
            toast({
              title: "Error de ubicación",
              description: "No se pudo obtener tu ubicación",
              variant: "destructive"
            });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
      }
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      toast({
        title: "Error de ubicación",
        description: "No se pudo obtener tu ubicación",
        variant: "destructive"
      });
    } finally {
      setIsGettingLocation(false);
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-3 sm:p-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base sm:text-lg">Seleccionar Ubicación en Arequipa</DialogTitle>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {!hasLocationPermission && locationPermissionStatus === 'denied' && (
            <div className="p-3 bg-orange-50 border-b border-orange-200">
              <div className="flex items-center gap-2 text-orange-700">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  Para usar tu ubicación, ve a Configuración de la app y permite el acceso a ubicación
                </span>
              </div>
            </div>
          )}
          
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

          <div className="flex-1 px-3 sm:px-4 min-h-0">
            <div 
              ref={mapContainerRef}
              className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden border-2"
              style={{ minHeight: '300px' }}
            />
          </div>

          {selectedLocation && (
            <div className="px-3 sm:px-4 py-2 border-t bg-gray-50">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <MapPin className="h-4 w-4" />
                <span className="font-medium text-sm">Ubicación seleccionada:</span>
              </div>
              <p className="text-sm text-gray-700 break-words">
                {selectedLocation.address}
              </p>
              <p className="text-xs text-gray-500">
                Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
              </p>
            </div>
          )}

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

export default LocationSelector;
