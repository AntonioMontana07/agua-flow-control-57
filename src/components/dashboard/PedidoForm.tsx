import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { Plus, Share } from 'lucide-react';
import { PedidoService, Pedido } from '@/services/PedidoService';
import { ClienteService } from '@/services/ClienteService';
import { ProductoService } from '@/services/ProductoService';
import { Cliente, Producto } from '@/lib/database';

interface PedidoFormProps {
  onPedidoCreated?: () => void;
}

const PedidoForm: React.FC<PedidoFormProps> = ({ onPedidoCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [formData, setFormData] = useState({
    clienteId: '',
    productoId: '',
    cantidad: '',
    precio: ''
  });
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [clientesData, productosData] = await Promise.all([
        ClienteService.obtenerTodos(),
        ProductoService.obtenerTodos()
      ]);
      setClientes(clientesData);
      setProductos(productosData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  const handleClienteChange = (clienteId: string) => {
    const cliente = clientes.find(c => c.id?.toString() === clienteId);
    setSelectedCliente(cliente || null);
    setFormData(prev => ({ ...prev, clienteId }));
  };

  const handleProductoChange = (productoId: string) => {
    const producto = productos.find(p => p.id?.toString() === productoId);
    setSelectedProducto(producto || null);
    setFormData(prev => ({ 
      ...prev, 
      productoId,
      precio: producto?.precio.toString() || ''
    }));
  };

  const compartirPorWhatsApp = (pedido: Pedido) => {
    const mensaje = `🛒 *NUEVO PEDIDO*

👤 *Cliente:* ${pedido.clienteNombre}
📍 *Dirección:* ${pedido.clienteDireccion}

📦 *Producto:* ${pedido.productoNombre}
📊 *Cantidad:* ${pedido.cantidad}
💰 *Precio unitario:* S/${pedido.precio.toFixed(2)}
💵 *Total:* S/${pedido.total.toFixed(2)}

📅 *Fecha:* ${new Date(pedido.fecha).toLocaleDateString('es-ES')}
🕐 *Hora:* ${pedido.hora}

_Pedido generado por BIOX Sistema de Reparto_`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCliente || !selectedProducto) {
      toast({
        title: "Error",
        description: "Selecciona un cliente y un producto",
        variant: "destructive"
      });
      return;
    }

    try {
      const now = new Date();
      const pedidoData = {
        clienteId: selectedCliente.id!,
        clienteNombre: selectedCliente.nombre,
        clienteDireccion: selectedCliente.direccion,
        productoId: selectedProducto.id!,
        productoNombre: selectedProducto.nombre,
        cantidad: parseInt(formData.cantidad),
        precio: parseFloat(formData.precio),
        fecha: now.toISOString().split('T')[0],
        hora: now.toTimeString().slice(0, 5)
      };

      const pedidoId = await PedidoService.crear(pedidoData);
      const pedidoCreado = await PedidoService.obtenerPorId(pedidoId);

      toast({
        title: "¡Pedido creado!",
        description: "El pedido se ha registrado correctamente"
      });

      // Preguntar si quiere compartir por WhatsApp
      if (pedidoCreado && window.confirm('¿Deseas compartir este pedido por WhatsApp?')) {
        compartirPorWhatsApp(pedidoCreado);
      }

      setFormData({
        clienteId: '',
        productoId: '',
        cantidad: '',
        precio: ''
      });
      setSelectedCliente(null);
      setSelectedProducto(null);
      setIsOpen(false);
      onPedidoCreated?.();
    } catch (error) {
      console.error('Error al crear pedido:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el pedido",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar Pedido
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo Pedido</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Select value={formData.clienteId} onValueChange={handleClienteChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id!.toString()}>
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCliente && (
                <p className="text-sm text-muted-foreground">
                  📍 {selectedCliente.direccion}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="producto">Producto</Label>
              <Select value={formData.productoId} onValueChange={handleProductoChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {productos.map((producto) => (
                    <SelectItem key={producto.id} value={producto.id!.toString()}>
                      {producto.nombre} - S/{producto.precio.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                value={formData.cantidad}
                onChange={(e) => setFormData(prev => ({ ...prev, cantidad: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio">Precio Unitario</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                min="0"
                value={formData.precio}
                onChange={(e) => setFormData(prev => ({ ...prev, precio: e.target.value }))}
                required
              />
            </div>
          </div>

          {formData.cantidad && formData.precio && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-lg font-semibold">
                  Total: S/{(parseFloat(formData.cantidad || '0') * parseFloat(formData.precio || '0')).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Pedido
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PedidoForm;
