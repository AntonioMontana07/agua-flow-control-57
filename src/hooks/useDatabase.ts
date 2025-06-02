
import { useEffect, useState } from 'react';
import { dbManager } from '@/lib/database';
import { ProductoService } from '@/services/ProductoService';
import { ClienteService } from '@/services/ClienteService';
import { CompraService } from '@/services/CompraService';
import { VentaService } from '@/services/VentaService';

export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        await dbManager.init();
        
        // Inicializar datos de prueba
        await ProductoService.inicializarDatosPrueba();
        await ClienteService.inicializarDatosPrueba();
        await CompraService.inicializarDatosPrueba();
        await VentaService.inicializarDatosPrueba();

        setIsInitialized(true);
        console.log('Base de datos inicializada correctamente');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al inicializar la base de datos');
        console.error('Error al inicializar la base de datos:', err);
      }
    };

    initializeDatabase();
  }, []);

  return { isInitialized, error };
};
