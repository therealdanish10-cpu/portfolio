-- ==============================================================================
-- CARTERA PORTFOLIO — SUPABASE DATABASE & STORAGE SCHEMA
-- Run this in your Supabase project's SQL Editor (https://supabase.com/dashboard)
-- Project URL: https://lqulqyvpsgpnechqigfn.supabase.co
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CREATE "projects" TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  tech_tags text, -- Comma-separated tags, e.g. "HTML/CSS/JS, Supabase, Admin Panel"
  live_url text,
  screenshot_url text, -- Public URL of screenshot from storage bucket
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.projects enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Allow public read access on projects" on public.projects;
drop policy if exists "Allow full access for admin on projects" on public.projects;

-- Policy 1: Public Read Access (Allows your portfolio visitors to view projects)
create policy "Allow public read access on projects"
  on public.projects
  for select
  using (true);

-- Policy 2: Full CRUD for Admin (Allows inserting, updating, and deleting projects)
create policy "Allow full access for admin on projects"
  on public.projects
  for all
  using (true)
  with check (true);

-- Create index on display_order for fast carousel ordering
create index if not exists idx_projects_display_order on public.projects (display_order asc);


-- ------------------------------------------------------------------------------
-- 2. CREATE "project-screenshots" STORAGE BUCKET & POLICIES
-- ------------------------------------------------------------------------------
-- Insert bucket into storage.buckets if it does not already exist
insert into storage.buckets (id, name, public)
values ('project-screenshots', 'project-screenshots', true)
on conflict (id) do update set public = true;

-- Drop existing storage policies if re-running
drop policy if exists "Public Access to project-screenshots" on storage.objects;
drop policy if exists "Allow uploads to project-screenshots" on storage.objects;
drop policy if exists "Allow updates to project-screenshots" on storage.objects;
drop policy if exists "Allow deletes in project-screenshots" on storage.objects;

-- Storage Policy 1: Public read access for images
create policy "Public Access to project-screenshots"
  on storage.objects
  for select
  using (bucket_id = 'project-screenshots');

-- Storage Policy 2: Allow uploading screenshots
create policy "Allow uploads to project-screenshots"
  on storage.objects
  for insert
  with check (bucket_id = 'project-screenshots');

-- Storage Policy 3: Allow updating screenshots
create policy "Allow updates to project-screenshots"
  on storage.objects
  for update
  using (bucket_id = 'project-screenshots');

-- Storage Policy 4: Allow deleting screenshots
create policy "Allow deletes in project-screenshots"
  on storage.objects
  for delete
  using (bucket_id = 'project-screenshots');


-- ------------------------------------------------------------------------------
-- 3. SEED INITIAL PORTFOLIO PROJECTS DATA
-- ------------------------------------------------------------------------------
-- Pre-populates the database with the 5 projects already in your Cartera portfolio
insert into public.projects (title, description, tech_tags, live_url, screenshot_url, display_order)
values
  (
    'Zivelle',
    'Jewelry ecommerce store with a custom admin panel for products, variants, and reviews.',
    'HTML/CSS/JS, Supabase, Admin Panel',
    'https://zivelle-website.vercel.app/',
    'images/zivelle.jpg',
    1
  ),
  (
    'SweetSlice',
    'Bakery redesign with scroll effects, custom cake requests, and a gallery-managed admin panel.',
    'HTML/CSS/JS, Supabase',
    'https://sweetslice-psi.vercel.app/',
    'images/sweetslice.jpg',
    2
  ),
  (
    'Yilo by Achieng',
    'Events and experiences agency site built for a Kenya-based client.',
    'HTML/CSS/JS, Static Site',
    'https://yilo-one.vercel.app/',
    'images/yilo.jpg',
    3
  ),
  (
    'AutoDetail',
    'Pixel-close clone of a car detailing business template, built section by section.',
    'HTML/CSS/JS',
    'https://autodetailing-clone.vercel.app/',
    'images/autodetail.jpg',
    4
  ),
  (
    'Telehealth App',
    'Telehealth platform clone with live video calling and a Stripe sandbox payment integration.',
    'Video Calling, Stripe, Full-Stack',
    'https://telehealth-app-seven.vercel.app/',
    'images/telehealth.jpg',
    5
  )
on conflict do nothing;
