
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
        console.log('Iniciando configuración de base de datos...');
        
        if (!user) {
          console.log('No hay usuario, limpiando estado de base de datos');
          setIsInitialized(false);
          setError(null);
          return;
        }

        console.log('Usuario detectado:', user.id);
        
        // Reiniciar estado de error
        setError(null);
        
        // Inicializar la base de datos
        await dbManager.init();
        console.log('Base de datos inicializada correctamente');
        
        // Configurar la base de datos para el usuario actual
        dbManager.setCurrentUser(user.id);
        console.log('Base de datos configurada para usuario:', user.id);

        // Marcar como inicializada
        setIsInitialized(true);
        console.log('Configuración de base de datos completada para usuario:', user.id);
        
      } catch (err) {
        console.error('Error al inicializar la base de datos:', err);
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido al inicializar la base de datos';
        setError(errorMessage);
        setIsInitialized(false);
        
        // Intentar limpiar y reinicializar en caso de error
        try {
          console.log('Intentando recuperación de base de datos...');
          // Dar tiempo para que se liberen recursos
          setTimeout(async () => {
            try {
              await dbManager.init();
              if (user) {
                dbManager.setCurrentUser(user.id);
                setIsInitialized(true);
                setError(null);
                console.log('Recuperación exitosa de base de datos');
              }
            } catch (retryErr) {
              console.error('Error en recuperación:', retryErr);
            }
          }, 1000);
        } catch (recoveryErr) {
          console.error('Error en intento de recuperación:', recoveryErr);
        }
      }
    };

    initializeDatabase();
  }, [user]);

  return { isInitialized, error };
};
