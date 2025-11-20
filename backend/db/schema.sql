-- PostgreSQL schema for LastMile microservices
-- Run in a DB named `lastmile` (or adjust urls in application.properties)

create table if not exists users (
  id varchar(36) primary key,
  name text not null,
  email text not null unique,
  password text not null,
  role varchar(10) not null
);

create table if not exists drivers (
  driver_id varchar(36) primary key,
  user_id varchar(36) not null references users(id) on delete cascade,
  vehicle_no text not null,
  capacity int not null
);
create index if not exists idx_drivers_user on drivers(user_id);

create table if not exists routes (
  route_id varchar(36) primary key,
  driver_id varchar(36) not null references drivers(driver_id) on delete cascade,
  destination text not null
);
create index if not exists idx_routes_driver on routes(driver_id);

create table if not exists route_stations (
  route_id varchar(36) not null references routes(route_id) on delete cascade,
  station_id varchar(36) not null,
  primary key (route_id, station_id)
);

create table if not exists stations (
  id varchar(36) primary key,
  name text not null,
  lat double precision not null,
  lng double precision not null
);

create table if not exists station_nearby_places (
  station_id varchar(36) not null references stations(id) on delete cascade,
  place_id text not null,
  primary key (station_id, place_id)
);

create table if not exists trips (
  trip_id varchar(36) primary key,
  driver_id varchar(36) not null references drivers(driver_id),
  status varchar(16) not null,
  scheduled_time timestamptz not null,
  destination text not null
);
create index if not exists idx_trips_driver on trips(driver_id);

create table if not exists trip_riders (
  trip_id varchar(36) not null references trips(trip_id) on delete cascade,
  rider_user_id varchar(36) not null references users(id),
  primary key (trip_id, rider_user_id)
);

create table if not exists ride_intents (
  intent_id varchar(36) primary key,
  user_id varchar(36) not null references users(id) on delete cascade,
  station_id varchar(36) not null references stations(id) on delete restrict,
  arrival_time timestamptz not null,
  destination text not null,
  party_size int not null,
  status varchar(16) not null,
  trip_id varchar(36) null references trips(trip_id)
);
create index if not exists idx_ride_intents_station_status on ride_intents(station_id, status);

create table if not exists driver_locations (
  id bigserial primary key,
  driver_id varchar(36) not null references drivers(driver_id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  ts timestamptz not null,
  speed double precision
);
create index if not exists idx_driver_locations_latest on driver_locations(driver_id, ts desc);

create table if not exists notifications (
  id bigserial primary key,
  user_id varchar(36) not null references users(id) on delete cascade,
  title text not null,
  body text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user_created on notifications(user_id, created_at desc);

-- Optional: store matching events (if needed later)
create table if not exists match_events (
  event_id varchar(36) primary key,
  station_id varchar(36) references stations(id),
  trip_id varchar(36) references trips(trip_id),
  driver_id varchar(36) references drivers(driver_id),
  created_at timestamptz not null default now()
);
