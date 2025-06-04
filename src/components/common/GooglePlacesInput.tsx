
import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Loader } from '@googlemaps/js-api-loader';

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
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // Por ahora permitimos que el usuario ingrese su API key
    // En producción, esto debería venir de variables de entorno seguras
    const savedApiKey = localStorage.getItem('googleMapsApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      initializeGooglePlaces(savedApiKey);
    } else {
      // Mostrar input para API key si no está configurada
      const userApiKey = prompt(
        'Para usar el autocompletado de direcciones, necesitas una API key de Google Maps.\n' +
        'Puedes obtenerla en: https://console.cloud.google.com/\n' +
        'Ingresa tu API key de Google Maps (se guardará localmente):'
      );
      if (userApiKey) {
        localStorage.setItem('googleMapsApiKey', userApiKey);
        setApiKey(userApiKey);
        initializeGooglePlaces(userApiKey);
      }
    }
  }, []);

  const initializeGooglePlaces = async (key: string) => {
    try {
      const loader = new Loader({
        apiKey: key,
        version: 'weekly',
        libraries: ['places']
      });

      await loader.load();
      setIsLoaded(true);

      if (inputRef.current && window.google) {
        const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'pe' } // Restringir a Perú
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.formatted_address) {
            onChange(place.formatted_address);
          }
        });
      }
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      setIsLoaded(false);
    }
  };

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
      />
      {!isLoaded && apiKey && (
        <div className="absolute right-2 top-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default GooglePlacesInput;
