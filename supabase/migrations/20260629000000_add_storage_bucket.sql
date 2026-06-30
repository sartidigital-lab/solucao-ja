-- Insert the portfolio bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public viewing of portfolio images
CREATE POLICY "Public Access to Portfolio" ON storage.objects
    FOR SELECT USING (bucket_id = 'portfolio');

-- Allow authenticated professionals to upload images to their own folder in the portfolio bucket
CREATE POLICY "Professional Upload to Portfolio" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'portfolio' 
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Allow professionals to delete their own images in the portfolio bucket
CREATE POLICY "Professional Delete from Portfolio" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'portfolio'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Seed Categories
INSERT INTO public.categories (name, slug, description, icon) VALUES
('Manicure', 'manicure', 'Serviços de manicure, pedicure e unhas em gel', 'Scissors'),
('Cabeleireira', 'cabeleireira', 'Corte, escova, tintura e tratamentos capilares', 'User'),
('Designer de Sobrancelhas', 'designer-sobrancelhas', 'Design de sobrancelhas, henna e micropigmentação', 'Eye'),
('Maquiadora', 'maquiadora', 'Maquiagem social, noivas e festas', 'Sparkles'),
('Faxineira / Diarista', 'faxineira-diarista', 'Limpeza residencial e comercial', 'Home'),
('Eletricista', 'eletricista', 'Reparos elétricos, instalações e fiação', 'Zap'),
('Encanador', 'encanador', 'Vazamentos, desentupimentos e instalações hidráulicas', 'Droplet'),
('Pedreiro', 'pedreiro', 'Reformas, construções e acabamentos', 'Hammer'),
('Pintor', 'pintor', 'Pintura residencial e comercial', 'Paintbrush'),
('Montador de Móveis', 'montador-moveis', 'Montagem e desmontagem de móveis em geral', 'Wrench'),
('Serviços Gerais', 'servicos-gerais', 'Reparos diversos e marido de aluguel', 'Settings')
ON CONFLICT (slug) DO NOTHING;

