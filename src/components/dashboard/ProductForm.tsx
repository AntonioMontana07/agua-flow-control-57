
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface ProductFormProps {
  onSubmit: (product: any) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    cantidad: '',
    precio: '',
    minimo: '',
    descripcion: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.cantidad || !formData.precio || !formData.minimo) {
      alert('Por favor, complete todos los campos obligatorios');
      return;
    }

    const product = {
      nombre: formData.nombre,
      cantidad: parseInt(formData.cantidad),
      precio: parseFloat(formData.precio),
      minimo: parseInt(formData.minimo),
      descripcion: formData.descripcion
    };

    onSubmit(product);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Agregar Nuevo Producto</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="cantidad">Cantidad Inicial *</Label>
              <Input
                id="cantidad"
                name="cantidad"
                type="number"
                value={formData.cantidad}
                onChange={handleChange}
                placeholder="Cantidad en stock"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio">Precio Unitario ($) *</Label>
              <Input
                id="precio"
                name="precio"
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
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

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Agregar Producto
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
