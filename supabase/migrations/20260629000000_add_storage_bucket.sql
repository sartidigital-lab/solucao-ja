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
