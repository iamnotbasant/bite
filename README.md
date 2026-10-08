# Fuel - Minimalist Calorie & Macro Tracker

A sleek, clutter-free, pure OLED black (`#000000`) nutrition and macronutrient tracker built with React 19, TypeScript, Tailwind CSS, and Supabase.

---

## ⚡ Features

- **Pure OLED Stealth Black (`#000000`)**: Zero washed-out dark grays or muddy navy tints. Optimized for laptops, high-gamut monitors, and mobile OLED displays.
- **Dynamic Arc Gauge**: Interactive spotlight gauge switching between Calories, Protein, Carbs, and Fat. No bulky outer wrapper cards.
- **Modern Dish Cards**:
  - Asymmetric glass opacity gradient touch.
  - Complete macronutrient breakdown (**Carbs, Protein, Fat**) alongside calories.
  - Minimalist, cohesive icon set.
- **Food Catalog & Logging (`/food`)**:
  - Spacious single-column vertical list layout.
  - Custom food creation with dual-unit portion calculators (e.g., roti, katori, scoop with gram/ml equivalents).
  - **Full Custom Food Editing**: Seamlessly edit existing custom foods with pre-filled nutrition values.
- **Nutrition Facts List (`/create-food`)**:
  - 17 nutrient facts laid out in a clean, vertical list.
- **Comprehensive Daily Targets (`/goals`)**:
  - Macro ratio balancer with live calorie calculations.
  - **Micronutrient Target Inputs**: Set daily thresholds for Fiber, Sugar, Sodium, Potassium, Saturated Fat, Cholesterol, Calcium, and Iron.
- **Cloud & Offline Sync**:
  - Works out of the box with `localStorage`.
  - Seamless background cloud synchronization with Supabase.

---

## 🚀 1. GitHub Setup & Upload

To push this codebase to your GitHub repository:

1. Create a new repository on [GitHub](https://github.com/new) (e.g. `fuel`).
2. Run the following commands in PowerShell from the project root:

```powershell
# Check current git status
git status

# Add your GitHub repository remote (replace <username> with your GitHub username)
git remote add origin https://github.com/<your-username>/fuel.git

# Rename branch to main (if not already main)
git branch -M main

# Push code to GitHub
git push -u origin main
```

---

## 🌐 2. Vercel Deployment

This project includes `vercel.json` configured with SPA routing rewrites:

### Method A: Via GitHub (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Click **Import** next to your GitHub `fuel` repository.
3. Framework Preset: **Vite** (auto-detected).
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. (Optional) Add your Supabase environment variables in the **Environment Variables** section:
   - `VITE_SUPABASE_URL`: `https://<your-project-ref>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `<your-supabase-anon-key>`
7. Click **Deploy**. Your app will be live with a free `.vercel.app` URL!

### Method B: Via Vercel CLI
```powershell
# Install Vercel CLI globally
npm i -g vercel

# Deploy
vercel
```

---

## 🗄️ 3. Supabase Setup & Integration

To sync your food logs, custom foods, and nutrition goals across devices:

### Step 1: Create Supabase Project
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Go to **Project Settings** -> **API**.
3. Copy **Project URL** and **anon public Key**.

### Step 2: Run Database Schema
1. In your Supabase dashboard, click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `supabase_schema.sql` from this repository, copy its contents, paste into the SQL editor, and click **Run**.
   - This creates `custom_foods`, `food_logs`, `user_goals`, and `daily_telemetry` tables with proper indexes and RLS policies.

### Step 3: Configure Environment Variables
Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Add the same variables in your Vercel project settings under **Environment Variables**.

---

## 💻 Local Development

```powershell
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```
