
import { useEffect, useState } from 'react';
import { dbManager } from '@/lib/database';
import { ProductoService } from '@/services/ProductoService';
import { ClienteService } from '@/services/ClienteService';
import { CompraService } from '@/services/CompraService';
import { VentaService } from '@/services/VentaService';
import { GastoService } from '@/services/GastoService';
import { PedidoService } from '@/services/PedidoService';
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
        
        // Verificar si el usuario ya tiene datos inicializados
        const hasInitializedData = localStorage.getItem(`db_initialized_${user.id}`);
        
        if (!hasInitializedData) {
          console.log('Inicializando datos de prueba para nuevo usuario:', user.id);
          // Solo inicializar datos de prueba para usuarios nuevos
          await ProductoService.inicializarDatosPrueba();
          await ClienteService.inicializarDatosPrueba();
          await CompraService.inicializarDatosPrueba();
          await VentaService.inicializarDatosPrueba();
          await GastoService.inicializarDatosPrueba();
          await PedidoService.inicializarDatosPrueba();
          
          // Marcar como inicializado para este usuario
          localStorage.setItem(`db_initialized_${user.id}`, 'true');
          console.log('Datos de prueba inicializados para usuario:', user.id);
        } else {
          console.log('Usuario ya tiene datos inicializados, omitiendo inicialización:', user.id);
        }

        setIsInitialized(true);
        console.log('Base de datos configurada correctamente para usuario:', user.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al inicializar la base de datos');
        console.error('Error al inicializar la base de datos:', err);
      }
    };

    initializeDatabase();
  }, [user]);

  return { isInitialized, error };
};
