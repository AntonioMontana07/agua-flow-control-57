
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2, X } from 'lucide-react';
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
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const { toast } = useToast();

  // Cargar Google Maps API
  useEffect(() => {
    if (isOpen && !googleMapsLoaded) {
      const savedApiKey = localStorage.getItem('googleMapsApiKey');
      if (savedApiKey) {
        setApiKey(savedApiKey);
        loadGoogleMaps(savedApiKey);
      } else {
        const userApiKey = prompt(
          'Para usar el mapa interactivo, necesitas una API key de Google Maps.\n' +
          'Puedes obtenerla en: https://console.cloud.google.com/\n' +
          'Asegúrate de habilitar Maps JavaScript API y Places API.\n' +
          'Ingresa tu API key de Google Maps:'
        );
        if (userApiKey) {
          localStorage.setItem('googleMapsApiKey', userApiKey);
          setApiKey(userApiKey);
          loadGoogleMaps(userApiKey);
        }
      }
    }
  }, [isOpen, googleMapsLoaded]);

  const loadGoogleMaps = (key: string) => {
    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true);
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&language=es&region=PE`;
    script.onload = () => {
      setGoogleMapsLoaded(true);
      initializeMap();
    };
    script.onerror = () => {
      toast({
        title: "Error al cargar Google Maps",
        description: "Verifica que tu API key sea válida y tenga los permisos necesarios",
        variant: "destructive"
      });
    };
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Coordenadas de Arequipa, Perú
    const arequipaCenter = { lat: -16.409047, lng: -71.537451 };

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: arequipaCenter,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }]
        }
      ]
    });

    mapInstanceRef.current = map;

    // Agregar marcador
    const marker = new window.google.maps.Marker({
      position: arequipaCenter,
      map: map,
      draggable: true,
      title: "Seleccionar ubicación"
    });

    markerRef.current = marker;

    // Listener para cuando se arrastra el marcador
    marker.addListener('dragend', () => {
      const position = marker.getPosition();
      if (position) {
        const lat = position.lat();
        const lng = position.lng();
        reverseGeocode(lat, lng);
      }
    });

    // Listener para clicks en el mapa
    map.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        marker.setPosition(event.latLng);
        reverseGeocode(lat, lng);
      }
    });
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address;
          setSelectedLocation({ lat, lng, address });
        } else {
          setSelectedLocation({ lat, lng, address: `${lat}, ${lng}` });
        }
      }
    );
  };

  const searchLocations = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const query = `${searchQuery}, Arequipa, Peru`;
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=pe`
      );
      
      if (response.ok) {
        const data = await response.json();
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
    
    if (mapInstanceRef.current && markerRef.current) {
      const position = { lat, lng };
      mapInstanceRef.current.setCenter(position);
      mapInstanceRef.current.setZoom(16);
      markerRef.current.setPosition(position);
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
        
        if (mapInstanceRef.current && markerRef.current) {
          const pos = { lat: latitude, lng: longitude };
          mapInstanceRef.current.setCenter(pos);
          mapInstanceRef.current.setZoom(16);
          markerRef.current.setPosition(pos);
        }
        
        reverseGeocode(latitude, longitude);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setIsGettingLocation(false);
        
        let errorMessage = "No se pudo obtener la ubicación";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permisos de ubicación denegados";
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh] max-w-[95vw] max-h-[95vh] p-0">
        <div className="flex flex-col h-[80vh]">
          {/* Header */}
          <DialogHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle>Seleccionar Ubicación</DialogTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
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
              >
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
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
              {googleMapsLoaded ? (
                <div ref={mapRef} className="w-full h-full" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Cargando mapa...</p>
                  </div>
                </div>
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
            <Button variant="outline" onClick={onClose}>
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

export default LocationSelector;
