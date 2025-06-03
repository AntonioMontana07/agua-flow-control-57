
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { Producto } from '@/lib/database';

interface ProductFormProps {
  producto?: Producto | null;
  onSubmit: (product: any) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ producto, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    minimo: '',
    descripcion: ''
  });

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre,
        minimo: producto.minimo.toString(),
        descripcion: producto.descripcion || ''
      });
    }
  }, [producto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.minimo) {
      alert('Por favor, complete todos los campos obligatorios');
      return;
    }

    const product = {
      nombre: formData.nombre,
      cantidad: producto ? producto.cantidad : 0, // Si es edición mantener cantidad, si es nuevo empezar en 0
      precio: producto ? producto.precio : 0, // Si es edición mantener precio, si es nuevo empezar en 0
      minimo: parseInt(formData.minimo),
      descripcion: formData.descripcion
    };

    onSubmit(product);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{producto ? 'Editar Producto' : 'Agregar Nuevo Producto'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Producto *</Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Bidón 20L, Garrafón 19L"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minimo">Stock Mínimo *</Label>
              <Input
                id="minimo"
                name="minimo"
                type="number"
                value={formData.minimo}
                onChange={handleChange}
                placeholder="Cantidad mínima para alerta"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción (Opcional)</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Descripción adicional del producto..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {producto ? 'Actualizar Producto' : 'Agregar Producto'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
