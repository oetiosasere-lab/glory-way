-- ==============================================================================
-- GLORY WAY LIMITED - SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/voljkpxdcjotkbdbwyvk/sql)
-- This script ensures:
-- 1. Tables (orders, enquiries, products, site_settings) exist with correct columns.
-- 2. Row Level Security (RLS) is ENABLED on every table.
-- 3. Customers can ONLY submit orders/enquiries and view public products/settings.
-- 4. Customers CANNOT read other customers' orders, change order statuses, or edit products.
-- 5. Only Authenticated Administrators can view/manage orders, update inventory, and change settings.
-- ==============================================================================

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT ('order-' || floor(extract(epoch from now()) * 1000)::text),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    drink_slug TEXT NOT NULL,
    drink_name TEXT NOT NULL,
    packaging TEXT DEFAULT 'Bottle',
    quantity TEXT NOT NULL,
    delivery_address TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    completed_at TIMESTAMPTZ
);

-- Enable RLS on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public customers can create orders" ON public.orders;
DROP POLICY IF EXISTS "Only authenticated admins can view orders" ON public.orders;
DROP POLICY IF EXISTS "Only authenticated admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Only authenticated admins can delete orders" ON public.orders;

-- RLS: Public customers can INSERT orders from the storefront
CREATE POLICY "Public customers can create orders"
    ON public.orders
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- RLS: Only authenticated administrators can SELECT (view) orders
CREATE POLICY "Only authenticated admins can view orders"
    ON public.orders
    FOR SELECT
    TO authenticated
    USING (true);

-- RLS: Only authenticated administrators can UPDATE orders
CREATE POLICY "Only authenticated admins can update orders"
    ON public.orders
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- RLS: Only authenticated administrators can DELETE orders
CREATE POLICY "Only authenticated admins can delete orders"
    ON public.orders
    FOR DELETE
    TO authenticated
    USING (true);


-- 2. ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.enquiries (
    id TEXT PRIMARY KEY DEFAULT ('enq-' || floor(extract(epoch from now()) * 1000)::text),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' NOT NULL CHECK (status IN ('unread', 'read', 'replied', 'archived'))
);

-- Enable RLS on enquiries
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public customers can submit enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Only authenticated admins can view enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Only authenticated admins can update enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Only authenticated admins can delete enquiries" ON public.enquiries;

-- RLS: Public customers can INSERT enquiries
CREATE POLICY "Public customers can submit enquiries"
    ON public.enquiries
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- RLS: Only authenticated administrators can SELECT enquiries
CREATE POLICY "Only authenticated admins can view enquiries"
    ON public.enquiries
    FOR SELECT
    TO authenticated
    USING (true);

-- RLS: Only authenticated administrators can UPDATE enquiries
CREATE POLICY "Only authenticated admins can update enquiries"
    ON public.enquiries
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- RLS: Only authenticated administrators can DELETE enquiries
CREATE POLICY "Only authenticated admins can delete enquiries"
    ON public.enquiries
    FOR DELETE
    TO authenticated
    USING (true);


-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY DEFAULT ('prod-' || floor(extract(epoch from now()) * 1000)::text),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    package_types TEXT[] DEFAULT ARRAY['Bottle', 'Can'],
    brewer TEXT DEFAULT 'Glory Way Stock',
    size TEXT DEFAULT 'Standard',
    price TEXT DEFAULT 'By Crate/Pack',
    note TEXT,
    image_url TEXT,
    in_stock BOOLEAN DEFAULT true NOT NULL
);

-- Enable RLS on products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view products catalog" ON public.products;
DROP POLICY IF EXISTS "Only authenticated admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Only authenticated admins can update products" ON public.products;
DROP POLICY IF EXISTS "Only authenticated admins can delete products" ON public.products;

-- RLS: Anyone (customers and admins) can VIEW products
CREATE POLICY "Anyone can view products catalog"
    ON public.products
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- RLS: Only authenticated administrators can INSERT products
CREATE POLICY "Only authenticated admins can insert products"
    ON public.products
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- RLS: Only authenticated administrators can UPDATE products
CREATE POLICY "Only authenticated admins can update products"
    ON public.products
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- RLS: Only authenticated administrators can DELETE products
CREATE POLICY "Only authenticated admins can delete products"
    ON public.products
    FOR DELETE
    TO authenticated
    USING (true);


-- 4. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can read website settings" ON public.site_settings;
DROP POLICY IF EXISTS "Only authenticated admins can update website settings" ON public.site_settings;

-- RLS: Anyone can view site settings (phone, address, hours)
CREATE POLICY "Anyone can read website settings"
    ON public.site_settings
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- RLS: Only authenticated administrators can UPSERT/UPDATE site settings
CREATE POLICY "Only authenticated admins can update website settings"
    ON public.site_settings
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- 5. STORAGE BUCKET SECURITY FOR PRODUCT IMAGES
-- Ensure the storage bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies if any
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated admins can delete product images" ON storage.objects;

-- RLS: Anyone can view product images
CREATE POLICY "Public can view product images"
    ON storage.objects
    FOR SELECT
    TO anon, authenticated
    USING (bucket_id = 'product-images');

-- RLS: Only authenticated admins can upload/modify product images
CREATE POLICY "Authenticated admins can upload product images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated admins can update product images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated admins can delete product images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'product-images');
