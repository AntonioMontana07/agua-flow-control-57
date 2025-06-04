
import { useEffect, useState } from 'react';
import { NotificationService } from '@/services/NotificationService';
import { Capacitor } from '@capacitor/core';

export const useNotifications = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        console.log('Inicializando sistema de notificaciones...');
        
        // Siempre marcar como inicializado para no bloquear la app
        setIsInitialized(true);
        
        if (Capacitor.isNativePlatform()) {
          // Ejecutar la inicialización en background sin bloquear
          NotificationService.initialize()
            .then((success) => {
              console.log('Notificaciones inicializadas:', success);
              if (!success) {
                console.log('Notificaciones no disponibles completamente, pero la app continuará');
              }
            })
            .catch((error) => {
              console.log('Error en inicialización de notificaciones (no crítico):', error);
              // No cambiar el estado de error para no afectar la UI
            });
        } else {
          console.log('Plataforma web - notificaciones no disponibles');
        }
      } catch (error) {
        console.log('Error general en inicialización (continuando):', error);
        // Mantener inicializado en true para no bloquear la app
        setIsInitialized(true);
      }
    };

    initializeNotifications();
  }, []);

  const notificarStockBajo = async (producto: string, cantidad: number, minimo: number) => {
    if (Capacitor.isNativePlatform()) {
      try {
        await NotificationService.enviarNotificacionStock(producto, cantidad, minimo);
      } catch (error) {
        console.error('Error al enviar notificación de stock:', error);
      }
    }
  };

  const notificarNuevoPedido = async (cliente: string, producto: string, total: number) => {
    if (Capacitor.isNativePlatform()) {
      try {
        await NotificationService.enviarNotificacionPedido(cliente, producto, total);
      } catch (error) {
        console.error('Error al enviar notificación de pedido:', error);
      }
    }
  };

  const notificarStockCritico = async (productos: Array<{nombre: string, cantidad: number, minimo: number}>) => {
    if (Capacitor.isNativePlatform()) {
      try {
        await NotificationService.enviarNotificacionStockCritico(productos);
      } catch (error) {
        console.error('Error al enviar notificación de stock crítico:', error);
      }
    }
  };

  return {
    notificarStockBajo,
    notificarNuevoPedido,
    notificarStockCritico,
    isInitialized,
    error
  };
};
