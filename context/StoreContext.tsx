import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order } from '../types';

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateCartQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (customerName: string) => Order;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  stats: { totalSales: number; totalOrders: number; lowStockCount: number };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'سماعات بلوتوث برو', price: 299, description: 'صوت عالي الجودة مع عزل ضوضاء ممتاز.', category: 'إلكترونيات', imageUrl: 'https://picsum.photos/200/200?random=1', stock: 15 },
  { id: '2', name: 'ساعة ذكية رياضية', price: 450, description: 'تتبع لياقتك البدنية ونبضات القلب بدقة.', category: 'إكسسوارات', imageUrl: 'https://picsum.photos/200/200?random=2', stock: 8 },
  { id: '3', name: 'حقيبة ظهر عصرية', price: 120, description: 'تصميم مريح ومساحة واسعة للابتوب.', category: 'موضة', imageUrl: 'https://picsum.photos/200/200?random=3', stock: 25 },
  { id: '4', name: 'كاميرا احترافية', price: 2500, description: 'دقة عالية وتصوير فيديو 4K.', category: 'إلكترونيات', imageUrl: 'https://picsum.photos/200/200?random=4', stock: 3 },
  { id: '5', name: 'طقم قهوة مختصة', price: 180, description: 'أدوات تحضير القهوة الفاخرة في المنزل.', category: 'منزل', imageUrl: 'https://picsum.photos/200/200?random=5', stock: 12 },
];

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const addProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Cannot add more than stock
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    const product = products.find(p => p.id === id);
    if (!product || quantity > product.stock) return;
    
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  const createOrder = (customerName: string): Order => {
    const newOrder: Order = {
      id: Date.now().toString(),
      items: [...cart],
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      date: new Date().toISOString(),
      customerName,
      status: 'pending' // Default to pending for realistic flow
    };

    // Decrement stock
    setProducts(prevProducts => prevProducts.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    }));

    setOrders([newOrder, ...orders]);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    setOrders(prev => prev.map(order => order.id === id ? { ...order, status } : order));
  };

  const stats = {
    totalSales: orders.reduce((sum, order) => order.status !== 'cancelled' ? sum + order.total : sum, 0),
    totalOrders: orders.length,
    lowStockCount: products.filter(p => p.stock < 5).length
  };

  return (
    <StoreContext.Provider value={{
      products, cart, orders, addProduct, updateProduct, deleteProduct,
      addToCart, removeFromCart, updateCartQuantity, clearCart, createOrder, updateOrderStatus, stats
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};