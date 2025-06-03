
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
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-3 overflow-hidden">
        <div className="h-full flex flex-col">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle className="text-lg md:text-xl font-bold text-primary">
              Detalles del Pedido #{pedido.id}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-2 py-2 overflow-hidden">
            {/* Información general */}
            <Card className="h-fit">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3 text-primary" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">ID de Pedido</p>
                      <p className="font-semibold text-sm">#{pedido.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-blue-600" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Fecha del Pedido</p>
                      <p className="font-semibold text-xs">
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
              <CardContent className="p-3">
                <h3 className="text-xs font-semibold mb-2 flex items-center gap-1">
                  <User className="h-3 w-3 text-blue-600" />
                  Cliente
                </h3>
                
                <div className="space-y-1">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Nombre</p>
                    <p className="font-semibold text-xs">{pedido.clienteNombre}</p>
                  </div>
                  
                  <div className="flex items-start gap-1">
                    <MapPin className="h-2.5 w-2.5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Dirección</p>
                      <p className="font-medium text-xs">{pedido.clienteDireccion}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del producto */}
            <Card className="h-fit">
              <CardContent className="p-3">
                <h3 className="text-xs font-semibold mb-2 flex items-center gap-1">
                  <Package className="h-3 w-3 text-green-600" />
                  Producto
                </h3>
                
                <div className="space-y-1">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Nombre</p>
                    <p className="font-semibold text-xs">{pedido.productoNombre}</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] text-muted-foreground">Cantidad</p>
                    <Badge variant="secondary" className="text-xs px-1 py-0.5">
                      {pedido.cantidad} unidades
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información financiera */}
            <Card className="h-fit">
              <CardContent className="p-3">
                <h3 className="text-xs font-semibold mb-2 flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-green-600" />
                  Financiero
                </h3>
                
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-muted-foreground">Precio Unitario</span>
                    <span className="font-semibold text-blue-600 text-xs">S/{pedido.precio.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-[10px] text-muted-foreground">Cantidad</span>
                    <span className="font-semibold text-xs">{pedido.cantidad}</span>
                  </div>
                  
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-xs font-medium">Total a Cobrar</span>
                    <span className="font-bold text-sm text-primary">S/{pedido.total.toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-2 p-1 bg-muted rounded text-[10px]">
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
              <CardContent className="p-3">
                <h3 className="text-xs font-semibold mb-2 flex items-center gap-1">
                  <Clock className="h-3 w-3 text-orange-600" />
                  Entrega
                </h3>
                
                <div className="space-y-1">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Fecha de Entrega</p>
                    <p className="font-semibold text-xs">
                      {new Date(pedido.fechaEntrega).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] text-muted-foreground">Hora de Entrega</p>
                    <p className="font-semibold text-xs">{pedido.horaEntrega}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de registro */}
            <Card className="h-fit">
              <CardContent className="p-3">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">
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
