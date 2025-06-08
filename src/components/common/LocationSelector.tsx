
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
  const { toast } = useToast();
  
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Coordenadas de Arequipa
  const AREQUIPA_CENTER = { lat: -16.409047, lng: -71.537451 };

  // Crear mapa interactivo simple
  const createInteractiveMap = () => {
    if (!mapContainerRef.current) {
      console.log('❌ No hay contenedor para el mapa');
      return;
    }

    console.log('🗺️ Creando mapa interactivo...');
    
    // Limpiar contenedor
    mapContainerRef.current.innerHTML = '';
    
    // Crear contenedor del mapa
    const mapDiv = document.createElement('div');
    mapDiv.style.cssText = `
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border-radius: 8px;
      position: relative;
      cursor: crosshair;
      overflow: hidden;
      border: 2px solid #2196f3;
      min-height: 400px;
    `;
    
    // Agregar grid de calles
    const grid = document.createElement('div');
    grid.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-image: 
        linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px);
      background-size: 40px 40px;
      opacity: 0.6;
    `;
    mapDiv.appendChild(grid);
    
    // Info central
    const info = document.createElement('div');
    info.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255,255,255,0.95);
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      border: 2px solid #4caf50;
      max-width: 280px;
      z-index: 5;
    `;
    
    info.innerHTML = `
      <div style="color: #4caf50; font-size: 32px; margin-bottom: 12px;">📍</div>
      <div style="font-weight: 600; font-size: 16px; color: #333; margin-bottom: 8px;">Mapa de Arequipa</div>
      <div style="font-size: 14px; color: #666; margin-bottom: 12px;">Haz clic para seleccionar ubicación</div>
      <div id="coords" style="font-size: 12px; color: #888; background: #f5f5f5; padding: 8px; border-radius: 6px;">
        📌 ${AREQUIPA_CENTER.lat.toFixed(4)}, ${AREQUIPA_CENTER.lng.toFixed(4)}
      </div>
    `;
    
    mapDiv.appendChild(info);
    
    // Puntos de referencia
    const landmarks = [
      { x: '20%', y: '30%', name: 'Centro Histórico', color: '#ff5722' },
      { x: '70%', y: '40%', name: 'Cayma', color: '#ff9800' },
      { x: '40%', y: '70%', name: 'Cerro Colorado', color: '#795548' },
      { x: '60%', y: '20%', name: 'Yanahuara', color: '#607d8b' }
    ];
    
    landmarks.forEach(landmark => {
      const point = document.createElement('div');
      point.style.cssText = `
        position: absolute;
        top: ${landmark.y};
        left: ${landmark.x};
        width: 8px;
        height: 8px;
        background: ${landmark.color};
        border-radius: 50%;
        border: 2px solid white;
        transform: translate(-50%, -50%);
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        z-index: 3;
      `;
      point.title = landmark.name;
      mapDiv.appendChild(point);
    });
    
    // Evento de click
    mapDiv.addEventListener('click', (e) => {
      const rect = mapDiv.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calcular coordenadas
      const lat = AREQUIPA_CENTER.lat + (0.5 - y / rect.height) * 0.1;
      const lng = AREQUIPA_CENTER.lng + (x / rect.width - 0.5) * 0.1;
      
      console.log(`🎯 Click en: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      
      // Actualizar display de coordenadas
      const coordsDiv = info.querySelector('#coords');
      if (coordsDiv) {
        coordsDiv.innerHTML = `📌 ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
      
      // Crear dirección
      const address = `Ubicación en Arequipa: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setSelectedLocation({ lat, lng, address });
      
      // Remover marcador anterior
      const oldMarker = mapDiv.querySelector('.user-marker');
      if (oldMarker) oldMarker.remove();
      
      // Agregar nuevo marcador
      const marker = document.createElement('div');
      marker.className = 'user-marker';
      marker.style.cssText = `
        position: absolute;
        top: ${y}px;
        left: ${x}px;
        width: 16px;
        height: 16px;
        background: #4caf50;
        border: 3px solid white;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 3px 8px rgba(0,0,0,0.4);
        z-index: 10;
        animation: pulse 1.5s ease-in-out infinite;
      `;
      
      mapDiv.appendChild(marker);
      
      // Agregar animación
      if (!document.querySelector('#marker-animation')) {
        const style = document.createElement('style');
        style.id = 'marker-animation';
        style.textContent = `
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.2); }
            100% { transform: translate(-50%, -50%) scale(1); }
          }
        `;
        document.head.appendChild(style);
      }
      
      toast({
        title: "📍 Ubicación seleccionada",
        description: "Haz clic en 'Confirmar' para guardar"
      });
    });
    
    // Agregar al contenedor
    mapContainerRef.current.appendChild(mapDiv);
    console.log('✅ Mapa creado exitosamente');
  };

  // Búsqueda con Nominatim
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    console.log(`🔍 Buscando: "${searchQuery}"`);
    
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Arequipa, Peru')}&limit=1`;
      
      const response = await fetch(url, {
        headers: { 'User-Agent': 'LocationSelector/1.0' }
      });
      
      const results = await response.json();
      
      if (results && results.length > 0) {
        const result = results[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        setSelectedLocation({ 
          lat, 
          lng, 
          address: result.display_name 
        });
        
        toast({
          title: "✅ Ubicación encontrada",
          description: "Ubicación encontrada correctamente"
        });
      } else {
        toast({
          title: "❌ Sin resultados",
          description: "No se encontraron resultados",
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

  // GPS
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    console.log('📱 Obteniendo GPS...');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { 
          enableHighAccuracy: true, 
          timeout: 15000 
        });
      });
      
      const { latitude, longitude } = position.coords;
      const address = `Ubicación GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}, Arequipa`;
      
      setSelectedLocation({ lat: latitude, lng: longitude, address });
      
      toast({
        title: "📱 GPS obtenido",
        description: "Ubicación GPS detectada"
      });
      
    } catch (error) {
      console.error('❌ Error GPS:', error);
      toast({
        title: "❌ Error de GPS",
        description: "No se pudo obtener la ubicación",
        variant: "destructive"
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Confirmar selección
  const confirmSelection = () => {
    if (selectedLocation) {
      onSelectLocation(selectedLocation.address);
      onClose();
      toast({
        title: "✅ Ubicación confirmada",
        description: "Dirección guardada correctamente"
      });
    }
  };

  // Effects
  useEffect(() => {
    if (isOpen) {
      console.log('🚀 Modal abierto - creando mapa...');
      setTimeout(createInteractiveMap, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSelectedLocation(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-4 pb-2 border-b">
            <DialogTitle>📍 Seleccionar Ubicación en Arequipa</DialogTitle>
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
              💡 Busca una dirección, usa GPS o haz clic en el mapa
            </p>
          </div>

          <div className="flex-1 px-4 min-h-0">
            <div 
              ref={mapContainerRef}
              className="w-full h-full bg-gray-100 rounded-lg border-2"
              style={{ minHeight: '400px' }}
            />
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
              ✅ Confirmar Ubicación
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationSelector;
