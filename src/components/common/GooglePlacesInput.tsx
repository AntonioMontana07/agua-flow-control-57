
import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader } from '@googlemaps/js-api-loader';
import { AlertTriangle, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';

interface GooglePlacesInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

const GooglePlacesInput: React.FC<GooglePlacesInputProps> = ({
  value,
  onChange,
  placeholder,
  id,
  name,
  required
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkAndLoadGoogleMaps();
  }, []);

  const checkAndLoadGoogleMaps = async () => {
    console.log('🗺️ Verificando configuración de Google Maps...');
    
    // Verificar si ya hay una API key guardada
    const savedApiKey = localStorage.getItem('googleMapsApiKey');
    if (savedApiKey && savedApiKey.trim()) {
      console.log('🔑 API Key encontrada en localStorage');
      setApiKey(savedApiKey);
      await initializeGooglePlaces(savedApiKey);
    } else {
      console.log('❌ No se encontró API Key de Google Maps');
      setError('Se requiere configurar Google Maps API Key');
      setShowApiKeyInput(true);
      
      if (Capacitor.isNativePlatform()) {
        toast({
          title: "⚙️ Configuración Requerida",
          description: "Para usar autocompletado de direcciones, configura tu Google Maps API Key",
          duration: 8000
        });
      }
    }
  };

  const initializeGooglePlaces = async (key: string) => {
    if (!key || key.trim() === '') {
      setError('API Key no válida');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Cargando Google Maps API...');
      
      const loader = new Loader({
        apiKey: key,
        version: 'weekly',
        libraries: ['places']
      });

      await loader.load();
      console.log('✅ Google Maps API cargada correctamente');
      
      setIsLoaded(true);
      setShowApiKeyInput(false);

      // Configurar autocompletado cuando el input esté listo
      setTimeout(() => {
        if (inputRef.current && window.google) {
          console.log('🎯 Configurando autocompletado para Perú...');
          
          const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
            types: ['address'],
            componentRestrictions: { country: 'pe' }, // Restringir a Perú
            fields: ['formatted_address', 'geometry']
          });

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            console.log('📍 Lugar seleccionado:', place);
            
            if (place.formatted_address) {
              onChange(place.formatted_address);
              toast({
                title: "📍 Dirección Seleccionada",
                description: "Dirección actualizada correctamente"
              });
            }
          });
          
          console.log('✅ Autocompletado configurado');
        }
      }, 500);

      toast({
        title: "✅ Google Maps Configurado",
        description: "Autocompletado de direcciones disponible"
      });

    } catch (error) {
      console.error('❌ Error loading Google Maps:', error);
      setIsLoaded(false);
      setError('Error al cargar Google Maps. Verifica tu API Key.');
      
      // Si falla, mostrar input para reconfigurar
      setShowApiKeyInput(true);
      
      toast({
        title: "❌ Error de Configuración",
        description: "No se pudo cargar Google Maps. Verifica tu API Key.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiKey = async () => {
    if (!tempApiKey || tempApiKey.trim() === '') {
      toast({
        title: "❌ API Key Requerida",
        description: "Ingresa una API Key válida de Google Maps",
        variant: "destructive"
      });
      return;
    }

    console.log('💾 Guardando nueva API Key...');
    localStorage.setItem('googleMapsApiKey', tempApiKey.trim());
    setApiKey(tempApiKey.trim());
    
    toast({
      title: "💾 Configuración Guardada",
      description: "Cargando Google Maps..."
    });
    
    await initializeGooglePlaces(tempApiKey.trim());
  };

  const clearApiKey = () => {
    console.log('🗑️ Eliminando configuración de Google Maps...');
    localStorage.removeItem('googleMapsApiKey');
    setApiKey('');
    setIsLoaded(false);
    setShowApiKeyInput(true);
    setTempApiKey('');
    setError('Configuración eliminada');
    
    toast({
      title: "🗑️ Configuración Eliminada",
      description: "Configura nuevamente tu Google Maps API Key"
    });
  };

  if (showApiKeyInput) {
    return (
      <div className="space-y-3">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Google Maps API Key Requerida</p>
              <p className="text-xs">
                1. Ve a <span className="font-mono">console.cloud.google.com</span><br/>
                2. Crea un proyecto y habilita Places API<br/>
                3. Crea una API Key y restríngela a tu dominio
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Ingresa tu Google Maps API Key"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              className="text-sm"
            />
            <Button 
              onClick={saveApiKey} 
              size="sm"
              disabled={!tempApiKey.trim()}
            >
              Guardar
            </Button>
          </div>
          
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>
        
        {/* Input básico mientras se configura */}
        <Input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Dirección (configura Google Maps para autocompletado)"}
          required={required}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={isLoading}
      />
      
      {isLoading && (
        <div className="absolute right-2 top-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}
      
      {isLoaded && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowApiKeyInput(true)}
          className="absolute right-1 top-1 h-6 w-6 p-0"
          title="Configurar Google Maps"
        >
          <Settings className="h-3 w-3" />
        </Button>
      )}
      
      {error && !showApiKeyInput && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
};

export default GooglePlacesInput;
