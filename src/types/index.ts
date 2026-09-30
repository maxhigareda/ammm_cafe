export type UserRole = 'admin' | 'colaborador';

export type Category = 
  | 'todos'
  | 'cafe' 
  | 'panaderia' 
  | 'bocados' 
  | 'bebidas_frias' 
  | 'postres' 
  | 'paquetes';

export interface ModifierOption {
  id: string;
  name: string;
  priceDelta: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  multiSelect: boolean;
  options: ModifierOption[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: Exclude<Category, 'todos'>;
  price: number;
  cost: number;
  imageUrl: string;
  inStock: boolean;
  stockQuantity?: number;
  isDirectStock: boolean;
  modifierGroups?: ModifierGroup[];
  recipeNotes?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedModifiers: { [groupName: string]: ModifierOption[] };
  notes?: string;
  itemTotal: number;
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia';

export interface Sale {
  id: string;
  ticketNumber: number;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  costTotal: number;
  profit: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  collaboratorName: string;
  status: 'completada' | 'cancelada';
}

export interface CashMovement {
  id: string;
  type: 'entrada' | 'salida';
  amount: number;
  reason: string;
  timestamp: string;
}

export interface CashShift {
  id: string;
  openedAt: string;
  closedAt?: string;
  initialCash: number;
  cashSales: number;
  cardSales: number;
  transferSales: number;
  cashIn: number;
  cashOut: number;
  movements: CashMovement[];
  expectedCash: number;
  actualCash?: number;
  difference?: number;
  collaborator: string;
  status: 'abierta' | 'cerrada';
  notes?: string;
}

export interface SupplyItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  unitCost: number;
  category: 'cafe_grano' | 'lacteos' | 'jarabes' | 'desechables' | 'panaderia_insumos' | 'otros';
  lastRestocked?: string;
}

export interface SupplyRequest {
  id: string;
  supplyName: string;
  quantityNeeded?: string;
  notes: string;
  urgency: 'alta' | 'media' | 'baja';
  requestedBy: string;
  requestedAt: string;
  status: 'pendiente' | 'comprado' | 'cancelado';
}

export interface Expense {
  id: string;
  description: string;
  category: 'insumos' | 'servicios' | 'renta' | 'sueldos' | 'mantenimiento' | 'otros';
  amount: number;
  type: 'fijo' | 'variable';
  date: string;
  paidVia: PaymentMethod;
  notes?: string;
}

export interface PricingIngredient {
  id: string;
  name: string;
  quantity: string;
  cost: number;
}

export interface PricingRecipe {
  id: string;
  productName: string;
  category: string;
  ingredients: PricingIngredient[];
  packagingCost: number;
  wastePercentage: number;
  currentSellingPrice: number;
  targetMarginPercentage: number;
}
