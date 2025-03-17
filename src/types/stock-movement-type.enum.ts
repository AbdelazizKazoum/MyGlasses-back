/* eslint-disable prettier/prettier */
// stock-movement-type.enum.ts
export enum StockMovementType {
  ADD = 'add',
  REMOVE = 'remove',
  CORRECTION = 'correction',
}

// stock-movement-reason.enum.ts
export enum StockMovementReason {
  SUPPLIER_DELIVERY = 'supplier_delivery',
  INVENTORY_CORRECTION = 'inventory_correction',
  CUSTOMER_RETURN = 'customer_return',
  MANUAL_ADJUSTMENT = 'manual_adjustment',
}
