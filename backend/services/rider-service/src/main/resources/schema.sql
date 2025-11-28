-- Rider service schema (area aware)
create table if not exists areas (
  area_id varchar(64) primary key,
  name text not null,
  is_station boolean not null default false
);

insert into areas(area_id, name, is_station) values
  ('majestic', 'Majestic Interchange', true),
  ('mg_road', 'MG Road', false),
  ('church_street', 'Church Street', false),
  ('indiranagar', 'Indiranagar', false),
  ('domlur', 'Domlur', false),
  ('ulsoor', 'Ulsoor', false),
  ('koramangala', 'Koramangala', false),
  ('hsr_layout', 'HSR Layout', false),
  ('bellandur', 'Bellandur', false),
  ('sarjapur_road', 'Sarjapur Road', false),
  ('btm_layout', 'BTM Layout', false),
  ('silk_board', 'Silk Board Junction', true),
  ('electronic_city', 'Electronic City Phase 1', true),
  ('whitefield', 'Whitefield', true),
  ('marathahalli', 'Marathahalli', false),
  ('kr_puram', 'KR Puram', false),
  ('banaswadi', 'Banaswadi', false),
  ('kalyan_nagar', 'Kalyan Nagar', false),
  ('nagawara', 'Nagawara', false),
  ('hebbal', 'Hebbal', false),
  ('yeshwanthpur', 'Yeshwanthpur Interchange', true),
  ('malleswaram', 'Malleswaram', false),
  ('rajajinagar', 'Rajajinagar', false),
  ('vijayanagar', 'Vijayanagar', false),
  ('basavanagudi', 'Basavanagudi', false),
  ('jayanagar', 'Jayanagar', false),
  ('jp_nagar', 'JP Nagar', false),
  ('banashankari', 'Banashankari', false),
  ('lalbagh', 'Lalbagh', false),
  ('cantonment', 'Bengaluru Cantonment', false),
  ('shivajinagar', 'Shivajinagar', false),
  ('rt_nagar', 'RT Nagar', false),
  ('hennur', 'Hennur', false),
  ('horamavu', 'Horamavu', false),
  ('hoodi', 'Hoodi', false)
  on conflict (area_id) do nothing;

create table if not exists ride_intents (
  intent_id varchar(36) primary key,
  user_id varchar(36) not null,
  station_area_id varchar(64) not null references areas(area_id),
  arrival_time timestamptz not null,
  destination_area_id varchar(64) not null references areas(area_id),
  party_size int not null,
  status varchar(16) not null,
  trip_id varchar(36)
);
create index if not exists idx_ride_intents_station_status on ride_intents(station_area_id, status);
create index if not exists idx_ride_intents_destination on ride_intents(destination_area_id);
