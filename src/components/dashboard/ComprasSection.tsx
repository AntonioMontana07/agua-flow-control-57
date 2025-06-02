
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, Calendar, DollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CompraForm from './CompraForm';

interface Compra {
  id: number;
  cantidad: number;
  fecha: string;
  descripcion: string;
  precio: number;
  total: number;
}

const ComprasSection: React.FC = () => {
  const [compras, setCompras] = useState<Compra[]>([
    {
      id: 1,
      cantidad: 50,
      fecha: '2024-01-15',
      descripcion: 'Recarga semanal de garrafones',
      precio: 15.00,
      total: 750.00
    },
    {
      id: 2,
      cantidad: 30,
      fecha: '2024-01-10',
      descripcion: 'Recarga de emergencia',
      precio: 15.00,
      total: 450.00
    }
  ]);
  
  const [showForm, setShowForm] = useState(false);

  const handleAddCompra = (nuevaCompra: Omit<Compra, 'id' | 'total'>) => {
    const compra: Compra = {
      ...nuevaCompra,
      id: compras.length + 1,
      total: nuevaCompra.cantidad * nuevaCompra.precio
    };
    
    setCompras(prev => [compra, ...prev]);
    setShowForm(false);
  };

  const totalCompras = compras.reduce((sum, compra) => sum + compra.total, 0);
  const totalCantidad = compras.reduce((sum, compra) => sum + compra.cantidad, 0);

  if (showForm) {
    return (
      <CompraForm 
        onSubmit={handleAddCompra}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary">Compras de Recarga</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Compra
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCompras.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">En recargas este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Unidades</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCantidad}</div>
            <p className="text-xs text-muted-foreground">Garrafones comprados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compras Realizadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{compras.length}</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de compras */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Compras</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio Unitario</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {compras.map((compra) => (
                <TableRow key={compra.id}>
                  <TableCell>
                    {new Date(compra.fecha).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {compra.cantidad} unidades
                  </TableCell>
                  <TableCell>${compra.precio.toFixed(2)}</TableCell>
                  <TableCell className="font-bold text-primary">
                    ${compra.total.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {compra.descripcion || 'Sin descripción'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComprasSection;
