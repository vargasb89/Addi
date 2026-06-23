create table if not exists leads (
  id text primary key,
  name text not null,
  category text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  rating numeric,
  review_count integer not null default 0,
  phone text,
  status text not null default 'new'
    check (status in ('new', 'routed', 'visited', 'interested', 'onboarding', 'lost')),
  potential_score integer not null default 50,
  city text not null,
  source text not null default 'manual'
    check (source in ('google_places', 'demo', 'manual')),
  notes text,
  route_order integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_city_status_idx on leads (city, status);
create index if not exists leads_route_order_idx on leads (route_order);
create index if not exists leads_score_idx on leads (potential_score desc);
