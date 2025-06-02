
import { useEffect, useState } from 'react';
import { dbManager } from '@/lib/database';
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
        
        console.log('Base de datos configurada para usuario:', user.id);
        console.log('Usuario comenzará con una aplicación completamente limpia (sin datos de prueba)');

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
