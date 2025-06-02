
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, DollarSign, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { VentaService } from '@/services/VentaService';
import { CompraService } from '@/services/CompraService';
import { GastoService } from '@/services/GastoService';
import { Venta, Compra, Gasto } from '@/lib/database';

const ReportesSection: React.FC = () => {
  const [fechaInicio, setFechaInicio] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [ventas, setVentas] = useState<Venta[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [ventasData, comprasData, gastosData] = await Promise.all([
        VentaService.obtenerTodas(),
        CompraService.obtenerTodas(),
        GastoService.obtenerTodos()
      ]);
      setVentas(ventasData);
      setCompras(comprasData);
      setGastos(gastosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const gastosFiltrados = useMemo(() => {
    return gastos.filter(gasto => {
      const fechaGasto = new Date(gasto.fecha);
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      return fechaGasto >= inicio && fechaGasto <= fin;
    });
  }, [gastos, fechaInicio, fechaFin]);

  const totalIngresos = ventasFiltradas.reduce((sum, venta) => sum + venta.precio, 0);
  const totalCompras = comprasFiltradas.reduce((sum, compra) => sum + compra.total, 0);
  const totalGastos = gastosFiltrados.reduce((sum, gasto) => sum + gasto.cantidad, 0);
  const totalEgresos = totalCompras + totalGastos;
  const gananciaNeta = totalIngresos - totalEgresos;

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary">Reportes</h2>
            <p className="text-muted-foreground">Análisis de ventas y ganancias</p>
          </div>
        </div>
        <div className="text-center">Cargando datos...</div>
      </div>
    );
  }

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
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">S/{totalIngresos.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Ingresos por ventas ({ventasFiltradas.length} ventas)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Egresos</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">S/{totalEgresos.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Compras: S/{totalCompras.toFixed(2)} | Gastos: S/{totalGastos.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Neta</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${gananciaNeta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              S/{gananciaNeta.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Ingresos - Egresos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {ventasFiltradas.length + comprasFiltradas.length + gastosFiltrados.length}
            </div>
            <p className="text-xs text-muted-foreground">Total de movimientos</p>
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
                Total generado: S/{clienteStats.clienteMasCompras.totalGanancias.toFixed(2)}
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
                S/{clienteStats.clienteMayorGanancia.totalGanancias.toFixed(2)} en ganancias
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
          {ventasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay ventas en el período seleccionado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Precio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ventasFiltradas.map((venta) => (
                  <TableRow key={venta.id}>
                    <TableCell>
                      <div>
                        <div>{new Date(venta.fecha).toLocaleDateString('es-ES')}</div>
                        <div className="text-xs text-muted-foreground">{venta.hora}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{venta.clienteNombre}</TableCell>
                    <TableCell>{venta.productoNombre}</TableCell>
                    <TableCell>{venta.cantidad}</TableCell>
                    <TableCell className="font-bold text-green-600">
                      S/{venta.precio.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportesSection;
