
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Gasto } from '@/lib/database';

interface GastoFormProps {
  onSubmit: (gasto: any) => void;
  onCancel: () => void;
  initialData?: Gasto | null;
  isEditing?: boolean;
}

const GastoForm: React.FC<GastoFormProps> = ({ onSubmit, onCancel, initialData, isEditing = false }) => {
  const [formData, setFormData] = useState({
    titulo: initialData?.titulo || '',
    cantidad: initialData?.cantidad?.toString() || '',
    descripcion: initialData?.descripcion || ''
  });
  const [fecha, setFecha] = useState<Date>(
    initialData?.fecha ? new Date(initialData.fecha) : new Date()
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || !formData.cantidad || !fecha) {
      alert('Por favor, complete todos los campos obligatorios');
      return;
    }

    const gasto = {
      titulo: formData.titulo,
      cantidad: parseFloat(formData.cantidad),
      descripcion: formData.descripcion,
      fecha: fecha.toISOString().split('T')[0]
    };

    onSubmit(gasto);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {isEditing ? 'Editar Gasto' : 'Agregar Nuevo Gasto'}
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título del Gasto *</Label>
              <Input
                id="titulo"
                name="titulo"
                type="text"
                value={formData.titulo}
                onChange={handleChange}
                placeholder="Ej: Gasolina, Mantenimiento, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad Gastada (S/) *</Label>
              <Input
                id="cantidad"
                name="cantidad"
                type="number"
                step="0.01"
                value={formData.cantidad}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Fecha del Gasto *</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe el gasto realizado..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {isEditing ? 'Actualizar Gasto' : 'Registrar Gasto'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GastoForm;
