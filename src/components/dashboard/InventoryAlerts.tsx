
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Producto {
  id: number;
  nombre: string;
  cantidad: number;
  minimo: number;
  estado: string;
}

interface InventoryAlertsProps {
  productos: Producto[];
  onDismiss?: () => void;
}

const InventoryAlerts: React.FC<InventoryAlertsProps> = ({ productos, onDismiss }) => {
  const productosCriticos = productos.filter(p => p.estado === 'Crítico');
  const productosBajos = productos.filter(p => p.estado === 'Bajo');

  if (productosCriticos.length === 0 && productosBajos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
      {productosCriticos.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="text-sm sm:text-base">¡Stock Crítico!</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p className="text-xs sm:text-sm">Los siguientes productos necesitan reabastecimiento urgente:</p>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                {productosCriticos.map(producto => (
                  <li key={producto.id}>
                    <strong>{producto.nombre}</strong>: {producto.cantidad} unidades 
                    (mín: {producto.minimo})
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                <Button size="sm" variant="outline" className="text-xs">
                  Reabastecer Ahora
                </Button>
                {onDismiss && (
                  <Button size="sm" variant="ghost" onClick={onDismiss} className="text-xs">
                    Recordar después
                  </Button>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {productosBajos.length > 0 && (
        <Alert>
          <Package className="h-4 w-4" />
          <AlertTitle className="text-sm sm:text-base">Stock Bajo</AlertTitle>
          <AlertDescription>
            <div className="space-y-2">
              <p className="text-xs sm:text-sm">Los siguientes productos están por agotarse:</p>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                {productosBajos.map(producto => (
                  <li key={producto.id}>
                    <strong>{producto.nombre}</strong>: {producto.cantidad} unidades 
                    (mín: {producto.minimo})
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default InventoryAlerts;
