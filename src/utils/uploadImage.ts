import { supabaseSecret } from '../config/supabaseConfig';
import { v4 as uuidv4 } from 'uuid';
import AppError from './AppError';
import { UploadedFile } from 'express-fileupload';

interface UploadResult {
  publicUrl: string;
  path: string;
}

/**
 * Uploads an image file to Supabase Storage and returns the public URL and path.
 * @param file - The uploaded file object from express-fileupload.
 * @param bucket - The storage bucket name.
 * @returns UploadResult
 */

export const uploadImageToSupabase = async (
  file: UploadedFile,
  bucket = 'product.images'
): Promise<UploadResult> => {
  if (!file || !file.mimetype.startsWith('image/')) {
    throw new AppError('Only image files are allowed', 400);
  }

  const fileExt = file.name.split('.').pop();
  if (!fileExt) {
    throw new AppError('File must have an extension', 400);
  }
  const fileName = `${uuidv4()}.${fileExt}`;

  const { error: uploadError } = await supabaseSecret.storage
    .from(bucket)
    .upload(fileName, file.data, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    throw new AppError(uploadError.message, 500);
  }

  const { data: publicUrlData} = supabaseSecret.storage
    .from(bucket)
    .getPublicUrl(fileName);

  if (!publicUrlData?.publicUrl) {
    throw new AppError('Failed to get public URL', 500);
  }

  return { publicUrl: publicUrlData.publicUrl, path: fileName };
};



/**
 * Deletes an image from Supabase Storage using its path.
 * @param path - The path of the file to delete (e.g., 'some-id.jpg').
 * @param bucket - The storage bucket name.
 */
export const deleteImageFromSupabase = async (
  path: string,
  bucket = 'product.images'
): Promise<void> => {
  if (!path) return;

  const { error: deleteError } = await supabaseSecret.storage.from(bucket).remove([path]);

  if (deleteError) {
    throw new AppError(deleteError.message, 500);
  }
};
