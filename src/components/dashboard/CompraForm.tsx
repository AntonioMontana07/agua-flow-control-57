
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Compra, Producto } from '@/lib/database';
import { ProductoService } from '@/services/ProductoService';

interface CompraFormProps {
  onSubmit: (compra: any) => void;
  onCancel: () => void;
  initialData?: Compra | null;
  isEditing?: boolean;
}

const CompraForm: React.FC<CompraFormProps> = ({ onSubmit, onCancel, initialData, isEditing = false }) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [formData, setFormData] = useState({
    productoId: initialData?.productoId?.toString() || '',
    cantidad: initialData?.cantidad?.toString() || '',
    descripcion: initialData?.descripcion || '',
    precio: initialData?.precio?.toString() || ''
  });
  const [fecha, setFecha] = useState<Date>(
    initialData?.fecha ? new Date(initialData.fecha) : new Date()
  );

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const productosData = await ProductoService.obtenerTodos();
      setProductos(productosData);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductoChange = (productoId: string) => {
    const producto = productos.find(p => p.id?.toString() === productoId);
    setFormData(prev => ({
      ...prev,
      productoId,
      precio: producto ? producto.precio.toString() : ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productoId || !formData.cantidad || !fecha || !formData.precio) {
      alert('Por favor, complete todos los campos obligatorios');
      return;
    }

    const producto = productos.find(p => p.id?.toString() === formData.productoId);
    if (!producto) {
      alert('Producto no encontrado');
      return;
    }

    const compra = {
      productoId: parseInt(formData.productoId),
      productoNombre: producto.nombre,
      cantidad: parseInt(formData.cantidad),
      fecha: fecha.toISOString().split('T')[0],
      descripcion: formData.descripcion,
      precio: parseFloat(formData.precio)
    };

    onSubmit(compra);
  };

  const productoSeleccionado = productos.find(p => p.id?.toString() === formData.productoId);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {isEditing ? 'Editar Compra de Recarga' : 'Agregar Nueva Compra de Recarga'}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="producto">Producto *</Label>
              <Select 
                value={formData.productoId} 
                onValueChange={handleProductoChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {productos.map((producto) => (
                    <SelectItem key={producto.id} value={producto.id!.toString()}>
                      {producto.nombre} - Stock: {producto.cantidad}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad *</Label>
              <Input
                id="cantidad"
                name="cantidad"
                type="number"
                value={formData.cantidad}
                onChange={handleChange}
                placeholder="Cantidad a comprar"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Fecha de Compra *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fecha && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fecha ? format(fecha, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fecha}
                    onSelect={(date) => date && setFecha(date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio">Precio por Unidad (S/) *</Label>
              <Input
                id="precio"
                name="precio"
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={handleChange}
                placeholder="Precio unitario"
                min="0"
                required
              />
            </div>
          </div>

          {productoSeleccionado && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Producto seleccionado: {productoSeleccionado.nombre}</p>
              <p className="text-sm text-muted-foreground">Stock actual: {productoSeleccionado.cantidad} unidades</p>
              <p className="text-sm text-muted-foreground">Precio sugerido: S/{productoSeleccionado.precio}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (Opcional)</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Ej: Recarga semanal, compra de emergencia, etc..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {isEditing ? 'Actualizar Compra' : 'Registrar Compra'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CompraForm;
