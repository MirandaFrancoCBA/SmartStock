export interface Product {
  id?: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
  min_stock: number;  
  is_low_stock: boolean; 
  category?: any; 
  supplier?: any;
}