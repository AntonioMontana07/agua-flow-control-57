
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, DollarSign, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Venta {
  id: number;
  clienteId: number;
  clienteNombre: string;
  fecha: string;
  hora: string;
  precio: number;
  descripcion: string;
}

interface Compra {
  id: number;
  cantidad: number;
  fecha: string;
  precio: number;
  total: number;
}

const ReportesSection: React.FC = () => {
  const [fechaInicio, setFechaInicio] = useState('2024-01-01');
  const [fechaFin, setFechaFin] = useState('2024-12-31');

  // Datos de ejemplo (en una app real vendrían de un estado global o API)
  const ventas: Venta[] = [
    { id: 1, clienteId: 1, clienteNombre: 'María González', fecha: '2024-01-15', hora: '10:30', precio: 45.00, descripcion: 'Entrega de 3 garrafones' },
    { id: 2, clienteId: 2, clienteNombre: 'Juan Pérez', fecha: '2024-01-16', hora: '14:20', precio: 30.00, descripcion: 'Entrega de 2 garrafones' },
    { id: 3, clienteId: 1, clienteNombre: 'María González', fecha: '2024-01-18', hora: '09:15', precio: 60.00, descripcion: 'Entrega de 4 garrafones' },
    { id: 4, clienteId: 3, clienteNombre: 'Carlos López', fecha: '2024-01-20', hora: '16:45', precio: 15.00, descripcion: 'Entrega de 1 garrafón' },
  ];

  const compras: Compra[] = [
    { id: 1, cantidad: 50, fecha: '2024-01-15', precio: 15.00, total: 750.00 },
    { id: 2, cantidad: 30, fecha: '2024-01-10', precio: 15.00, total: 450.00 },
  ];

  const ventasFiltradas = useMemo(() => {
    return ventas.filter(venta => {
      const fechaVenta = new Date(venta.fecha);
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      return fechaVenta >= inicio && fechaVenta <= fin;
    });
  }, [ventas, fechaInicio, fechaFin]);

  const comprasFiltradas = useMemo(() => {
    return compras.filter(compra => {
      const fechaCompra = new Date(compra.fecha);
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      return fechaCompra >= inicio && fechaCompra <= fin;
    });
  }, [compras, fechaInicio, fechaFin]);

  const totalGanancias = ventasFiltradas.reduce((sum, venta) => sum + venta.precio, 0);
  const totalGastos = comprasFiltradas.reduce((sum, compra) => sum + compra.total, 0);
  const gananciaNeta = totalGanancias - totalGastos;

  // Cliente con más compras
  const clienteStats = useMemo(() => {
    const stats = ventasFiltradas.reduce((acc, venta) => {
      if (!acc[venta.clienteId]) {
        acc[venta.clienteId] = {
          nombre: venta.clienteNombre,
          totalCompras: 0,
          totalGanancias: 0,
          numeroCompras: 0
        };
      }
      acc[venta.clienteId].totalGanancias += venta.precio;
      acc[venta.clienteId].numeroCompras += 1;
      return acc;
    }, {} as Record<number, any>);

    const clientesArray = Object.values(stats);
    const clienteMasCompras = clientesArray.reduce((max, cliente) => 
      cliente.numeroCompras > max.numeroCompras ? cliente : max, 
      { numeroCompras: 0, nombre: 'N/A', totalGanancias: 0 }
    );

    const clienteMayorGanancia = clientesArray.reduce((max, cliente) => 
      cliente.totalGanancias > max.totalGanancias ? cliente : max, 
      { totalGanancias: 0, nombre: 'N/A', numeroCompras: 0 }
    );

    return { clienteMasCompras, clienteMayorGanancia };
  }, [ventasFiltradas]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-primary">Reportes</h2>
          <p className="text-muted-foreground">Análisis de ventas y ganancias</p>
        </div>
      </div>

      {/* Filtros de fecha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtros de Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio">Fecha de Inicio</Label>
              <Input
                id="fechaInicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaFin">Fecha de Fin</Label>
              <Input
                id="fechaFin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ganancias</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalGanancias.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Ingresos por ventas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalGastos.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Gastos en recargas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${gananciaNeta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${gananciaNeta.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Ganancias - Gastos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{ventasFiltradas.length}</div>
            <p className="text-xs text-muted-foreground">Ventas realizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cliente con Más Compras</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-semibold">{clienteStats.clienteMasCompras.nombre}</p>
              <p className="text-sm text-muted-foreground">
                {clienteStats.clienteMasCompras.numeroCompras} compras realizadas
              </p>
              <p className="text-sm text-muted-foreground">
                Total generado: ${clienteStats.clienteMasCompras.totalGanancias.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cliente con Mayor Ganancia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-lg font-semibold">{clienteStats.clienteMayorGanancia.nombre}</p>
              <p className="text-sm text-muted-foreground">
                ${clienteStats.clienteMayorGanancia.totalGanancias.toFixed(2)} en ganancias
              </p>
              <p className="text-sm text-muted-foreground">
                {clienteStats.clienteMayorGanancia.numeroCompras} compras realizadas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de ventas del período */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas del Período Seleccionado</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ventasFiltradas.map((venta) => (
                <TableRow key={venta.id}>
                  <TableCell>
                    {new Date(venta.fecha).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell className="font-medium">{venta.clienteNombre}</TableCell>
                  <TableCell>{venta.hora}</TableCell>
                  <TableCell className="font-bold text-green-600">
                    ${venta.precio.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {venta.descripcion}
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

export default ReportesSection;
