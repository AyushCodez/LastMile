-- Driver service bootstrap schema (area-aware)
create table if not exists areas (
  area_id varchar(64) primary key,
  name text not null,
  is_station boolean not null default false
);

create table if not exists area_edges (
  from_area_id varchar(64) not null,
  to_area_id varchar(64) not null,
  travel_minutes int not null,
  primary key (from_area_id, to_area_id)
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

insert into area_edges(from_area_id, to_area_id, travel_minutes) values
  ('majestic', 'mg_road', 12), ('mg_road', 'majestic', 12),
  ('mg_road', 'church_street', 3), ('church_street', 'mg_road', 3),
  ('church_street', 'shivajinagar', 4), ('shivajinagar', 'church_street', 4),
  ('shivajinagar', 'cantonment', 4), ('cantonment', 'shivajinagar', 4),
  ('cantonment', 'mg_road', 8), ('mg_road', 'cantonment', 8),
  ('mg_road', 'ulsoor', 4), ('ulsoor', 'mg_road', 4),
  ('ulsoor', 'indiranagar', 6), ('indiranagar', 'ulsoor', 6),
  ('indiranagar', 'domlur', 5), ('domlur', 'indiranagar', 5),
  ('domlur', 'koramangala', 10), ('koramangala', 'domlur', 10),
  ('koramangala', 'hsr_layout', 6), ('hsr_layout', 'koramangala', 6),
  ('hsr_layout', 'silk_board', 3), ('silk_board', 'hsr_layout', 3),
  ('silk_board', 'electronic_city', 15), ('electronic_city', 'silk_board', 15),
  ('silk_board', 'btm_layout', 4), ('btm_layout', 'silk_board', 4),
  ('btm_layout', 'jp_nagar', 6), ('jp_nagar', 'btm_layout', 6),
  ('jp_nagar', 'jayanagar', 4), ('jayanagar', 'jp_nagar', 4),
  ('jayanagar', 'basavanagudi', 6), ('basavanagudi', 'jayanagar', 6),
  ('basavanagudi', 'lalbagh', 3), ('lalbagh', 'basavanagudi', 3),
  ('lalbagh', 'majestic', 12), ('majestic', 'lalbagh', 12),
  ('majestic', 'rajajinagar', 8), ('rajajinagar', 'majestic', 8),
  ('rajajinagar', 'vijayanagar', 10), ('vijayanagar', 'rajajinagar', 10),
  ('vijayanagar', 'banashankari', 12), ('banashankari', 'vijayanagar', 12),
  ('banashankari', 'jp_nagar', 5), ('jp_nagar', 'banashankari', 5),
  ('vijayanagar', 'malleswaram', 12), ('malleswaram', 'vijayanagar', 12),
  ('malleswaram', 'yeshwanthpur', 6), ('yeshwanthpur', 'malleswaram', 6),
  ('yeshwanthpur', 'hebbal', 10), ('hebbal', 'yeshwanthpur', 10),
  ('hebbal', 'nagawara', 8), ('nagawara', 'hebbal', 8),
  ('nagawara', 'kalyan_nagar', 5), ('kalyan_nagar', 'nagawara', 5),
  ('kalyan_nagar', 'hennur', 4), ('hennur', 'kalyan_nagar', 4),
  ('hennur', 'horamavu', 5), ('horamavu', 'hennur', 5),
  ('horamavu', 'kr_puram', 12), ('kr_puram', 'horamavu', 12),
  ('kr_puram', 'hoodi', 6), ('hoodi', 'kr_puram', 6),
  ('hoodi', 'whitefield', 6), ('whitefield', 'hoodi', 6),
  ('whitefield', 'marathahalli', 12), ('marathahalli', 'whitefield', 12),
  ('marathahalli', 'bellandur', 8), ('bellandur', 'marathahalli', 8),
  ('bellandur', 'sarjapur_road', 6), ('sarjapur_road', 'bellandur', 6),
  ('sarjapur_road', 'hsr_layout', 10), ('hsr_layout', 'sarjapur_road', 10),
  ('marathahalli', 'indiranagar', 12), ('indiranagar', 'marathahalli', 12),
  ('kr_puram', 'banaswadi', 12), ('banaswadi', 'kr_puram', 12),
  ('banaswadi', 'kalyan_nagar', 6), ('kalyan_nagar', 'banaswadi', 6),
  ('rt_nagar', 'hebbal', 5), ('hebbal', 'rt_nagar', 5),
  ('rt_nagar', 'shivajinagar', 12), ('shivajinagar', 'rt_nagar', 12)
  on conflict (from_area_id, to_area_id) do nothing;

create table if not exists drivers (
  driver_id varchar(36) primary key,
  user_id varchar(36) not null,
  vehicle_no text not null,
  capacity int not null,
  model text,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists driver_routes (
  route_id varchar(36) primary key,
  driver_id varchar(36) not null references drivers(driver_id) on delete cascade,
  final_area_id varchar(64) not null references areas(area_id),
  created_at timestamptz not null default now()
);

create table if not exists route_stops (
  id bigserial primary key,
  route_id varchar(36) not null references driver_routes(route_id) on delete cascade,
  sequence_no int not null,
  area_id varchar(64) not null references areas(area_id),
  is_station boolean not null,
  arrival_offset_minutes int not null,
  unique (route_id, sequence_no)
);
