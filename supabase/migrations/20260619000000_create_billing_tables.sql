-- Create plan_type enum
DO $$ BEGIN
  CREATE TYPE public.plan_type AS ENUM ('free', 'pro', 'ultra');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create subscription_status enum
DO $$ BEGIN
  CREATE TYPE public.subscription_status AS ENUM ('active', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create payment_status enum
DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Table: user_subscriptions
-- Tracks the user's current access level.
create table if not exists public.user_subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  plan_type public.plan_type not null default 'free',
  status public.subscription_status not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a subscription row when a new profile is created
create or replace function public.handle_new_user_subscription()
returns trigger as $$
begin
  insert into public.user_subscriptions (user_id, plan_type, status)
  values (new.id, 'free', 'active')
  on conflict (user_id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_created_subscription on public.profiles;

create trigger on_profile_created_subscription
  after insert on public.profiles
  for each row execute procedure public.handle_new_user_subscription();

-- Table: payments
-- Stores every individual purchase order.
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  plan_type public.plan_type not null,
  provider text not null default 'razorpay',
  provider_order_id text not null unique,
  provider_payment_id text unique,
  amount integer not null,
  currency text not null default 'INR',
  status public.payment_status not null default 'pending',
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for faster lookups
create index if not exists payments_user_id_idx on public.payments(user_id);
create index if not exists payments_order_id_idx on public.payments(provider_order_id);
