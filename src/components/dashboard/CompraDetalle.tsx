
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Package, DollarSign, FileText, Hash } from 'lucide-react';
import { Compra } from '@/lib/database';

interface CompraDetalleProps {
  compra: Compra | null;
  isOpen: boolean;
  onClose: () => void;
}

const CompraDetalle: React.FC<CompraDetalleProps> = ({ compra, isOpen, onClose }) => {
  if (!compra) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-3 overflow-hidden">
        <div className="h-full flex flex-col">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle className="text-lg md:text-xl font-bold text-primary">
              Detalles de la Compra #{compra.id}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 py-2 overflow-hidden">
            {/* Información general */}
            <Card className="h-fit">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3 text-primary" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">ID de Compra</p>
                      <p className="font-semibold text-sm">#{compra.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-blue-600" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Fecha</p>
                      <p className="font-semibold text-xs">
                        {new Date(compra.fecha).toLocaleDateString('es-ES', {
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
                    <p className="font-semibold text-xs">{compra.productoNombre}</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] text-muted-foreground">Cantidad</p>
                    <Badge variant="secondary" className="text-xs px-1 py-0.5">
                      {compra.cantidad} unidades
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
                    <span className="font-semibold text-blue-600 text-xs">S/{compra.precio.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-[10px] text-muted-foreground">Cantidad</span>
                    <span className="font-semibold text-xs">{compra.cantidad}</span>
                  </div>
                  
                  <div className="flex justify-between border-t pt-1">
                    <span className="text-xs font-medium">Total</span>
                    <span className="font-bold text-sm text-primary">S/{compra.total.toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-2 p-1 bg-muted rounded text-[10px]">
                    <p className="text-muted-foreground">Cálculo:</p>
                    <p className="font-medium">
                      {compra.cantidad} × S/{compra.precio.toFixed(2)} = S/{compra.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Descripción - solo si existe */}
            {compra.descripcion && (
              <Card className="h-fit sm:col-span-2 lg:col-span-1 xl:col-span-1">
                <CardContent className="p-3">
                  <h3 className="text-xs font-semibold mb-2 flex items-center gap-1">
                    <FileText className="h-3 w-3 text-orange-600" />
                    Descripción
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {compra.descripcion}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Información de registro */}
            <Card className={`h-fit ${compra.descripcion ? 'sm:col-span-2 lg:col-span-3 xl:col-span-1' : 'sm:col-span-2 lg:col-span-3 xl:col-span-1'}`}>
              <CardContent className="p-3">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">
                    Registrado el {new Date(compra.fechaCreacion).toLocaleDateString('es-ES')} a las{' '}
                    {new Date(compra.fechaCreacion).toLocaleTimeString('es-ES', {
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

export default CompraDetalle;
