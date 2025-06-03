
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Package, DollarSign, Hash, MapPin, Clock, User } from 'lucide-react';
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
      <DialogContent className="max-w-6xl h-[95vh] p-4 overflow-hidden">
        <div className="h-full flex flex-col">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl md:text-2xl font-bold text-primary">
              Detalles del Pedido #{pedido.id}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 py-4 overflow-hidden">
            {/* Información general */}
            <Card className="h-fit">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">ID de Pedido</p>
                      <p className="font-semibold">#{pedido.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fecha del Pedido</p>
                      <p className="font-semibold text-sm">
                        {new Date(pedido.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del cliente */}
            <Card className="h-fit">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Cliente
                </h3>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Nombre</p>
                    <p className="font-semibold text-sm">{pedido.clienteNombre}</p>
                  </div>
                  
                  <div className="flex items-start gap-1">
                    <MapPin className="h-3 w-3 text-red-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Dirección</p>
                      <p className="font-medium text-sm">{pedido.clienteDireccion}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del producto */}
            <Card className="h-fit">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-600" />
                  Producto
                </h3>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Nombre</p>
                    <p className="font-semibold text-sm">{pedido.productoNombre}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Cantidad</p>
                    <Badge variant="secondary" className="text-sm px-2 py-1">
                      {pedido.cantidad} unidades
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información financiera */}
            <Card className="h-fit">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Financiero
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Precio Unitario</span>
                    <span className="font-semibold text-blue-600">S/{pedido.precio.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Cantidad</span>
                    <span className="font-semibold">{pedido.cantidad}</span>
                  </div>
                  
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Total a Cobrar</span>
                    <span className="font-bold text-lg text-primary">S/{pedido.total.toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-3 p-2 bg-muted rounded text-xs">
                    <p className="text-muted-foreground">Cálculo:</p>
                    <p className="font-medium">
                      {pedido.cantidad} × S/{pedido.precio.toFixed(2)} = S/{pedido.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Programación de entrega */}
            <Card className="h-fit">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  Entrega
                </h3>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha de Entrega</p>
                    <p className="font-semibold text-sm">
                      {new Date(pedido.fechaEntrega).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Hora de Entrega</p>
                    <p className="font-semibold text-sm">{pedido.horaEntrega}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de registro */}
            <Card className="h-fit">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Registrado el {new Date(pedido.fechaCreacion).toLocaleDateString('es-ES')} a las{' '}
                    {new Date(pedido.fechaCreacion).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PedidoDetalle;
