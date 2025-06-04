
import { useEffect, useState } from 'react';
import { NotificationService } from '@/services/NotificationService';
import { Capacitor } from '@capacitor/core';

export const useNotifications = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        console.log('Inicializando sistema de notificaciones...');
        
        // Marcar como inicializado inmediatamente para no bloquear la app
        setIsInitialized(true);
        
        if (Capacitor.isNativePlatform()) {
          // Ejecutar inicialización en background sin esperar
          NotificationService.initialize().catch((error) => {
            console.log('Error en inicialización de notificaciones (no crítico):', error);
          });
        } else {
          console.log('Plataforma web - notificaciones no disponibles');
        }
      } catch (error) {
        console.log('Error general en inicialización (continuando):', error);
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
    isInitialized
  };
};
