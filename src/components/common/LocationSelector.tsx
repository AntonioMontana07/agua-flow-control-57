
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search, Loader2, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [mapError, setMapError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { toast } = useToast();
  
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);

  // Coordenadas de Arequipa
  const AREQUIPA_CENTER = [-16.409047, -71.537451];

  // Función para agregar debug info
  const addDebug = (message: string) => {
    console.log('🔍 DEBUG:', message);
    setDebugInfo(prev => prev + '\n' + message);
  };

  // Cargar mapa con Google Maps embebido (fallback gratuito)
  const initializeEmbeddedMap = () => {
    if (!mapContainerRef.current) return;
    
    try {
      addDebug('Iniciando mapa embebido...');
      
      const iframe = document.createElement('iframe');
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      iframe.src = `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dkG3z4NzKY6k9Q&center=${AREQUIPA_CENTER[0]},${AREQUIPA_CENTER[1]}&zoom=13&maptype=roadmap`;
      
      mapContainerRef.current.innerHTML = '';
      mapContainerRef.current.appendChild(iframe);
      
      addDebug('Mapa embebido cargado');
      setMapReady(true);
      setMapError('');
      
    } catch (error) {
      addDebug('Error con mapa embebido: ' + error);
      initializeOpenStreetMap();
    }
  };

  // Función alternativa con OpenStreetMap simple
  const initializeOpenStreetMap = async () => {
    if (!mapContainerRef.current) return;
    
    try {
      addDebug('Cargando OpenStreetMap...');
      
      // Crear contenedor simple del mapa
      const mapDiv = document.createElement('div');
      mapDiv.style.width = '100%';
      mapDiv.style.height = '100%';
      mapDiv.style.background = '#f0f0f0';
      mapDiv.style.borderRadius = '8px';
      mapDiv.style.position = 'relative';
      mapDiv.style.cursor = 'crosshair';
      
      // Agregar imagen de fondo de OSM
      mapDiv.style.backgroundImage = `url('https://tile.openstreetmap.org/13/${Math.floor(((-71.537451 + 180) / 360) * Math.pow(2, 13))}/${Math.floor((1 - Math.log(Math.tan((-16.409047 * Math.PI) / 180) + 1 / Math.cos((-16.409047 * Math.PI) / 180)) / Math.PI) / 2 * Math.pow(2, 13))}.png')`;
      mapDiv.style.backgroundSize = 'cover';
      mapDiv.style.backgroundPosition = 'center';
      
      // Agregar overlay con información
      const overlay = document.createElement('div');
      overlay.innerHTML = `
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(255,255,255,0.9); padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="color: #16a34a; font-size: 24px; margin-bottom: 10px;">📍</div>
          <div style="font-weight: 500; margin-bottom: 8px;">Mapa de Arequipa</div>
          <div style="font-size: 14px; color: #666; margin-bottom: 15px;">Haz clic para seleccionar ubicación</div>
          <div id="coordinates" style="font-size: 12px; color: #888;">Lat: ${AREQUIPA_CENTER[0]}, Lng: ${AREQUIPA_CENTER[1]}</div>
        </div>
      `;
      
      mapDiv.appendChild(overlay);
      
      // Evento de click
      mapDiv.addEventListener('click', (e) => {
        const rect = mapDiv.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Coordenadas aproximadas basadas en el click
        const lat = AREQUIPA_CENTER[0] + (0.5 - y / rect.height) * 0.1;
        const lng = AREQUIPA_CENTER[1] + (x / rect.width - 0.5) * 0.1;
        
        addDebug(`Click en: ${lat}, ${lng}`);
        
        // Actualizar coordenadas en el overlay
        const coordsDiv = mapDiv.querySelector('#coordinates');
        if (coordsDiv) {
          coordsDiv.textContent = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
        }
        
        // Crear dirección aproximada
        const address = `Ubicación seleccionada: ${lat.toFixed(6)}, ${lng.toFixed(6)}, Arequipa`;
        setSelectedLocation({ lat, lng, address });
        
        toast({
          title: "Ubicación seleccionada",
          description: "Click en confirmar para guardar"
        });
      });
      
      mapContainerRef.current.innerHTML = '';
      mapContainerRef.current.appendChild(mapDiv);
      
      addDebug('Mapa simple cargado correctamente');
      setMapReady(true);
      setMapError('');
      
    } catch (error) {
      addDebug('Error con mapa simple: ' + error);
      setMapError('No se pudo cargar el mapa');
      setMapReady(true);
    }
  };

  // Búsqueda de ubicaciones usando Nominatim
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    addDebug(`Buscando: ${searchQuery}`);
    
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Arequipa, Peru')}&limit=1&accept-language=es`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'LocationSelector/1.0'
        }
      });
      
      if (!response.ok) throw new Error('Error en búsqueda');
      
      const results = await response.json();
      addDebug(`Resultados de búsqueda: ${results.length}`);
      
      if (results && results.length > 0) {
        const result = results[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        addDebug(`Encontrado: ${lat}, ${lng}`);
        
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
          title: "Sin resultados",
          description: "No se encontraron resultados",
          variant: "destructive"
        });
      }
    } catch (error) {
      addDebug('Error en búsqueda: ' + error);
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

  // Obtener ubicación GPS
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    addDebug('Solicitando GPS...');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { 
          enableHighAccuracy: true, 
          timeout: 15000,
          maximumAge: 60000
        });
      });
      
      const { latitude, longitude } = position.coords;
      addDebug(`GPS obtenido: ${latitude}, ${longitude}`);
      
      const address = `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}, Arequipa`;
      setSelectedLocation({ lat: latitude, lng: longitude, address });
      
      toast({
        title: "Ubicación GPS obtenida",
        description: "Ubicación actual obtenida correctamente"
      });
      
    } catch (error) {
      addDebug('Error GPS: ' + error);
      toast({
        title: "Error de GPS",
        description: "No se pudo obtener la ubicación GPS",
        variant: "destructive"
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Confirmar selección
  const confirmSelection = () => {
    if (selectedLocation) {
      addDebug(`Confirmando: ${selectedLocation.address}`);
      onSelectLocation(selectedLocation.address);
      onClose();
      toast({
        title: "Ubicación confirmada",
        description: "Dirección guardada correctamente"
      });
    }
  };

  // Reintentar carga del mapa
  const retryMap = () => {
    addDebug('Reintentando carga del mapa...');
    setMapReady(false);
    setMapError('');
    setDebugInfo('');
    setTimeout(() => {
      initializeEmbeddedMap();
    }, 1000);
  };

  // Effects
  useEffect(() => {
    if (isOpen) {
      addDebug('Modal abierto, inicializando mapa...');
      const timer = setTimeout(() => {
        initializeEmbeddedMap();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedLocation(null);
      setMapReady(false);
      setMapError('');
      setDebugInfo('');
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
                  <p className="text-xs text-gray-400 mt-2">Esto puede tomar unos segundos</p>
                </div>
              </div>
            ) : mapError ? (
              <div className="w-full h-full bg-red-50 rounded-lg border-2 border-red-200 flex items-center justify-center" style={{ minHeight: '400px' }}>
                <div className="text-center max-w-md">
                  <div className="text-red-600 mb-4 text-2xl">❌</div>
                  <p className="text-sm text-red-600 mb-4">Error al cargar el mapa</p>
                  <p className="text-xs text-gray-600 mb-4">{mapError}</p>
                  <Button onClick={retryMap} variant="outline" size="sm" className="mb-4">
                    Reintentar
                  </Button>
                  {debugInfo && (
                    <details className="text-left">
                      <summary className="text-xs cursor-pointer">Ver información de debug</summary>
                      <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-auto max-h-32">
                        {debugInfo}
                      </pre>
                    </details>
                  )}
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
