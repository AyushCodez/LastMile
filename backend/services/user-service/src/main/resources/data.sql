insert into users(id, name, email, password, role) values ('user-ayush-123', 'Ayush Driver', 'ayush@test.com', 'password', 'DRIVER') on conflict (email) do nothing;
