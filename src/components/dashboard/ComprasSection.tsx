
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Package, Calendar, DollarSign, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CompraForm from './CompraForm';
import { CompraService } from '@/services/CompraService';
import { Compra } from '@/lib/database';

const ComprasSection: React.FC = () => {
  const [compras, setCompras] = useState<Compra[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCompra, setEditingCompra] = useState<Compra | null>(null);

  useEffect(() => {
    cargarCompras();
  }, []);

  const cargarCompras = async () => {
    try {
      const comprasData = await CompraService.obtenerTodas();
      setCompras(comprasData);
    } catch (error) {
      console.error('Error al cargar compras:', error);
    }
  };

  const handleAddCompra = async (nuevaCompra: Omit<Compra, 'id' | 'total'>) => {
    try {
      if (editingCompra) {
        // Actualizar compra existente
        const compraActualizada: Compra = {
          ...editingCompra,
          ...nuevaCompra,
          total: nuevaCompra.cantidad * nuevaCompra.precio
        };
        await CompraService.actualizar(compraActualizada);
        setEditingCompra(null);
      } else {
        // Crear nueva compra
        await CompraService.crear(nuevaCompra);
      }
      
      await cargarCompras();
      setShowForm(false);
    } catch (error) {
      console.error('Error al guardar compra:', error);
      alert('Error al guardar la compra');
    }
  };

  const handleEditCompra = (compra: Compra) => {
    setEditingCompra(compra);
    setShowForm(true);
  };

  const handleDeleteCompra = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta compra?')) {
      try {
        await CompraService.eliminar(id);
        await cargarCompras();
      } catch (error) {
        console.error('Error al eliminar compra:', error);
        alert('Error al eliminar la compra');
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCompra(null);
  };

  const totalCompras = compras.reduce((sum, compra) => sum + compra.total, 0);
  const totalCantidad = compras.reduce((sum, compra) => sum + compra.cantidad, 0);

  if (showForm) {
    return (
      <CompraForm 
        onSubmit={handleAddCompra}
        onCancel={handleCancelForm}
        initialData={editingCompra}
        isEditing={!!editingCompra}
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
            <div className="text-2xl font-bold">S/{totalCompras.toFixed(2)}</div>
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
                <TableHead>Acciones</TableHead>
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
                  <TableCell>S/{compra.precio.toFixed(2)}</TableCell>
                  <TableCell className="font-bold text-primary">
                    S/{compra.total.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {compra.descripcion || 'Sin descripción'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCompra(compra)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCompra(compra.id!)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
