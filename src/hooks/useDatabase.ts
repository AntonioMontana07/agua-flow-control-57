
import { useEffect, useState } from 'react';
import { dbManager } from '@/lib/database';
import { ProductoService } from '@/services/ProductoService';
import { ClienteService } from '@/services/ClienteService';
import { CompraService } from '@/services/CompraService';
import { VentaService } from '@/services/VentaService';
import { useAuth } from '@/contexts/AuthContext';

export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        if (!user) {
          setIsInitialized(false);
          return;
        }

        await dbManager.init();
        
        // Configurar la base de datos para el usuario actual
        dbManager.setCurrentUser(user.id);
        
        // Inicializar datos de prueba para el usuario actual
        await ProductoService.inicializarDatosPrueba();
        await ClienteService.inicializarDatosPrueba();
        await CompraService.inicializarDatosPrueba();
        await VentaService.inicializarDatosPrueba();

        setIsInitialized(true);
        console.log('Base de datos inicializada correctamente para usuario:', user.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al inicializar la base de datos');
        console.error('Error al inicializar la base de datos:', err);
      }
    };

    initializeDatabase();
  }, [user]);

  return { isInitialized, error };
};
