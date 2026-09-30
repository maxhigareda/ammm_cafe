-- AMM CAFÉ: Esquema de Base de Datos Supabase
-- Tablas para POS, Inventario, Gastos, Recetas, Arqueo de Caja y Métricas

-- 1. Tabla de Productos (Catálogo)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER,
  is_direct_stock BOOLEAN DEFAULT false,
  modifier_groups JSONB,
  recipe_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Ventas / Tickets
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  ticket_number SERIAL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  items JSONB NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL,
  discount NUMERIC(10, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL,
  cost_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  profit NUMERIC(10, 2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('efectivo', 'tarjeta', 'transferencia')),
  amount_paid NUMERIC(10, 2) NOT NULL,
  change NUMERIC(10, 2) DEFAULT 0,
  collaborator_name TEXT NOT NULL,
  status TEXT DEFAULT 'completada' CHECK (status IN ('completada', 'cancelada'))
);

-- 3. Tabla de Insumos Base (Inventario de Materias Primas)
CREATE TABLE IF NOT EXISTS supplies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  current_stock NUMERIC(10, 2) NOT NULL,
  min_stock NUMERIC(10, 2) NOT NULL,
  unit_cost NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  last_restocked TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de Solicitudes de Compra (Colaboradores a Admin)
CREATE TABLE IF NOT EXISTS supply_requests (
  id TEXT PRIMARY KEY,
  supply_name TEXT NOT NULL,
  quantity_needed TEXT,
  notes TEXT,
  urgency TEXT NOT NULL CHECK (urgency IN ('alta', 'media', 'baja')),
  requested_by TEXT NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'comprado', 'cancelado'))
);

-- 5. Tabla de Gastos del Negocio
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('insumos', 'servicios', 'renta', 'sueldos', 'mantenimiento', 'otros')),
  amount NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('fijo', 'variable')),
  date DATE NOT NULL,
  paid_via TEXT NOT NULL CHECK (paid_via IN ('efectivo', 'tarjeta', 'transferencia')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabla de Turnos / Arqueo de Caja (Corte Z)
CREATE TABLE IF NOT EXISTS cash_shifts (
  id TEXT PRIMARY KEY,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  initial_cash NUMERIC(10, 2) NOT NULL,
  cash_sales NUMERIC(10, 2) DEFAULT 0,
  card_sales NUMERIC(10, 2) DEFAULT 0,
  transfer_sales NUMERIC(10, 2) DEFAULT 0,
  cash_in NUMERIC(10, 2) DEFAULT 0,
  cash_out NUMERIC(10, 2) DEFAULT 0,
  movements JSONB DEFAULT '[]'::jsonb,
  expected_cash NUMERIC(10, 2) NOT NULL,
  actual_cash NUMERIC(10, 2),
  difference NUMERIC(10, 2),
  collaborator TEXT NOT NULL,
  status TEXT DEFAULT 'abierta' CHECK (status IN ('abierta', 'cerrada')),
  notes TEXT
);

-- 7. Tabla de Recetas de Costeo Inteligente
CREATE TABLE IF NOT EXISTS pricing_recipes (
  id TEXT PRIMARY KEY,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  ingredients JSONB NOT NULL,
  packaging_cost NUMERIC(10, 2) DEFAULT 0,
  waste_percentage NUMERIC(5, 2) DEFAULT 5,
  current_selling_price NUMERIC(10, 2) NOT NULL,
  target_margin_percentage NUMERIC(5, 2) DEFAULT 70,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
