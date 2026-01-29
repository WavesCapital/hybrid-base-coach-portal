import { supabase } from "./supabase";

/**
 * Upload a PDF file to the coach-pdfs bucket.
 * Files are stored under {userId}/{timestamp}_{filename}.
 */
export async function uploadPDF(
  userId: string,
  file: File
): Promise<{ url: string; path: string }> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${userId}/${timestamp}_${safeName}`;

  const { error } = await supabase.storage
    .from("coach-pdfs")
    .upload(path, file, {
      contentType: "application/pdf",
      upsert: false,
    });

  if (error) {
    throw new Error(`PDF upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("coach-pdfs").getPublicUrl(path);

  return { url: publicUrl, path };
}

/**
 * Upload a profile photo to the coach-photos bucket.
 * Files are stored under {userId}/{timestamp}_{filename}.
 */
export async function uploadProfilePhoto(
  userId: string,
  file: File
): Promise<{ url: string; path: string }> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${userId}/${timestamp}_${safeName}`;

  const { error } = await supabase.storage
    .from("coach-photos")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Photo upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("coach-photos").getPublicUrl(path);

  return { url: publicUrl, path };
}
