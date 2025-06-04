
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Package, Calendar } from 'lucide-react';
import { useScheduledNotifications } from '@/hooks/useScheduledNotifications';

const NotificationSettings: React.FC = () => {
  const {
    isStockReminderActive,
    stockReminderInterval,
    notificacionesProgramadas,
    activarRecordatorioStock,
    desactivarRecordatorioStock,
    verificarStockBajo
  } = useScheduledNotifications();

  const [intervaloStock, setIntervaloStock] = useState(stockReminderInterval);

  const handleToggleStockReminder = async () => {
    if (isStockReminderActive) {
      desactivarRecordatorioStock();
    } else {
      await activarRecordatorioStock(intervaloStock);
    }
  };

  const handleTestStockCheck = async () => {
    await verificarStockBajo();
  };

  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6 text-primary" />
        <h3 className="text-2xl font-bold text-primary">Configuración de Notificaciones</h3>
      </div>

      {/* Recordatorio de Stock */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Recordatorio de Stock Automático
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Activar recordatorios automáticos</Label>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones periódicas para revisar el stock
              </p>
            </div>
            <Switch
              checked={isStockReminderActive}
              onCheckedChange={handleToggleStockReminder}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="intervalo">Intervalo (minutos)</Label>
              <Input
                id="intervalo"
                type="number"
                min="15"
                max="1440"
                value={intervaloStock}
                onChange={(e) => setIntervaloStock(Number(e.target.value))}
                disabled={isStockReminderActive}
              />
            </div>
            <Button
              variant="outline"
              onClick={handleTestStockCheck}
              className="mt-6"
            >
              Probar Ahora
            </Button>
          </div>
          
          {isStockReminderActive && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-700">
                ✅ Recordatorios activos cada {stockReminderInterval} minutos
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notificaciones Programadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Notificaciones Programadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notificacionesProgramadas.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay notificaciones programadas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notificacionesProgramadas.map((notificacion) => (
                <div key={notificacion.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={notificacion.tipo === 'stock' ? 'secondary' : 'default'}>
                        {notificacion.tipo === 'stock' ? 'Stock' : 'Pedido'}
                      </Badge>
                      {notificacion.repetir && (
                        <Badge variant="outline">Repetir</Badge>
                      )}
                    </div>
                    <h4 className="font-medium">{notificacion.titulo}</h4>
                    <p className="text-sm text-muted-foreground">{notificacion.mensaje}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      📅 {formatearFecha(notificacion.fechaHora)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información sobre notificaciones móviles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Información sobre Notificaciones Móviles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-600">✅</span>
              <span>Las notificaciones funcionan en segundo plano en dispositivos móviles</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✅</span>
              <span>Los recordatorios de stock se envían cada hora por defecto</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-600">✅</span>
              <span>Las alertas de pedidos se envían 30 minutos antes de la entrega</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600">ℹ️</span>
              <span>Asegúrate de permitir notificaciones en la configuración de tu dispositivo</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
