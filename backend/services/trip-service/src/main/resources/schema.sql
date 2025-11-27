-- Trip service schema
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

create table if not exists trips (
  trip_id varchar(36) primary key,
  driver_id varchar(36) not null,
  route_id varchar(36),
  station_area_id varchar(64) not null references areas(area_id),
  destination_area_id varchar(64) not null references areas(area_id),
  status varchar(16) not null,
  scheduled_departure timestamptz not null
);

create table if not exists trip_riders (
  trip_id varchar(36) not null references trips(trip_id) on delete cascade,
  rider_user_id varchar(36) not null,
  primary key (trip_id, rider_user_id)
);
