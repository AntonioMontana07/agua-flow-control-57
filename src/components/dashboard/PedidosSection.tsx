
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Share, Trash2, Package, Calendar, Clock, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PedidoService, Pedido } from '@/services/PedidoService';
import PedidoForm from './PedidoForm';

const PedidosSection: React.FC = () => {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const data = await PedidoService.obtenerTodos();
      setPedidos(data.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()));
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generarImagenPedido = async (pedido: Pedido) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    canvas.width = 600;
    canvas.height = 800;

    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Configurar texto
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';

    // Título BIOX
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#2563eb';
    ctx.fillText('🌟 BIOX - SISTEMA DE REPARTO 🌟', 300, 50);

    // Subtítulo
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText('🛒 PEDIDO DE ENTREGA', 300, 100);

    // Línea separadora
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 120);
    ctx.lineTo(550, 120);
    ctx.stroke();

    // Información del cliente
    ctx.textAlign = 'left';
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#1f2937';
    ctx.fillText('👤 CLIENTE', 50, 160);
    
    ctx.font = '18px Arial';
    ctx.fillStyle = '#374151';
    ctx.fillText(pedido.clienteNombre, 50, 190);
    ctx.fillText(`📍 ${pedido.clienteDireccion}`, 50, 220);

    // Línea separadora
    ctx.strokeStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.moveTo(50, 240);
    ctx.lineTo(550, 240);
    ctx.stroke();

    // Detalles del pedido
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#1f2937';
    ctx.fillText('📦 DETALLES DEL PEDIDO', 50, 280);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#374151';
    ctx.fillText(`🏷️ Producto: ${pedido.productoNombre}`, 50, 310);
    ctx.fillText(`📊 Cantidad: ${pedido.cantidad} unidades`, 50, 340);
    ctx.fillText(`💰 Precio unitario: S/${pedido.precio.toFixed(2)}`, 50, 370);
    
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#059669';
    ctx.fillText(`💵 TOTAL: S/${pedido.total.toFixed(2)}`, 50, 410);

    // Línea separadora
    ctx.strokeStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.moveTo(50, 430);
    ctx.lineTo(550, 430);
    ctx.stroke();

    // Programación de entrega
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#1f2937';
    ctx.fillText('📅 PROGRAMACIÓN DE ENTREGA', 50, 470);

    ctx.font = '18px Arial';
    ctx.fillStyle = '#374151';
    const fechaEntrega = new Date(pedido.fechaEntrega).toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    ctx.fillText(`🗓️ Fecha: ${fechaEntrega}`, 50, 500);
    ctx.fillText(`🕐 Hora: ${pedido.horaEntrega}`, 50, 530);

    // Línea separadora
    ctx.strokeStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.moveTo(50, 550);
    ctx.lineTo(550, 550);
    ctx.stroke();

    // Información de registro
    ctx.font = '16px Arial';
    ctx.fillStyle = '#6b7280';
    const fechaRegistro = new Date(pedido.fecha).toLocaleDateString('es-ES');
    ctx.fillText(`📋 Pedido registrado el ${fechaRegistro} a las ${pedido.hora}`, 50, 590);

    // Footer
    ctx.textAlign = 'center';
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#2563eb';
    ctx.fillText('✨ BIOX - Gestión eficiente de pedidos ✨', 300, 650);

    // Marco decorativo
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Descargar imagen
    const link = document.createElement('a');
    link.download = `pedido-${pedido.id}-${pedido.clienteNombre.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "Imagen generada",
      description: "La imagen del pedido se ha descargado correctamente"
    });
  };

  const compartirPorWhatsApp = (pedido: Pedido) => {
    const mensaje = `🌟 *BIOX - SISTEMA DE REPARTO* 🌟

🛒 *PEDIDO DE ENTREGA*

━━━━━━━━━━━━━━━━━━━━━━━
👤 *CLIENTE*
${pedido.clienteNombre}
📍 ${pedido.clienteDireccion}

━━━━━━━━━━━━━━━━━━━━━━━
📦 *DETALLES DEL PEDIDO*
🏷️ Producto: ${pedido.productoNombre}
📊 Cantidad: ${pedido.cantidad} unidades
💰 Precio unitario: S/${pedido.precio.toFixed(2)}
💵 *TOTAL: S/${pedido.total.toFixed(2)}*

━━━━━━━━━━━━━━━━━━━━━━━
📅 *PROGRAMACIÓN DE ENTREGA*
🗓️ Fecha: ${new Date(pedido.fechaEntrega).toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}
🕐 Hora: ${pedido.horaEntrega}

━━━━━━━━━━━━━━━━━━━━━━━
📋 Pedido registrado el ${new Date(pedido.fecha).toLocaleDateString('es-ES')} a las ${pedido.hora}

✨ *BIOX - Gestión eficiente de pedidos* ✨`;

    const url = `https://wa.me/?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const eliminarPedido = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      try {
        await PedidoService.eliminar(id);
        toast({
          title: "Pedido eliminado",
          description: "El pedido se ha eliminado correctamente"
        });
        cargarPedidos();
      } catch (error) {
        console.error('Error al eliminar pedido:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el pedido",
          variant: "destructive"
        });
      }
    }
  };

  const totalPedidos = pedidos.reduce((sum, pedido) => sum + pedido.total, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary">Pedidos BIOX</h2>
            <p className="text-muted-foreground">Gestión de pedidos de entrega</p>
          </div>
        </div>
        <div className="text-center">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-primary">Pedidos BIOX</h2>
          <p className="text-muted-foreground">Gestión de pedidos de entrega</p>
        </div>
        <PedidoForm onPedidoCreated={cargarPedidos} />
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pedidos.length}</div>
            <p className="text-xs text-muted-foreground">Pedidos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">S/{totalPedidos.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Valor de todos los pedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Hoy</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {pedidos.filter(p => p.fecha === new Date().toISOString().split('T')[0]).length}
            </div>
            <p className="text-xs text-muted-foreground">Pedidos de hoy</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de pedidos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos de Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          {pedidos.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay pedidos registrados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Entrega</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pedido.clienteNombre}</div>
                        <div className="text-sm text-muted-foreground">{pedido.clienteDireccion}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pedido.productoNombre}</div>
                        <div className="text-sm text-muted-foreground">S/{pedido.precio.toFixed(2)} c/u</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{pedido.cantidad}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-green-600">S/{pedido.total.toFixed(2)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(pedido.fechaEntrega).toLocaleDateString('es-ES')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{pedido.horaEntrega}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => compartirPorWhatsApp(pedido)}
                          title="Compartir por WhatsApp"
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generarImagenPedido(pedido)}
                          title="Descargar como imagen"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => eliminarPedido(pedido.id!)}
                          title="Eliminar pedido"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

export default PedidosSection;
