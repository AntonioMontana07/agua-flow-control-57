
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
      <DialogContent className="max-w-6xl h-[95vh] p-4 overflow-hidden">
        <div className="h-full flex flex-col">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="text-xl md:text-2xl font-bold text-primary">
              Detalles de la Compra #{compra.id}
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
                      <p className="text-xs text-muted-foreground">ID de Compra</p>
                      <p className="font-semibold">#{compra.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-muted-foreground">Fecha</p>
                      <p className="font-semibold text-sm">
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
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-green-600" />
                  Producto
                </h3>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Nombre</p>
                    <p className="font-semibold text-sm">{compra.productoNombre}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground">Cantidad</p>
                    <Badge variant="secondary" className="text-sm px-2 py-1">
                      {compra.cantidad} unidades
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información financiera */}
            <Card className="h-fit lg:col-span-2 xl:col-span-1">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  Financiero
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Precio Unitario</span>
                    <span className="font-semibold text-blue-600">S/{compra.precio.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Cantidad</span>
                    <span className="font-semibold">{compra.cantidad}</span>
                  </div>
                  
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-medium">Total</span>
                    <span className="font-bold text-lg text-primary">S/{compra.total.toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-3 p-2 bg-muted rounded text-xs">
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
              <Card className="h-fit lg:col-span-2 xl:col-span-2">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-600" />
                    Descripción
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {compra.descripcion}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Información de registro */}
            <Card className={`h-fit ${compra.descripcion ? 'xl:col-span-1' : 'lg:col-span-2 xl:col-span-2'}`}>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
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
