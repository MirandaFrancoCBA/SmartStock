export interface Product {
    id?: number;
    name: string;
    sku: string;
    category: number;
    category_name?: string;
    supplier: number;
    supplier_name?: string;
    price: number;
    stock: number;
  }