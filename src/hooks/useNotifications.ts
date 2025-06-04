
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
        console.log('🔔 Inicializando sistema completo de notificaciones...');
        
        // Solicitar todos los permisos necesarios
        const permisos = await MobilePermissionsService.verificarYSolicitarTodosLosPermisos();
        
        setHasPermission(permisos.notificaciones);
        setPermissionStatus(permisos.notificaciones ? 'granted' : 'denied');
        
        // Inicializar servicios de notificaciones
        const permissionGranted = await NotificationService.initialize();
        await ScheduledNotificationService.inicializar();
        
        setIsInitialized(true);
        
        if (permisos.notificaciones && permisos.ubicacion) {
          console.log('✅ Todos los permisos concedidos - Sistema completo activado');
          
          toast({
            title: "🎉 ¡Sistema Completo Activado!",
            description: "Notificaciones automáticas cada hora y GPS disponible",
            duration: 6000
          });
        } else if (permisos.notificaciones) {
          console.log('🔔 Solo notificaciones disponibles');
          
          toast({
            title: "🔔 Notificaciones Activadas",
            description: "Recibirás alertas automáticas. Para GPS, activa permisos de ubicación",
            duration: 6000
          });
        } else if (permisos.ubicacion) {
          console.log('📍 Solo ubicación disponible');
          
          toast({
            title: "📍 Ubicación Disponible",
            description: "GPS activado. Para alertas automáticas, activa notificaciones",
            duration: 6000
          });
        } else {
          console.log('⚠️ Permisos limitados');
          
          const plataforma = Capacitor.isNativePlatform() 
            ? (Capacitor.getPlatform() === 'ios' ? 'ios' : 'android')
            : 'web';
            
          const instrucciones = MobilePermissionsService.mostrarInstruccionesConfiguracion(plataforma);
          
          toast({
            title: "⚙️ Configuración Requerida",
            description: `Ve a Configuración de tu dispositivo para activar permisos`,
            variant: "destructive",
            duration: 10000
          });
        }
        
        // Mostrar mensajes específicos
        permisos.mensajes.forEach((mensaje, index) => {
          setTimeout(() => {
            console.log(mensaje);
          }, index * 500);
        });
        
      } catch (error) {
        console.error('❌ Error al inicializar notificaciones:', error);
        setIsInitialized(true);
        
        toast({
          title: "❌ Error de Inicialización",
          description: "Hubo un problema al configurar las notificaciones",
          variant: "destructive"
        });
      }
    };

    initializeNotifications();
  }, [toast]);

  const solicitarPermisosNuevamente = async () => {
    try {
      console.log('🔄 Re-solicitando permisos...');
      
      const permisos = await MobilePermissionsService.verificarYSolicitarTodosLosPermisos();
      
      setHasPermission(permisos.notificaciones);
      setPermissionStatus(permisos.notificaciones ? 'granted' : 'denied');
      
      if (permisos.notificaciones) {
        toast({
          title: "✅ Permisos Actualizados",
          description: "Notificaciones activadas correctamente"
        });
      } else {
        toast({
          title: "⚠️ Permisos Requeridos",
          description: "Ve a Configuración para activar notificaciones",
          variant: "destructive"
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
