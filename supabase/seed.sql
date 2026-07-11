-- Create a test admin user in auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'd9b50e2d-dc99-43ef-b387-052637738f61',
  'authenticated',
  'authenticated',
  'admin@solucaoja.com.br',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin Teste","role":"admin"}',
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Create record in public.profiles (and handle potential conflict if the function trigger executed first)
INSERT INTO public.profiles (
  id,
  role,
  full_name,
  phone,
  avatar_url,
  city,
  bairro
) VALUES (
  'd9b50e2d-dc99-43ef-b387-052637738f61',
  'admin',
  'Admin Teste',
  '27999999999',
  NULL,
  'Vitória',
  'Jardim da Penha'
) ON CONFLICT (id) DO UPDATE SET 
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;
