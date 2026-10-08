-- ==============================================================================
-- Fuel App - Supabase Database Schema
-- Run this in your Supabase Project: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Custom Foods Table
CREATE TABLE IF NOT EXISTS public.custom_foods (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT,
    description TEXT,
    calories NUMERIC NOT NULL DEFAULT 0,
    protein NUMERIC NOT NULL DEFAULT 0,
    carbs NUMERIC NOT NULL DEFAULT 0,
    fat NUMERIC NOT NULL DEFAULT 0,
    fiber NUMERIC DEFAULT 0,
    saturated_fat NUMERIC DEFAULT 0,
    trans_fat NUMERIC DEFAULT 0,
    polyunsaturated_fat NUMERIC DEFAULT 0,
    monounsaturated_fat NUMERIC DEFAULT 0,
    cholesterol NUMERIC DEFAULT 0,
    sodium NUMERIC DEFAULT 0,
    sugar NUMERIC DEFAULT 0,
    calcium NUMERIC DEFAULT 0,
    iron NUMERIC DEFAULT 0,
    potassium NUMERIC DEFAULT 0,
    vitamin_a NUMERIC DEFAULT 0,
    vitamin_c NUMERIC DEFAULT 0,
    serving_size_qty NUMERIC DEFAULT 1,
    serving_size_unit TEXT DEFAULT 'serving',
    serving_weight_grams NUMERIC DEFAULT 100,
    serving_equivalent_unit TEXT DEFAULT 'g',
    servings_per_container NUMERIC DEFAULT 1,
    default_portion TEXT DEFAULT '1 serving',
    category TEXT DEFAULT 'lunch',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Daily Food Logs Table
CREATE TABLE IF NOT EXISTS public.food_logs (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    name TEXT NOT NULL,
    brand TEXT,
    calories NUMERIC NOT NULL DEFAULT 0,
    protein NUMERIC NOT NULL DEFAULT 0,
    carbs NUMERIC NOT NULL DEFAULT 0,
    fat NUMERIC NOT NULL DEFAULT 0,
    fiber NUMERIC DEFAULT 0,
    saturated_fat NUMERIC DEFAULT 0,
    trans_fat NUMERIC DEFAULT 0,
    sodium NUMERIC DEFAULT 0,
    sugar NUMERIC DEFAULT 0,
    portion TEXT NOT NULL DEFAULT '1 serving',
    category TEXT NOT NULL DEFAULT 'lunch',
    timestamp TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. User Nutrition Goals Table
CREATE TABLE IF NOT EXISTS public.user_goals (
    id TEXT PRIMARY KEY DEFAULT 'default_user',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    calorie_goal INTEGER NOT NULL DEFAULT 2000,
    protein_goal INTEGER NOT NULL DEFAULT 130,
    carbs_goal INTEGER NOT NULL DEFAULT 180,
    fat_goal INTEGER NOT NULL DEFAULT 50,
    water_goal INTEGER NOT NULL DEFAULT 2500,
    fiber_goal INTEGER DEFAULT 30,
    sugar_goal INTEGER DEFAULT 50,
    sodium_goal INTEGER DEFAULT 2300,
    potassium_goal INTEGER DEFAULT 3500,
    saturated_fat_goal INTEGER DEFAULT 20,
    cholesterol_goal INTEGER DEFAULT 300,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Daily Telemetry Logs (Water, Burned, Glucose)
CREATE TABLE IF NOT EXISTS public.daily_telemetry (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    water_intake INTEGER DEFAULT 0,
    burned_calories INTEGER DEFAULT 0,
    sugar_level NUMERIC DEFAULT 95,
    glucose_average NUMERIC DEFAULT 98,
    time_in_range INTEGER DEFAULT 96,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_telemetry ENABLE ROW LEVEL SECURITY;

-- 7. Public Access Policies (Allow Anon & Authenticated Access for Single-User/Demo Mode)
-- Custom Foods policies
CREATE POLICY "Allow public read access on custom_foods"
    ON public.custom_foods FOR SELECT USING (true);
CREATE POLICY "Allow public insert on custom_foods"
    ON public.custom_foods FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on custom_foods"
    ON public.custom_foods FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on custom_foods"
    ON public.custom_foods FOR DELETE USING (true);

-- Food Logs policies
CREATE POLICY "Allow public read access on food_logs"
    ON public.food_logs FOR SELECT USING (true);
CREATE POLICY "Allow public insert on food_logs"
    ON public.food_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on food_logs"
    ON public.food_logs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on food_logs"
    ON public.food_logs FOR DELETE USING (true);

-- User Goals policies
CREATE POLICY "Allow public read access on user_goals"
    ON public.user_goals FOR SELECT USING (true);
CREATE POLICY "Allow public insert on user_goals"
    ON public.user_goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on user_goals"
    ON public.user_goals FOR UPDATE USING (true);

-- Daily Telemetry policies
CREATE POLICY "Allow public read access on daily_telemetry"
    ON public.daily_telemetry FOR SELECT USING (true);
CREATE POLICY "Allow public insert on daily_telemetry"
    ON public.daily_telemetry FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on daily_telemetry"
    ON public.daily_telemetry FOR UPDATE USING (true);
