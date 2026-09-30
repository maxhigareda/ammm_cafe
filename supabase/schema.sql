-- ==============================================================================
-- AMM CAFÉ: ESQUEMA COMPLETO Y DATOS INICIALES PARA SUPABASE
-- Copia y pega todo este script en el "SQL Editor" de tu panel de Supabase
-- (Project: hhjkfkwixzluottbkqit -> SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. Tabla de Productos (Catálogo del Menú)
CREATE TABLE IF NOT EXISTS public.products (
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
  modifier_groups JSONB DEFAULT '[]'::jsonb,
  recipe_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Ventas / Tickets de Cobro
CREATE TABLE IF NOT EXISTS public.sales (
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
CREATE TABLE IF NOT EXISTS public.supplies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  current_stock NUMERIC(10, 2) NOT NULL,
  min_stock NUMERIC(10, 2) NOT NULL,
  unit_cost NUMERIC(10, 2) NOT NULL,
  category TEXT NOT NULL,
  last_restocked TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de Solicitudes de Compra (Reporte de Faltantes)
CREATE TABLE IF NOT EXISTS public.supply_requests (
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
CREATE TABLE IF NOT EXISTS public.expenses (
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

-- 6. Tabla de Turnos y Arqueo de Caja (Corte Z)
CREATE TABLE IF NOT EXISTS public.cash_shifts (
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

-- 7. Tabla de Recetas para Costeo Inteligente
CREATE TABLE IF NOT EXISTS public.pricing_recipes (
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

-- ==============================================================================
-- HABILITACIÓN DE SEGURIDAD (ROW LEVEL SECURITY) Y POLÍTICAS DE ACCESO
-- Permiten lectura y escritura desde la aplicación web de Amm Café
-- ==============================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir todo a anon y auth en products" ON public.products;
CREATE POLICY "Permitir todo a anon y auth en products" ON public.products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a anon y auth en sales" ON public.sales;
CREATE POLICY "Permitir todo a anon y auth en sales" ON public.sales FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a anon y auth en supplies" ON public.supplies;
CREATE POLICY "Permitir todo a anon y auth en supplies" ON public.supplies FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a anon y auth en supply_requests" ON public.supply_requests;
CREATE POLICY "Permitir todo a anon y auth en supply_requests" ON public.supply_requests FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a anon y auth en expenses" ON public.expenses;
CREATE POLICY "Permitir todo a anon y auth en expenses" ON public.expenses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a anon y auth en cash_shifts" ON public.cash_shifts;
CREATE POLICY "Permitir todo a anon y auth en cash_shifts" ON public.cash_shifts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir todo a anon y auth en pricing_recipes" ON public.pricing_recipes;
CREATE POLICY "Permitir todo a anon y auth en pricing_recipes" ON public.pricing_recipes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- DATOS INICIALES (SEED DATA DE AMM CAFÉ)
-- ==============================================================================

INSERT INTO public.products (id, name, description, category, price, cost, image_url, in_stock, stock_quantity, is_direct_stock, modifier_groups)
VALUES
(
  'prod-1',
  'Latte Amm Lavanda & Vainilla',
  'Espresso de especialidad, leche vaporizada, notas florales de lavanda y extracto natural de vainilla.',
  'cafe',
  68,
  16.5,
  'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
  true,
  null,
  false,
  '[
    {"id":"mod-size","name":"Tamaño","required":true,"multiSelect":false,"options":[{"id":"size-12","name":"Mediano (12 oz)","priceDelta":0},{"id":"size-16","name":"Grande (16 oz)","priceDelta":12}]},
    {"id":"mod-milk","name":"Tipo de Leche","required":true,"multiSelect":false,"options":[{"id":"milk-entera","name":"Entera","priceDelta":0},{"id":"milk-deslac","name":"Deslactosada Light","priceDelta":0},{"id":"milk-avena","name":"Avena Barista","priceDelta":14},{"id":"milk-almendra","name":"Almendra sin azúcar","priceDelta":14}]},
    {"id":"mod-temp","name":"Temperatura","required":true,"multiSelect":false,"options":[{"id":"temp-hot","name":"Caliente","priceDelta":0},{"id":"temp-ice","name":"Con Hielo (Iced)","priceDelta":5}]}
  ]'::jsonb
),
(
  'prod-2',
  'Flat White Sedoso',
  'Doble ristretto con microespuma de leche aterciopelada en taza de cerámica de 6 oz.',
  'cafe',
  55,
  12.0,
  'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?auto=format&fit=crop&w=600&q=80',
  true,
  null,
  false,
  '[{"id":"mod-milk-fw","name":"Tipo de Leche","required":true,"multiSelect":false,"options":[{"id":"milk-entera","name":"Entera","priceDelta":0},{"id":"milk-deslac","name":"Deslactosada","priceDelta":0},{"id":"milk-avena","name":"Avena Barista","priceDelta":14}]}]'::jsonb
),
(
  'prod-3',
  'Espresso Doble Origen',
  'Extracción 1:2 con granos de Chiapas / Oaxaca con notas a chocolate amargo y cítricos dulces.',
  'cafe',
  42,
  7.5,
  'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80',
  true,
  null,
  false,
  '[]'::jsonb
),
(
  'prod-4',
  'Matcha Latte Ceremonial',
  'Matcha grado ceremonial de Uji con leche vaporizada y un toque sutil de miel de agave.',
  'cafe',
  72,
  19.0,
  'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
  true,
  null,
  false,
  '[{"id":"mod-temp-m","name":"Temperatura","required":true,"multiSelect":false,"options":[{"id":"temp-hot","name":"Caliente","priceDelta":0},{"id":"temp-ice","name":"Iced con Hielo","priceDelta":5}]}]'::jsonb
),
(
  'prod-5',
  'Cold Brew Tonic & Cítricos',
  'Maceración en frío por 18 hrs, servido sobre hielo con agua tónica premium y rodaja de naranja.',
  'bebidas_frias',
  65,
  14.2,
  'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
  true,
  null,
  false,
  '[]'::jsonb
),
(
  'prod-6',
  'Croissant Mantequilla Almendrado',
  'Hojaldre artesanal con mantequilla francesa, crema frangipane y almendras tostadas.',
  'panaderia',
  52,
  18.0,
  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
  true,
  12,
  true,
  '[]'::jsonb
),
(
  'prod-7',
  'Rol de Canela & Cardamomo Glaseado',
  'Masa brioche horneada con infusión de cardamomo, canela de Ceilán y glaseado de queso crema.',
  'panaderia',
  48,
  14.5,
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  true,
  4,
  true,
  '[]'::jsonb
),
(
  'prod-8',
  'Pain au Chocolat Belga',
  'Barras de chocolate amargo 60% cacao envueltas en capas crujientes de hojaldre.',
  'panaderia',
  49,
  15.0,
  'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=600&q=80',
  true,
  8,
  true,
  '[]'::jsonb
),
(
  'prod-9',
  'Focaccia Serrano, Pesto & Burrata',
  'Focaccia de romero con jamón serrano, pesto genovés de albahaca y burrata fresca.',
  'bocados',
  110,
  42.0,
  'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
  true,
  6,
  true,
  '[]'::jsonb
),
(
  'prod-10',
  'Avocado Toast & Huevo Poché',
  'Masa madre rústica, puré cremoso de aguacate hass, huevo pochado y brotes orgánicos.',
  'bocados',
  95,
  31.0,
  'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
  true,
  10,
  true,
  '[]'::jsonb
),
(
  'prod-11',
  'Tarta Tartín de Manzana Caramelizada',
  'Manzanas caramelizadas al horno con fondo hojaldrado crocante y toque de sal marina.',
  'postres',
  65,
  21.0,
  'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=600&q=80',
  true,
  2,
  true,
  '[]'::jsonb
),
(
  'prod-12',
  'Combo Amm Mañanero',
  'Café Latte o Americano Mediano + Croissant de Mantequilla o Rol de Canela.',
  'paquetes',
  98,
  28.0,
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
  true,
  null,
  false,
  '[]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  cost = EXCLUDED.cost;

-- Insumos iniciales
INSERT INTO public.supplies (id, name, unit, current_stock, min_stock, unit_cost, category)
VALUES
('sup-1', 'Café en Grano Especialidad (Mezcla Amm Chiapas/Oaxaca)', 'kg', 3.2, 5.0, 320, 'cafe_grano'),
('sup-2', 'Leche Entera de Origen Local', 'L', 14, 12, 26, 'lacteos'),
('sup-3', 'Leche de Avena Edición Barista', 'L', 3, 6, 58, 'lacteos'),
('sup-4', 'Leche de Almendra sin Azúcar', 'L', 5, 4, 52, 'lacteos'),
('sup-5', 'Jarabe Artesanal de Lavanda & Vainilla', 'L', 1.8, 1.0, 180, 'jarabes'),
('sup-6', 'Matcha Uji Ceremonial (Bote 500g)', 'kg', 0.45, 0.3, 1250, 'jarabes'),
('sup-7', 'Vasos Compostables 12 oz + Tapa blanca', 'piezas', 80, 150, 3.2, 'desechables'),
('sup-8', 'Vasos Compostables 16 oz + Tapa', 'piezas', 190, 100, 3.8, 'desechables'),
('sup-9', 'Servilletas de papel kraft reciclado', 'paquetes', 6, 4, 45, 'desechables')
ON CONFLICT (id) DO NOTHING;

-- Solicitudes de compra iniciales
INSERT INTO public.supply_requests (id, supply_name, quantity_needed, notes, urgency, requested_by, status)
VALUES
('req-1', 'Leche de Avena Barista', '1 caja (12 L)', 'Quedan solo 3 botes en refrigerador y es la más solicitada.', 'alta', 'Sofía M. (Barista)', 'pendiente'),
('req-2', 'Vasos 12 oz para llevar', '2 mangas (100 pzas)', 'Menos de 80 vasos disponibles en barra.', 'alta', 'Carlos R. (Cajero)', 'pendiente')
ON CONFLICT (id) DO NOTHING;

-- Gastos iniciales
INSERT INTO public.expenses (id, description, category, amount, type, date, paid_via)
VALUES
('exp-1', 'Compra semanal de insumos panadería y lácteos', 'insumos', 1450, 'variable', '2026-09-29', 'transferencia'),
('exp-2', 'Luz y electricidad local (CFE)', 'servicios', 2850, 'fijo', '2026-09-25', 'transferencia'),
('exp-3', 'Internet de fibra óptica simétrica', 'servicios', 699, 'fijo', '2026-09-20', 'tarjeta'),
('exp-4', 'Mantenimiento preventivo máquina La Marzocco', 'mantenimiento', 1200, 'variable', '2026-09-18', 'transferencia')
ON CONFLICT (id) DO NOTHING;

-- Recetas de costeo iniciales
INSERT INTO public.pricing_recipes (id, product_name, category, ingredients, packaging_cost, waste_percentage, current_selling_price, target_margin_percentage)
VALUES
(
  'rec-1',
  'Latte Amm Lavanda (12 oz)',
  'cafe',
  '[
    {"id":"ing-1","name":"Café en grano (18g)","quantity":"18g","cost":5.76},
    {"id":"ing-2","name":"Leche entera fresca (220ml)","quantity":"220ml","cost":5.72},
    {"id":"ing-3","name":"Jarabe Lavanda-Vainilla (25ml)","quantity":"25ml","cost":4.50}
  ]'::jsonb,
  3.50,
  5,
  68,
  70
),
(
  'rec-2',
  'Focaccia Serrano & Burrata',
  'bocados',
  '[
    {"id":"ing-21","name":"Focaccia artesanal masa madre","quantity":"1 pieza","cost":12.00},
    {"id":"ing-22","name":"Jamón serrano reserva (60g)","quantity":"60g","cost":18.00},
    {"id":"ing-23","name":"Burrata fresca (80g)","quantity":"80g","cost":16.00},
    {"id":"ing-24","name":"Pesto casero de albahaca (20g)","quantity":"20g","cost":5.50}
  ]'::jsonb,
  4.00,
  4,
  110,
  65
)
ON CONFLICT (id) DO NOTHING;
