-- Habilitar políticas de escrita para o Administrador correspondentes às ações de gestão (CRUD) de categorias e prestadores
-- Usando auth.jwt() para extrair o role dos metadados e evitar recursão infinita na tabela public.profiles

-- 1. Políticas de escrita para public.categories
CREATE POLICY "Admins can insert categories" ON public.categories
    FOR INSERT WITH CHECK (((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'));

CREATE POLICY "Admins can update categories" ON public.categories
    FOR UPDATE USING (((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'));

CREATE POLICY "Admins can delete categories" ON public.categories
    FOR DELETE USING (((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'));

-- 2. Políticas de escrita para public.professionals
CREATE POLICY "Admins can update professionals" ON public.professionals
    FOR UPDATE USING (((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'));

CREATE POLICY "Admins can delete professionals" ON public.professionals
    FOR DELETE USING (((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'));

-- 3. Políticas de escrita para public.profiles
CREATE POLICY "Admins can update profiles" ON public.profiles
    FOR UPDATE USING (((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'));

CREATE POLICY "Admins can delete profiles" ON public.profiles
    FOR DELETE USING (((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'));
