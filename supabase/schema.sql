-- ==========================================================
-- Glory Way Limited — Supabase Database Schema
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/voljkpxdcjotkbdbwyvk/sql/new
-- ==========================================================

-- ==========================================================
-- 1. ORDERS TABLE
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    drink_slug TEXT NOT NULL,
    drink_name TEXT NOT NULL,
    packaging TEXT NOT NULL DEFAULT 'Bottle',
    quantity TEXT NOT NULL DEFAULT '1 crate',
    delivery_address TEXT,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    completed_at TIMESTAMPTZ
);

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS packaging TEXT DEFAULT 'Bottle';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- ==========================================================
-- 2. PRODUCTS TABLE (Add, Edit, Image Upload, In-Stock)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    package_types TEXT[] NOT NULL DEFAULT '{"Bottle"}',
    brewer TEXT NOT NULL DEFAULT 'Glory Way Stock',
    size TEXT NOT NULL DEFAULT 'Standard',
    price TEXT,
    note TEXT,
    image_url TEXT,
    in_stock BOOLEAN NOT NULL DEFAULT true
);

-- ==========================================================
-- 3. ENQUIRIES TABLE (Customer Enquiries & Messages)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT DEFAULT 'Drink Enquiry',
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived'))
);

-- ==========================================================
-- 4. SITE SETTINGS TABLE (Update Website Information)
-- ==========================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial website settings
INSERT INTO public.site_settings (key, value)
VALUES
    ('phone', '0705 165 6621'),
    ('email', 'gloryomosigho@gmail.com'),
    ('address', 'Imasabor Number 19 along olobo , Saple Road, Junction, ossiomo Industrial park junction by kpoba Okha, Edo State, Nigeria'),
    ('operating_hours', 'Open 11 hours a day, 6 days a week, 365 days a year'),
    ('announcement', 'Chilled drinks ready for bulk delivery across Benin City. Order today!')
ON CONFLICT (key) DO NOTHING;

-- ==========================================================
-- 5. UPDATED_AT TRIGGER FUNCTION
-- ==========================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    IF TG_TABLE_NAME = 'orders' THEN
        IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
            NEW.completed_at = now();
        ELSIF NEW.status != 'completed' THEN
            NEW.completed_at = NULL;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- ==========================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Orders policies
DROP POLICY IF EXISTS "Public can submit orders" ON public.orders;
CREATE POLICY "Public can submit orders" ON public.orders
FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow reading orders" ON public.orders;
CREATE POLICY "Allow reading orders" ON public.orders
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow updating orders" ON public.orders;
CREATE POLICY "Allow updating orders" ON public.orders
FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow deleting orders" ON public.orders;
CREATE POLICY "Allow deleting orders" ON public.orders
FOR DELETE TO anon, authenticated USING (true);

-- Products policies
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
CREATE POLICY "Allow public read products" ON public.products
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow manage products" ON public.products;
CREATE POLICY "Allow manage products" ON public.products
FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Enquiries policies
DROP POLICY IF EXISTS "Public can submit enquiries" ON public.enquiries;
CREATE POLICY "Public can submit enquiries" ON public.enquiries
FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow reading enquiries" ON public.enquiries;
CREATE POLICY "Allow reading enquiries" ON public.enquiries
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow updating enquiries" ON public.enquiries;
CREATE POLICY "Allow updating enquiries" ON public.enquiries
FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow deleting enquiries" ON public.enquiries;
CREATE POLICY "Allow deleting enquiries" ON public.enquiries
FOR DELETE TO anon, authenticated USING (true);

-- Site settings policies
DROP POLICY IF EXISTS "Allow public read settings" ON public.site_settings;
CREATE POLICY "Allow public read settings" ON public.site_settings
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow update settings" ON public.site_settings;
CREATE POLICY "Allow update settings" ON public.site_settings
FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==========================================================
-- 7. ENABLE REALTIME UPDATES
-- ==========================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_settings;

-- ==========================================================
-- 8. STORAGE BUCKET FOR PRODUCT PICTURES
-- (Run this to create the product-images storage bucket)
-- ==========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public read product images" ON storage.objects;
CREATE POLICY "Allow public read product images" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow upload product images" ON storage.objects;
CREATE POLICY "Allow upload product images" ON storage.objects
FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Allow update product images" ON storage.objects;
CREATE POLICY "Allow update product images" ON storage.objects
FOR UPDATE TO anon, authenticated
USING (bucket_id = 'product-images');

-- ==========================================================
-- 9. SAMPLE SEED DATA
-- ==========================================================
INSERT INTO public.orders (customer_name, phone, email, drink_slug, drink_name, packaging, quantity, delivery_address, message, status)
VALUES 
    ('Osasere Test', '+234 801 234 5678', 'osasere@example.com', 'star', 'Star Lager (Bottle)', 'Bottle', '5 crates', 'Imasabor Number 19 along olobo , Saple Road, Junction, ossiomo Industrial park junction by kpoba Okha, Edo State, Nigeria', 'Please deliver by 3 PM.', 'pending'),
    ('Efe Johnson', '+234 802 345 6789', 'efe@example.com', 'heineken', 'Heineken (Can)', 'Can', '10 packs', '14 Airport Road, GRA, Benin City', 'Wedding gathering restock. Call driver on arrival.', 'confirmed'),
    ('Blessing Amadasun', '+234 803 456 7890', 'blessing@example.com', 'malta-guinness', 'Malta Guinness (Can)', 'Can', '3 packs', '22 Mission Road, Ring Road, Benin City', 'Delivered and paid in cash. Excellent service.', 'completed')
ON CONFLICT DO NOTHING;
