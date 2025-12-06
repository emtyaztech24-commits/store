export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  customerName: string;
  status: 'completed' | 'pending' | 'cancelled' | 'shipped';
}

export interface SalesStat {
  name: string;
  sales: number;
}

export type View = 'store' | 'admin' | 'cart';
export type AdminView = 'dashboard' | 'inventory' | 'orders';