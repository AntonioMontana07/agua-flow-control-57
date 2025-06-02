
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Receipt, Calendar, DollarSign, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import GastoForm from './GastoForm';
import { GastoService } from '@/services/GastoService';
import { Gasto } from '@/lib/database';

const GastosSection: React.FC = () => {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);

  useEffect(() => {
    cargarGastos();
  }, []);

  const cargarGastos = async () => {
    try {
      const gastosData = await GastoService.obtenerTodos();
      setGastos(gastosData);
    } catch (error) {
      console.error('Error al cargar gastos:', error);
    }
  };

  const handleAddGasto = async (nuevoGasto: Omit<Gasto, 'id' | 'fechaCreacion'>) => {
    try {
      if (editingGasto) {
        // Actualizar gasto existente
        const gastoActualizado: Gasto = {
          ...editingGasto,
          ...nuevoGasto
        };
        await GastoService.actualizar(gastoActualizado);
        setEditingGasto(null);
      } else {
        // Crear nuevo gasto
        await GastoService.crear(nuevoGasto);
      }
      
      await cargarGastos();
      setShowForm(false);
    } catch (error) {
      console.error('Error al guardar gasto:', error);
      alert('Error al guardar el gasto');
    }
  };

  const handleEditGasto = (gasto: Gasto) => {
    setEditingGasto(gasto);
    setShowForm(true);
  };

  const handleDeleteGasto = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      try {
        await GastoService.eliminar(id);
        await cargarGastos();
      } catch (error) {
        console.error('Error al eliminar gasto:', error);
        alert('Error al eliminar el gasto');
      }
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingGasto(null);
  };

  const totalGastos = gastos.reduce((sum, gasto) => sum + gasto.cantidad, 0);

  if (showForm) {
    return (
      <GastoForm 
        onSubmit={handleAddGasto}
        onCancel={handleCancelForm}
        initialData={editingGasto}
        isEditing={!!editingGasto}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-primary">Gastos Operativos</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Gasto
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">S/{totalGastos.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">En gastos operativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos Registrados</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gastos.length}</div>
            <p className="text-xs text-muted-foreground">Este período</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de gastos */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gastos.map((gasto) => (
                <TableRow key={gasto.id}>
                  <TableCell>
                    {new Date(gasto.fecha).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell className="font-medium">{gasto.titulo}</TableCell>
                  <TableCell className="font-bold text-red-600">
                    S/{gasto.cantidad.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {gasto.descripcion || 'Sin descripción'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditGasto(gasto)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteGasto(gasto.id!)}
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

export default GastosSection;
