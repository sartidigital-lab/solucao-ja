'use client';

import React, { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { addPortfolioImage, deletePortfolioImage } from '@/actions/portfolio';

interface PortfolioManagerProps {
  initialImages: any[];
  userId: string;
}

export default function PortfolioManager({ initialImages, userId }: PortfolioManagerProps) {
  const [images, setImages] = useState(initialImages);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Limit file size to 5MB
      if (selectedFile.size > 5 * 1024 * 1024) {
        setUploadError('Tamanho máximo permitido: 5MB');
        setFile(null);
        return;
      }
      
      setUploadError(null);
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Por favor, selecione uma foto');
      return;
    }

    if (images.length >= 10) {
      setUploadError('Você já atingiu o limite máximo de 10 fotos no portfólio');
      return;
    }

    setUploadProgress(true);
    setUploadError(null);

    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    try {
      // 1. Upload to Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file);

      if (storageError) {
        throw new Error(storageError.message);
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      // 3. Save to database via Server Action
      const res = await addPortfolioImage(publicUrl, title);

      if (res?.error) {
        throw new Error(res.error);
      }

      // 4. Update state and reset form
      setImages([{ id: Math.random().toString(), image_url: publicUrl, title }, ...images]);
      setFile(null);
      setTitle('');
      
      // Quick reload to sync server state IDs
      window.location.reload();
    } catch (err: any) {
      setUploadError(err.message || 'Erro ao fazer upload');
    } finally {
      setUploadProgress(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('Deseja excluir esta imagem do portfólio?')) return;

    startTransition(async () => {
      // 1. Delete database reference
      const res = await deletePortfolioImage(id);
      if (res?.error) {
        setUploadError(res.error);
        return;
      }

      // 2. Try deleting from storage
      const pathParts = imageUrl.split('/portfolio/');
      if (pathParts.length > 1) {
        const storagePath = pathParts[1];
        const supabase = createClient();
        await supabase.storage.from('portfolio').remove([storagePath]);
      }

      // 3. Update state
      setImages(images.filter((img) => img.id !== id));
    });
  };

  return (
    <div className="space-y-8">
      {/* Upload Box */}
      <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800">
        <h2 className="text-lg font-bold text-slate-200 mb-4">Adicionar Foto</h2>
        
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs text-slate-400 mb-1">Escolher Foto (PNG, JPG, WebP - Max 5MB)</label>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 file:cursor-pointer"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-xs text-slate-400 mb-1">Legenda (Opcional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm text-white outline-none focus:border-teal-500"
              placeholder="Ex: Unha em gel decorada"
            />
          </div>

          <div className="md:col-span-1">
            <button
              type="submit"
              disabled={uploadProgress || !file}
              className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-teal-500 transition disabled:opacity-50 cursor-pointer"
            >
              {uploadProgress ? 'Enviando...' : 'Fazer Upload'}
            </button>
          </div>
        </form>

        {uploadError && (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {uploadError}
          </div>
        )}
      </div>

      {/* Grid Images */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-200">Suas Fotos ({images.length}/10)</h2>
        </div>

        {images.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center text-slate-500">
            Seu portfólio está vazio. Faça o upload de fotos acima para começar.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((img) => (
              <div key={img.id} className="group relative aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.image_url}
                  alt={img.title || 'Foto do portfólio'}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
                
                {/* Overlay details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  {img.title && (
                    <p className="text-sm font-semibold text-white mb-1 leading-tight">{img.title}</p>
                  )}
                  <button
                    onClick={() => handleDelete(img.id, img.image_url)}
                    disabled={isPending}
                    className="text-xs text-red-400 hover:text-red-300 text-left font-bold cursor-pointer"
                  >
                    Excluir Foto
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
