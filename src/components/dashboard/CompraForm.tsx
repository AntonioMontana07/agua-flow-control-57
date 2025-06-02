
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';

interface CompraFormProps {
  onSubmit: (compra: any) => void;
  onCancel: () => void;
}

const CompraForm: React.FC<CompraFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    cantidad: '',
    fecha: new Date().toISOString().split('T')[0],
    descripcion: '',
    precio: ''
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
    
    if (!formData.cantidad || !formData.fecha || !formData.precio) {
      alert('Por favor, complete todos los campos obligatorios');
      return;
    }

    const compra = {
      cantidad: parseInt(formData.cantidad),
      fecha: formData.fecha,
      descripcion: formData.descripcion,
      precio: parseFloat(formData.precio)
    };

    onSubmit(compra);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Agregar Nueva Compra de Recarga</CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad de Garrafones *</Label>
              <Input
                id="cantidad"
                name="cantidad"
                type="number"
                value={formData.cantidad}
                onChange={handleChange}
                placeholder="Número de garrafones"
                min="1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha de Compra *</Label>
              <Input
                id="fecha"
                name="fecha"
                type="date"
                value={formData.fecha}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="precio">Precio por Unidad ($) *</Label>
              <Input
                id="precio"
                name="precio"
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={handleChange}
                placeholder="15.00"
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
              placeholder="Ej: Recarga semanal, compra de emergencia, etc..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Registrar Compra
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CompraForm;
