-- SCHEMA FOR SNACKEANDO WAREHOUSE & LOGISTICS APP
-- Copy and paste this script into your Supabase SQL Editor to create all the required tables and storage configurations.

-- Disable row-level security or add public policies for easy testing
-- -------------------------------------------------------------
-- 1. PRODUCTS (CATÁLOGO DE PRODUCTOS)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    sku TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    purchase_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    sale_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 16.00, -- e.g. 16.00 for 16% IVA
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 2. PURCHASE ORDERS (ÓRDENES DE COMPRA)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oc_number TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'received'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    sku TEXT REFERENCES public.products(sku) ON DELETE CASCADE,
    quantity_ordered INT NOT NULL,
    quantity_received INT NOT NULL DEFAULT 0,
    purchase_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 3. RECEPTIONS (RECEPCIÓN DE PRODUCTO)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.receptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID REFERENCES public.purchase_orders(id) ON DELETE SET NULL,
    received_by TEXT NOT NULL,
    reception_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reception_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reception_id UUID REFERENCES public.receptions(id) ON DELETE CASCADE,
    sku TEXT REFERENCES public.products(sku),
    quantity_received INT NOT NULL,
    purchase_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    expiration_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 4. INVENTORY LOGS (KARDEX/CONTROL DE INVENTARIO)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT REFERENCES public.products(sku) ON DELETE CASCADE,
    quantity INT NOT NULL, -- Positivo para entradas, Negativo para salidas
    type TEXT NOT NULL, -- 'reception', 'prekitting_exit', 'return', 'merma', 'stocking_exit'
    reference_id UUID, -- ID genérico del registro relacionado (reception_id, box_id, return_id, etc.)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 5. VENDING MACHINES (MÁQUINAS EXPENDEDORAS)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vending_machines (
    id TEXT PRIMARY KEY, -- e.g. 'VM-101'
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'maintenance', 'inactive'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STOCK ACTUAL EN ESPIRALES DE CADA MÁQUINA
CREATE TABLE IF NOT EXISTS public.vending_machine_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vending_machine_id TEXT REFERENCES public.vending_machines(id) ON DELETE CASCADE,
    sku TEXT REFERENCES public.products(sku) ON DELETE CASCADE,
    coil_number TEXT NOT NULL, -- e.g. '10', '12'
    capacity INT NOT NULL DEFAULT 10,
    current_quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 6. BOXES (TOTES / CAJAS DE PRE-KITTING)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.boxes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    box_code TEXT UNIQUE NOT NULL, -- Contenido del código QR (e.g. TOTE-001)
    vending_machine_id TEXT REFERENCES public.vending_machines(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'picking', -- 'picking', 'verified', 'in_route', 'stocked'
    picked_by TEXT,
    verified_by TEXT,
    loaded_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    loaded_at TIMESTAMPTZ,
    stocked_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.box_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    box_id UUID REFERENCES public.boxes(id) ON DELETE CASCADE,
    sku TEXT REFERENCES public.products(sku) ON DELETE CASCADE,
    quantity INT NOT NULL,
    quantity_verified INT DEFAULT 0,
    quantity_stocked INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 7. ROUTE LOGS & SEGURIDAD (TRAZABILIDAD EN RUTA)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.route_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    box_id UUID REFERENCES public.boxes(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'load', 'arrival', 'stocking_complete'
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    photo_url_1 TEXT, -- Foto de sello 1 (obligatoria)
    photo_url_2 TEXT, -- Foto de sello 2 (obligatoria)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 8. VENDING MACHINE MAINTENANCE (CHECKLIST DE MANTENIMIENTO)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.machine_maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vending_machine_id TEXT REFERENCES public.vending_machines(id) ON DELETE CASCADE,
    operator TEXT NOT NULL,
    check_fifo BOOLEAN NOT NULL DEFAULT FALSE,
    check_clean_readers BOOLEAN NOT NULL DEFAULT FALSE,
    check_clean_display BOOLEAN NOT NULL DEFAULT FALSE,
    photo_spirals_url TEXT,
    photo_display_url TEXT,
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 9. RETURNS (DEVOLUCIONES / RETORNOS DE PRODUCTO NO VENDIDO)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    box_id UUID REFERENCES public.boxes(id) ON DELETE SET NULL,
    vending_machine_id TEXT REFERENCES public.vending_machines(id) ON DELETE SET NULL,
    sku TEXT REFERENCES public.products(sku) ON DELETE CASCADE,
    quantity INT NOT NULL,
    reason TEXT, -- e.g. 'not sold', 'damaged'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 10. ASSETS & LEASING (ACTIVOS Y LEASING)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assets_leasing (
    id TEXT PRIMARY KEY, -- e.g. 'VAN-001', 'SAFE-001', 'VM-101'
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'van', 'safe', 'vending_machine'
    model TEXT NOT NULL,
    serial_number TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'maintenance', 'lease_ended'
    lease_start_date DATE NOT NULL,
    lease_months INT NOT NULL DEFAULT 48,
    monthly_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    location TEXT NOT NULL,
    assigned_client TEXT,
    assignment_date DATE,
    lease_active BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------------------------------------------
-- 11. LEADS (ROLL-OUT TRACKER)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    contact_name TEXT,
    contact_phone TEXT,
    status TEXT NOT NULL DEFAULT 'lead', -- 'lead', 'scorecard', 'contract', 'kyc', 'installed'
    scorecard_score INT DEFAULT 0,
    rent_amount NUMERIC(10, 2) DEFAULT 6500.00,
    contract_signed BOOLEAN DEFAULT FALSE,
    kyc_docs_count INT DEFAULT 0,
    installation_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================
-- CONFIGURACIÓN DE POLÍTICAS DE ACCESO PÚBLICO (RLS)
-- Nota: Habilitado para facilitar pruebas y desarrollo de prototipos.
-- =============================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reception_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vending_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vending_machine_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.box_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets_leasing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on purchase_orders" ON public.purchase_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on purchase_order_items" ON public.purchase_order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on receptions" ON public.receptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on reception_items" ON public.reception_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on inventory_logs" ON public.inventory_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on vending_machines" ON public.vending_machines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on vending_machine_products" ON public.vending_machine_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on boxes" ON public.boxes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on box_items" ON public.box_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on route_logs" ON public.route_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on machine_maintenance_logs" ON public.machine_maintenance_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on returns" ON public.returns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on assets_leasing" ON public.assets_leasing FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);

-- =============================================================
-- INSERCIÓN DE DATOS DE PRUEBA (MOCK DATA)
-- =============================================================
INSERT INTO public.products (sku, name, description, purchase_price, tax_rate) VALUES
('P-001', 'Coca-Cola Original 600ml', 'Refresco de cola embotellado', 12.50, 16.00),
('P-002', 'Papas Sabritas Sal 45g', 'Papas fritas con sal de mesa', 14.20, 8.00),
('P-003', 'Gansito Marinela 50g', 'Pastelito relleno de fresa y crema', 11.80, 8.00),
('P-004', 'Agua Ciel 600ml', 'Agua purificada purificada', 8.00, 0.00),
('P-005', 'Jugo Del Valle Durazno 413ml', 'Néctar de durazno', 13.50, 16.00)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO public.vending_machines (id, name, address, latitude, longitude, status) VALUES
('VM-101', 'Corporativo Nestlé - Piso 3', 'Av. Ejército Nacional 843, CDMX', 19.4398, -99.2031, 'active'),
('VM-102', 'Hub Toluca Innovación', 'Industrial Toluca Lerma, EdoMex', 19.2922, -99.5312, 'active'),
('VM-103', 'Universidad del Valle de México', 'Calzada de Tlalpan 3058, CDMX', 19.3245, -99.1415, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.assets_leasing (id, name, type, model, serial_number, lease_start_date, lease_months, monthly_cost, location) VALUES
('VAN-001', 'Furgoneta Logística 01', 'van', 'Peugeot Manager L2H2', 'PEUGEOT-MGR-2026-X8', '2026-05-15', 48, 14500.00, 'Hub Toluca'),
('VAN-002', 'Furgoneta Logística 02', 'van', 'JAC Sunray Cargo', 'JAC-SUNRAY-9283-K1', '2026-06-01', 48, 12500.00, 'Hub CDMX'),
('SAFE-001', 'Caja Fuerte Tómbola Van 01', 'safe', 'VendingSafe V1', 'VS-TOM-001', '2026-05-15', 48, 850.00, 'A bordo VAN-001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.leads (company_name, contact_name, contact_phone, status, scorecard_score, rent_amount, contract_signed, kyc_docs_count, installation_date) VALUES
('Corporativo Banorte Reforma', 'Ing. Roberto Gómez', '5512345678', 'kyc', 88, 6500.00, TRUE, 4, '2026-08-01'),
('Gimnasio SmartFit Polanco', 'Lic. Clara Montes', '5576543210', 'contract', 79, 6500.00, FALSE, 2, NULL),
('Oficinas WeWork Satélite', 'Arq. Luis Fuentes', '5523456789', 'scorecard', 65, 6500.00, FALSE, 0, NULL)
ON CONFLICT DO NOTHING;
