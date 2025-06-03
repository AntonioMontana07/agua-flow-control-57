
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Package, DollarSign, FileText, Hash, MapPin, Clock, User } from 'lucide-react';
import { Pedido } from '@/services/PedidoService';

interface PedidoDetalleProps {
  pedido: Pedido | null;
  isOpen: boolean;
  onClose: () => void;
}

const PedidoDetalle: React.FC<PedidoDetalleProps> = ({ pedido, isOpen, onClose }) => {
  if (!pedido) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Detalles del Pedido
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Información general */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Hash className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">ID de Pedido</p>
                    <p className="font-semibold">#{pedido.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Pedido</p>
                    <p className="font-semibold">
                      {new Date(pedido.fecha).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del cliente */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                Información del Cliente
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-semibold text-lg">{pedido.clienteNombre}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dirección de Entrega</p>
                    <p className="font-medium">{pedido.clienteDireccion}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del producto */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-green-600" />
                Información del Producto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Producto</p>
                  <p className="font-semibold text-lg">{pedido.productoNombre}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Cantidad</p>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {pedido.cantidad} unidades
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información financiera */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Información Financiera
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Precio Unitario</p>
                  <p className="font-semibold text-xl text-blue-600">
                    S/{pedido.precio.toFixed(2)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Cantidad</p>
                  <p className="font-semibold text-xl">
                    {pedido.cantidad}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Total a Cobrar</p>
                  <p className="font-bold text-2xl text-primary">
                    S/{pedido.total.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Cálculo</p>
                <p className="font-medium">
                  {pedido.cantidad} unidades × S/{pedido.precio.toFixed(2)} = S/{pedido.total.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Programación de entrega */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Programación de Entrega
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Entrega</p>
                  <p className="font-semibold text-lg">
                    {new Date(pedido.fechaEntrega).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Hora de Entrega</p>
                  <p className="font-semibold text-lg">{pedido.horaEntrega}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de registro */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Pedido registrado el {new Date(pedido.fechaCreacion).toLocaleDateString('es-ES')} a las{' '}
                  {new Date(pedido.fechaCreacion).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PedidoDetalle;
