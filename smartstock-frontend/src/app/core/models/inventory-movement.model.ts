export type MovementType = 'IN' | 'OUT';

export interface InventoryMovement {
  id: number;
  product: number;
  product_name: string;
  movement_type: MovementType;
  quantity: number;
  user: number | null;
  user_username: string | null;
  created_at: string;
  note: string;
}

export interface CreateInventoryMovement {
  product: number;
  movement_type: MovementType;
  quantity: number;
  note?: string;
}
