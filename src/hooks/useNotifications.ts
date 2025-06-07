
import { useEffect, useState } from 'react';
import { NotificationService } from '@/services/NotificationService';
import { ScheduledNotificationService } from '@/services/ScheduledNotificationService';
import { MobilePermissionsService } from '@/services/MobilePermissionsService';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';

export const useNotifications = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');
  const { toast } = useToast();

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        console.log('🔔 Inicializando sistema de notificaciones...');
        
        // Solicitar permisos automáticamente sin diálogos previos
        const permisos = await MobilePermissionsService.solicitarPermisosAutomaticamente();
        
        setHasPermission(permisos.notificaciones);
        setPermissionStatus(permisos.notificaciones ? 'granted' : 'denied');
        
        // Inicializar servicios de notificaciones
        const permissionGranted = await NotificationService.initialize();
        await ScheduledNotificationService.inicializar();
        
        setIsInitialized(true);
        
        // Solo mostrar toast de confirmación cuando todo esté configurado
        if (permisos.notificaciones && permisos.ubicacion) {
          console.log('✅ Sistema completo activado');
          toast({
            title: "✅ Sistema Activado",
            description: "Notificaciones y GPS configurados correctamente",
            duration: 3000
          });
        } else if (permisos.notificaciones) {
          console.log('🔔 Solo notificaciones disponibles');
          toast({
            title: "🔔 Notificaciones Activadas",
            description: "Sistema de alertas configurado",
            duration: 3000
          });
        }
        
      } catch (error) {
        console.error('❌ Error al inicializar notificaciones:', error);
        setIsInitialized(true);
        
        toast({
          title: "⚠️ Configuración Pendiente",
          description: "Algunos permisos no fueron concedidos",
          variant: "destructive",
          duration: 3000
        });
      }
    };

    initializeNotifications();
  }, [toast]);

  const solicitarPermisosNuevamente = async () => {
    try {
      console.log('🔄 Re-solicitando permisos...');
      
      const permisos = await MobilePermissionsService.solicitarPermisosAutomaticamente();
      
      setHasPermission(permisos.notificaciones);
      setPermissionStatus(permisos.notificaciones ? 'granted' : 'denied');
      
      if (permisos.notificaciones) {
        toast({
          title: "✅ Permisos Activados",
          description: "Sistema configurado correctamente"
        });
      }
      
      return permisos;
    } catch (error) {
      console.error('❌ Error al solicitar permisos:', error);
      return { ubicacion: false, notificaciones: false, mensajes: ['Error al solicitar permisos'] };
    }
  };

  const notificarStockBajo = async (producto: string, cantidad: number, minimo: number) => {
    try {
      console.log(`📦 Enviando notificación de stock bajo: ${producto} (${cantidad}/${minimo})`);
      const success = await NotificationService.enviarNotificacionStock(producto, cantidad, minimo);
      if (success && hasPermission) {
        toast({
          title: "⚠️ Stock Bajo",
          description: `${producto}: ${cantidad} unidades disponibles (mín: ${minimo})`,
          variant: "destructive"
        });
      }
      return success;
    } catch (error) {
      console.log('❌ Error al enviar notificación de stock:', error);
      return false;
    }
  };

  const notificarNuevoPedido = async (cliente: string, producto: string, total: number) => {
    try {
      console.log(`📝 Enviando notificación de nuevo pedido: ${cliente} - ${producto}`);
      const success = await NotificationService.enviarNotificacionPedido(cliente, producto, total);
      if (success && hasPermission) {
        toast({
          title: "📝 Nuevo Pedido",
          description: `${cliente} - ${producto} (S/${total.toFixed(2)})`,
        });
      }
      return success;
    } catch (error) {
      console.log('❌ Error al enviar notificación de pedido:', error);
      return false;
    }
  };

  const notificarStockCritico = async (productos: Array<{nombre: string, cantidad: number, minimo: number}>) => {
    try {
      console.log(`🚨 Enviando notificación de stock crítico para ${productos.length} productos`);
      const success = await NotificationService.enviarNotificacionStockCritico(productos);
      if (success && hasPermission) {
        toast({
          title: "🚨 ¡Stock Crítico!",
          description: `${productos.length} productos necesitan reabastecimiento urgente`,
          variant: "destructive"
        });
      }
      return success;
    } catch (error) {
      console.log('❌ Error al enviar notificación de stock crítico:', error);
      return false;
    }
  };

  return {
    notificarStockBajo,
    notificarNuevoPedido,
    notificarStockCritico,
    solicitarPermisosNuevamente,
    isInitialized,
    hasPermission,
    permissionStatus
  };
};
