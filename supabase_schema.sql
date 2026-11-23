-- ==============================================================================
-- Sagu's Wardrobe - Supabase Database Schema
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clothing Items Table
CREATE TABLE IF NOT EXISTS public.clothing_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category_group TEXT NOT NULL,
    category TEXT NOT NULL,
    main_color JSONB NOT NULL,
    secondary_color JSONB,
    image_ids TEXT[] DEFAULT '{}',
    brand TEXT,
    size TEXT,
    fabric TEXT,
    pattern TEXT,
    fit TEXT,
    style TEXT,
    purchase_date TEXT,
    purchase_price NUMERIC,
    season TEXT NOT NULL DEFAULT 'All Season',
    occasions TEXT[] DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'clean',
    description TEXT,
    notes TEXT,
    wear_count INTEGER DEFAULT 0,
    last_worn_date TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Images Table (Base64 / CDN Storage)
CREATE TABLE IF NOT EXISTS public.images (
    id TEXT PRIMARY KEY,
    data_url TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Outfits Table
CREATE TABLE IF NOT EXISTS public.outfits (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    items JSONB NOT NULL DEFAULT '[]',
    occasions TEXT[] DEFAULT '{}',
    season TEXT NOT NULL DEFAULT 'All Season',
    tags TEXT[] DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT FALSE,
    compatibility_score NUMERIC DEFAULT 0,
    wear_count INTEGER DEFAULT 0,
    last_worn_date TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Custom Categories Table
CREATE TABLE IF NOT EXISTS public.custom_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    group_name TEXT NOT NULL,
    is_custom BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Pair Overrides Table
CREATE TABLE IF NOT EXISTS public.pair_overrides (
    id TEXT PRIMARY KEY,
    item_a_id TEXT NOT NULL,
    item_b_id TEXT NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    custom_score NUMERIC,
    note TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Outfit Schedules Table
CREATE TABLE IF NOT EXISTS public.outfit_schedules (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    outfit_id TEXT,
    custom_item_ids TEXT[] DEFAULT '{}',
    occasion TEXT NOT NULL,
    notes TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Wear History Table
CREATE TABLE IF NOT EXISTS public.wear_history (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    outfit_id TEXT,
    outfit_name TEXT,
    clothing_item_ids TEXT[] DEFAULT '{}',
    occasion TEXT NOT NULL,
    weather_note TEXT,
    notes TEXT,
    rating INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pair_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wear_history ENABLE ROW LEVEL SECURITY;

-- Allow public access via anon key for single-user wardrobe sync
CREATE POLICY "Allow public all on clothing_items" ON public.clothing_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on images" ON public.images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on outfits" ON public.outfits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on custom_categories" ON public.custom_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on pair_overrides" ON public.pair_overrides FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on outfit_schedules" ON public.outfit_schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on wear_history" ON public.wear_history FOR ALL USING (true) WITH CHECK (true);

-- Enable Supabase Realtime for instant cross-device updates
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clothing_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.images;
ALTER PUBLICATION supabase_realtime ADD TABLE public.outfits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.outfit_schedules;
