
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            Detalles de la Compra
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
                    <p className="text-sm text-muted-foreground">ID de Compra</p>
                    <p className="font-semibold">#{compra.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Compra</p>
                    <p className="font-semibold">
                      {new Date(compra.fecha).toLocaleDateString('es-ES', {
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
                  <p className="font-semibold text-lg">{compra.productoNombre}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Cantidad</p>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {compra.cantidad} unidades
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
                    S/{compra.precio.toFixed(2)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Cantidad</p>
                  <p className="font-semibold text-xl">
                    {compra.cantidad}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Total Pagado</p>
                  <p className="font-bold text-2xl text-primary">
                    S/{compra.total.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Cálculo</p>
                <p className="font-medium">
                  {compra.cantidad} unidades × S/{compra.precio.toFixed(2)} = S/{compra.total.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Descripción */}
          {compra.descripcion && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Descripción
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {compra.descripcion}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Información de registro */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Compra registrada el {new Date(compra.fechaCreacion).toLocaleDateString('es-ES')} a las{' '}
                  {new Date(compra.fechaCreacion).toLocaleTimeString('es-ES', {
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

export default CompraDetalle;
