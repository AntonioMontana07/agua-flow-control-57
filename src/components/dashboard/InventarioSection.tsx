import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, AlertTriangle, Package, Edit, Trash2 } from 'lucide-react';
import ProductForm from './ProductForm';
import InventoryAlerts from './InventoryAlerts';
import { ProductoService } from '@/services/ProductoService';
import { Producto } from '@/lib/database';
import { useToast } from '@/hooks/use-toast';

// Interface para productos con estado calculado y id requerido
interface ProductoConEstado extends Omit<Producto, 'id'> {
  id: number;
  estado: string;
}

const InventarioSection: React.FC = () => {
  const [showProductForm, setShowProductForm] = useState(false);
  const [productos, setProductos] = useState<ProductoConEstado[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const productosData = await ProductoService.obtenerTodos();
      const productosConEstado: ProductoConEstado[] = productosData
        .filter(producto => producto.id !== undefined)
        .map(producto => ({
          ...producto,
          id: producto.id!,
          estado: producto.cantidad < producto.minimo ? 'Crítico' : 
                 producto.cantidad < producto.minimo * 2 ? 'Bajo' : 'Disponible'
        }));
      setProductos(productosConEstado);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Disponible': return 'bg-green-100 text-green-800';
      case 'Bajo': return 'bg-yellow-100 text-yellow-800';
      case 'Crítico': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddProduct = async (newProduct: any) => {
    try {
      await ProductoService.crear(newProduct);
      await cargarProductos();
      setShowProductForm(false);
      toast({
        title: "Éxito",
        description: "Producto agregado correctamente"
      });
    } catch (error) {
      console.error('Error al agregar producto:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar el producto",
        variant: "destructive"
      });
    }
  };

  const handleEditProduct = async (updatedProduct: any) => {
    try {
      if (editingProduct?.id) {
        await ProductoService.actualizar({ ...updatedProduct, id: editingProduct.id });
        await cargarProductos();
        setEditingProduct(null);
        toast({
          title: "Éxito",
          description: "Producto actualizado correctamente"
        });
      }
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await ProductoService.eliminar(id);
        await cargarProductos();
        toast({
          title: "Éxito",
          description: "Producto eliminado correctamente"
        });
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el producto",
          variant: "destructive"
        });
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando productos...</div>;
  }

  return (
    <div className="space-y-6">
      <InventoryAlerts productos={productos} />

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-primary">Inventario</h2>
          <p className="text-muted-foreground">Gestiona tu stock de productos</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => setShowProductForm(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
        </Button>
      </div>

      {(showProductForm || editingProduct) && (
        <ProductForm 
          producto={editingProduct}
          onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
          onCancel={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Productos</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar productos..." 
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Producto</th>
                  <th className="text-left p-4">Cantidad</th>
                  <th className="text-left p-4">Precio</th>
                  <th className="text-left p-4">Estado</th>
                  <th className="text-left p-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => (
                  <tr key={producto.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium">{producto.nombre}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{producto.cantidad}</span>
                        {producto.cantidad < producto.minimo && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">S/{producto.precio.toFixed(2)}</td>
                    <td className="p-4">
                      <Badge className={getEstadoColor(producto.estado)}>
                        {producto.estado}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingProduct(producto)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteProduct(producto.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{productos.reduce((sum, p) => sum + p.cantidad, 0)}</div>
            <p className="text-sm text-muted-foreground">unidades en stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Valor del Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              S/{productos.reduce((sum, p) => sum + (p.cantidad * p.precio), 0).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">valor total estimado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Productos Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {productos.filter(p => p.estado === 'Crítico').length}
            </div>
            <p className="text-sm text-muted-foreground">requieren reabastecimiento</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InventarioSection;
