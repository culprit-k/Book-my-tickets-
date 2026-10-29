-- CineVerse foundation schema for Supabase/PostgreSQL.
-- Apply in a new Supabase project only after reviewing this migration.
create extension if not exists pgcrypto;

create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  synopsis text,
  language text,
  duration_minutes integer check (duration_minutes > 0),
  poster_url text,
  trailer_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.theatres (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  address text,
  created_at timestamptz not null default now()
);

create table if not exists public.auditoriums (
  id uuid primary key default gen_random_uuid(),
  theatre_id uuid not null references public.theatres(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (theatre_id, name)
);

create table if not exists public.seats (
  id uuid primary key default gen_random_uuid(),
  auditorium_id uuid not null references public.auditoriums(id) on delete cascade,
  row_label text not null,
  seat_number integer not null check (seat_number > 0),
  seat_type text not null default 'standard' check (seat_type in ('standard','premium','accessible')),
  unique (auditorium_id, row_label, seat_number)
);

create table if not exists public.showtimes (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references public.movies(id),
  auditorium_id uuid not null references public.auditoriums(id),
  starts_at timestamptz not null,
  currency char(3) not null default 'USD',
  standard_price_cents integer not null check (standard_price_cents >= 0),
  status text not null default 'scheduled' check (status in ('scheduled','cancelled','completed')),
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  showtime_id uuid not null references public.showtimes(id),
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','expired')),
  total_cents integer not null check (total_cents >= 0),
  currency char(3) not null default 'USD',
  hold_expires_at timestamptz not null default (now() + interval '10 minutes'),
  payment_reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.booking_seats (
  booking_id uuid not null references public.bookings(id) on delete cascade,
  showtime_id uuid not null references public.showtimes(id),
  seat_id uuid not null references public.seats(id),
  price_cents integer not null check (price_cents >= 0),
  primary key (booking_id, seat_id),
  -- A seat can be held by only one booking for a given showtime.
  unique (showtime_id, seat_id)
);

create index if not exists showtimes_movie_start_idx on public.showtimes(movie_id, starts_at);
create index if not exists bookings_user_created_idx on public.bookings(user_id, created_at desc);
create index if not exists bookings_expiry_idx on public.bookings(status, hold_expires_at);

-- Atomically hold requested seats for the signed-in user.
-- This is only a temporary hold; it does NOT charge a payment method or confirm a booking.
create or replace function public.hold_seats(p_showtime_id uuid, p_seat_ids uuid[])
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_booking_id uuid;
  v_price integer;
  v_currency char(3);
  v_count integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;
  if p_seat_ids is null or cardinality(p_seat_ids) = 0 then
    raise exception 'Select at least one seat';
  end if;
  if cardinality(p_seat_ids) > 10 then
    raise exception 'A maximum of 10 seats can be held at once';
  end if;
  if (select count(distinct x) from unnest(p_seat_ids) as x) <> cardinality(p_seat_ids) then
    raise exception 'Duplicate seat IDs are not allowed';
  end if;

  -- Release expired pending holds before trying to reserve seats.
  update public.bookings
     set status = 'expired'
   where status = 'pending' and hold_expires_at <= now();

  delete from public.booking_seats bs
   using public.bookings b
   where bs.booking_id = b.id and b.status = 'expired';

  select s.standard_price_cents, s.currency
    into v_price, v_currency
    from public.showtimes s
   where s.id = p_showtime_id and s.status = 'scheduled' and s.starts_at > now();

  if not found then
    raise exception 'Showtime is not available';
  end if;

  select count(*) into v_count
    from public.seats se
   where se.id = any(p_seat_ids)
     and se.auditorium_id = (select auditorium_id from public.showtimes where id = p_showtime_id);

  if v_count <> cardinality(p_seat_ids) then
    raise exception 'One or more seats do not belong to this auditorium';
  end if;

  insert into public.bookings(user_id, showtime_id, total_cents, currency)
  values (v_user_id, p_showtime_id, v_price * cardinality(p_seat_ids), v_currency)
  returning id into v_booking_id;

  -- Unique(showtime_id, seat_id) ensures concurrent requests cannot hold the same seat twice.
  insert into public.booking_seats(booking_id, showtime_id, seat_id, price_cents)
  select v_booking_id, p_showtime_id, unnest(p_seat_ids), v_price;

  return v_booking_id;
exception
  when unique_violation then
    raise exception 'One or more selected seats are no longer available';
end;
$$;

alter table public.movies enable row level security;
alter table public.theatres enable row level security;
alter table public.auditoriums enable row level security;
alter table public.seats enable row level security;
alter table public.showtimes enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_seats enable row level security;

-- Public catalogue reads only published movies and scheduled future showtimes.
create policy "Published movies are viewable" on public.movies for select using (is_published = true);
create policy "Theatres are viewable" on public.theatres for select using (true);
create policy "Auditoriums are viewable" on public.auditoriums for select using (true);
create policy "Seats are viewable" on public.seats for select using (true);
create policy "Scheduled showtimes are viewable" on public.showtimes for select using (status = 'scheduled' and starts_at > now());

create policy "Users can view own bookings" on public.bookings for select using (auth.uid() = user_id);
create policy "Users can view own booking seats" on public.booking_seats for select
  using (exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid()));

revoke all on function public.hold_seats(uuid, uuid[]) from public;
grant execute on function public.hold_seats(uuid, uuid[]) to authenticated;

-- Writes to booking tables are intentionally not granted to clients directly.
-- Add a trusted payment webhook/server-side confirmation path before accepting real money.
