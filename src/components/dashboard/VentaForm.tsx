
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { ProductoService } from '@/services/ProductoService';
import { Producto, Cliente } from '@/lib/database';

interface VentaFormProps {
  clientes: Cliente[];
  onSubmit: (venta: any) => void;
  onCancel: () => void;
}

const VentaForm: React.FC<VentaFormProps> = ({ clientes, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
    clienteId: '',
    productoId: '',
    cantidad: '1',
    precioVenta: '',
    descripcion: ''
  });
  
  const [productos, setProductos] = useState<Producto[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const productosData = await ProductoService.obtenerTodos();
      const productosDisponibles = productosData.filter(p => p.cantidad > 0);
      setProductos(productosDisponibles);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (field === 'productoId') {
      const producto = productos.find(p => p.id?.toString() === value);
      setProductoSeleccionado(producto || null);
      
      // Sugerir el precio del producto como precio de venta
      if (producto) {
        setFormData(prev => ({
          ...prev,
          precioVenta: producto.precio.toString()
        }));
      }
    }
  };

  const calcularTotal = () => {
    const cantidad = parseInt(formData.cantidad) || 0;
    const precioVenta = parseFloat(formData.precioVenta) || 0;
    return cantidad * precioVenta;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fecha || !formData.hora || !formData.clienteId || !formData.productoId || !formData.cantidad || !formData.precioVenta) {
      alert('Por favor, complete todos los campos obligatorios');
      return;
    }

    if (!productoSeleccionado) {
      alert('Por favor, seleccione un producto válido');
      return;
    }

    const cantidadVenta = parseInt(formData.cantidad);
    if (cantidadVenta > productoSeleccionado.cantidad) {
      alert(`Solo hay ${productoSeleccionado.cantidad} unidades disponibles de ${productoSeleccionado.nombre}`);
      return;
    }

    const precioVenta = parseFloat(formData.precioVenta);
    if (precioVenta <= 0) {
      alert('El precio de venta debe ser mayor a 0');
      return;
    }

    const venta = {
      clienteId: formData.clienteId,
      productoId: parseInt(formData.productoId),
      productoNombre: productoSeleccionado.nombre,
      cantidad: cantidadVenta,
      precioUnitario: precioVenta,
      precio: calcularTotal(),
      hora: formData.hora,
      fecha: formData.fecha,
      descripcion: formData.descripcion
    };

    onSubmit(venta);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando productos...</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Registrar Nueva Venta</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input
                id="fecha"
                name="fecha"
                type="date"
                value={formData.fecha}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora">Hora *</Label>
              <Input
                id="hora"
                name="hora"
                type="time"
                value={formData.hora}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Cliente */}
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente *</Label>
            <Select onValueChange={(value) => handleSelectChange('clienteId', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {clientes.length === 0 ? (
                  <SelectItem value="no-clientes" disabled>
                    No hay clientes registrados
                  </SelectItem>
                ) : (
                  clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id!.toString()}>
                      {cliente.nombre}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {clientes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Primero debe registrar clientes en la sección de Clientes
              </p>
            )}
          </div>

          {/* Producto */}
          <div className="space-y-2">
            <Label htmlFor="producto">Producto *</Label>
            <Select onValueChange={(value) => handleSelectChange('productoId', value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {productos.map((producto) => (
                  <SelectItem key={producto.id} value={producto.id?.toString() || ''}>
                    {producto.nombre} - Stock: {producto.cantidad}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad *</Label>
            <Input
              id="cantidad"
              name="cantidad"
              type="number"
              min="1"
              max={productoSeleccionado ? productoSeleccionado.cantidad : undefined}
              value={formData.cantidad}
              onChange={handleChange}
              placeholder="Ingrese la cantidad"
              required
            />
            {productoSeleccionado && (
              <p className="text-sm text-muted-foreground">
                Stock disponible: {productoSeleccionado.cantidad}
              </p>
            )}
          </div>

          {/* Precio de Venta */}
          <div className="space-y-2">
            <Label htmlFor="precioVenta">Precio de Venta por Unidad (S/) *</Label>
            <Input
              id="precioVenta"
              name="precioVenta"
              type="number"
              step="0.01"
              min="0"
              value={formData.precioVenta}
              onChange={handleChange}
              placeholder="Ingrese el precio de venta"
              required
            />
            {productoSeleccionado && (
              <p className="text-sm text-muted-foreground">
                Precio sugerido: S/{productoSeleccionado.precio.toFixed(2)}
              </p>
            )}
          </div>

          {/* Total a Pagar */}
          <div className="space-y-2">
            <Label>Total a Pagar</Label>
            <div className="p-3 bg-primary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                S/{calcularTotal().toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.cantidad} x S/{formData.precioVenta || '0.00'}
              </p>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (Opcional)</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Ej: Entrega a domicilio, pago en efectivo..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-primary hover:bg-primary/90"
              disabled={clientes.length === 0}
            >
              Registrar Venta
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default VentaForm;
