'use server';

import { storage } from '@/lib/firebase-admin';

if (!storage) {
  console.warn('Firebase Storage is not initialized. File uploads will not work.');
}

export async function uploadVideoAction(formData: FormData): Promise<{ videoUrl?: string; error?: string }> {
  if (!storage) {
    return { error: 'Layanan penyimpanan tidak terkonfigurasi. Unggahan dibatalkan.' };
  }
  
  const file = formData.get('video') as File | null;
  if (!file) {
    return { error: 'Tidak ada file yang dipilih.' };
  }

  // Basic validation
  if (!file.type.startsWith('video/')) {
    return { error: 'File yang diunggah harus berupa video.' };
  }

  // Limit file size to 100MB for this example
  const maxSizeInBytes = 100 * 1024 * 1024; 
  if (file.size > maxSizeInBytes) {
      return { error: `Ukuran file tidak boleh melebihi ${maxSizeInBytes / 1024 / 1024}MB.` };
  }

  try {
    const bucket = storage.bucket();
    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueFilename = `videos/${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${file.name}`;
    const fileUpload = bucket.file(uniqueFilename);

    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    // Make the file public to get a permanent URL
    await fileUpload.makePublic();
    
    const videoUrl = fileUpload.publicUrl();

    return { videoUrl };
  } catch (error) {
    console.error('Error uploading video to Firebase Storage:', error);
    return { error: 'Gagal mengunggah video. Silakan coba lagi.' };
  }
}

export async function uploadAvatarAction(formData: FormData): Promise<{ avatarUrl?: string; error?: string }> {
  if (!storage) {
    return { error: 'Layanan penyimpanan tidak terkonfigurasi. Unggahan dibatalkan.' };
  }
  
  const file = formData.get('avatar') as File | null;
  if (!file) {
    return { error: 'Tidak ada file yang dipilih.' };
  }

  // Basic validation
  if (!file.type.startsWith('image/')) {
    return { error: 'File yang diunggah harus berupa gambar.' };
  }

  // Limit file size to 5MB for avatars
  const maxSizeInBytes = 5 * 1024 * 1024; 
  if (file.size > maxSizeInBytes) {
      return { error: `Ukuran file tidak boleh melebihi ${maxSizeInBytes / 1024 / 1024}MB.` };
  }

  try {
    const bucket = storage.bucket();
    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueFilename = `avatars/${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${file.name}`;
    const fileUpload = bucket.file(uniqueFilename);

    await fileUpload.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    await fileUpload.makePublic();
    
    const avatarUrl = fileUpload.publicUrl();

    return { avatarUrl };
  } catch (error) {
    console.error('Error uploading avatar to Firebase Storage:', error);
    return { error: 'Gagal mengunggah avatar. Silakan coba lagi.' };
  }
}
