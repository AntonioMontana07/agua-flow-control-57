
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, AlertTriangle } from 'lucide-react';

const InventarioSection: React.FC = () => {
  const productos = [
    { id: 1, nombre: 'Bidón 20L', cantidad: 45, precio: 25.00, minimo: 10, estado: 'Disponible' },
    { id: 2, nombre: 'Bidón 10L', cantidad: 8, precio: 15.00, minimo: 10, estado: 'Bajo' },
    { id: 3, nombre: 'Botella 1L', cantidad: 120, precio: 3.50, minimo: 50, estado: 'Disponible' },
    { id: 4, nombre: 'Botella 500ml', cantidad: 5, precio: 2.00, minimo: 20, estado: 'Crítico' },
    { id: 5, nombre: 'Bidón 5L', cantidad: 25, precio: 8.00, minimo: 15, estado: 'Disponible' },
  ];

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Disponible': return 'bg-green-100 text-green-800';
      case 'Bajo': return 'bg-yellow-100 text-yellow-800';
      case 'Crítico': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-primary">Inventario</h2>
          <p className="text-muted-foreground">Gestiona tu stock de productos</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Productos</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar productos..." 
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Producto</th>
                  <th className="text-left p-4">Cantidad</th>
                  <th className="text-left p-4">Precio</th>
                  <th className="text-left p-4">Estado</th>
                  <th className="text-left p-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium">{producto.nombre}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{producto.cantidad}</span>
                        {producto.cantidad < producto.minimo && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">${producto.precio.toFixed(2)}</td>
                    <td className="p-4">
                      <Badge className={getEstadoColor(producto.estado)}>
                        {producto.estado}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          Reabastecer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">203</div>
            <p className="text-sm text-muted-foreground">unidades en stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Valor del Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">$3,247.50</div>
            <p className="text-sm text-muted-foreground">valor total estimado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Productos Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">3</div>
            <p className="text-sm text-muted-foreground">requieren reabastecimiento</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventarioSection;
