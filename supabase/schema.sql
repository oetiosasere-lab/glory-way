-- ==========================================================
-- Glory Way Limited — Supabase Database Schema
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/voljkpxdcjotkbdbwyvk/sql/new
-- ==========================================================

-- 1. Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    drink_slug TEXT NOT NULL,
    drink_name TEXT NOT NULL,
    quantity TEXT NOT NULL DEFAULT '1 crate',
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    completed_at TIMESTAMPTZ
);

-- 2. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Allow anyone (visitors / customers) to submit a new order from landing page
DROP POLICY IF EXISTS "Public can submit orders" ON public.orders;
CREATE POLICY "Public can submit orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow reading orders (for admin dashboard)
DROP POLICY IF EXISTS "Allow reading orders" ON public.orders;
CREATE POLICY "Allow reading orders"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow updating orders (for admin dashboard to change status / notes)
DROP POLICY IF EXISTS "Allow updating orders" ON public.orders;
CREATE POLICY "Allow updating orders"
ON public.orders
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow deleting orders (optional, for admin cleanup)
DROP POLICY IF EXISTS "Allow deleting orders" ON public.orders;
CREATE POLICY "Allow deleting orders"
ON public.orders
FOR DELETE
TO anon, authenticated
USING (true);

-- 5. Enable Realtime updates (so the dashboard updates live as orders come in)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 6. Insert sample order (optional test data)
INSERT INTO public.orders (customer_name, phone, email, drink_slug, drink_name, quantity, message, status)
VALUES 
    ('Osasere Test', '+234 801 234 5678', 'osasere@example.com', 'star', 'Star', '5 crates', 'Please deliver to Ikpoba Okha by 3 PM.', 'pending'),
    ('Efe Johnson', '+234 802 345 6789', 'efe@example.com', 'heineken', 'Heineken', '10 crates', 'Wedding restock, confirm delivery address.', 'confirmed'),
    ('Blessing Amadasun', '+234 803 456 7890', 'blessing@example.com', 'malta-guinness', 'Malta Guinness', '3 crates', 'Delivered yesterday, paid cash on delivery.', 'completed');
