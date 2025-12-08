/**
 * Logo Upload Service
 *
 * Downloads token logos from IPFS/Arweave and uploads to Supabase Storage
 */

import { createClient } from '@supabase/supabase-js';

const STORAGE_BUCKET = 'project-logos';

/**
 * Download image from URL and upload to Supabase Storage
 * @returns Public URL of uploaded image, or null if failed
 */
export async function uploadLogoFromUrl(
  imageUrl: string,
  projectSlug: string
): Promise<string | null> {
  try {
    // 1. Download image from IPFS/Arweave/CDN
    const response = await fetch(imageUrl, {
      signal: AbortSignal.timeout(10000) // 10s timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    const blob = await response.blob();

    // Determine file extension from content type
    const extension = getExtensionFromContentType(contentType);
    const fileName = `${projectSlug}.${extension}`;

    // 2. Upload to Supabase Storage
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, blob, {
        contentType,
        upsert: true, // Replace if exists
        cacheControl: '31536000' // 1 year
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return null;
    }

    // 3. Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Logo upload failed:', error);
    return null;
  }
}

/**
 * Convert content type to file extension
 */
function getExtensionFromContentType(contentType: string): string {
  const typeMap: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/avif': 'avif'
  };

  return typeMap[contentType.toLowerCase()] || 'png';
}

/**
 * Upload a logo from a Buffer
 */
export async function uploadLogoFromBuffer(
  buffer: Buffer,
  projectSlug: string,
  contentType: string = 'image/png'
): Promise<string | null> {
  try {
    const extension = getExtensionFromContentType(contentType);
    const fileName = `${projectSlug}.${extension}`;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, buffer, {
        contentType,
        upsert: true,
        cacheControl: '31536000'
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Logo upload failed:', error);
    return null;
  }
}

/**
 * Delete a logo from storage
 */
export async function deleteLogo(projectSlug: string): Promise<boolean> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Try all possible extensions
    const extensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif'];

    for (const ext of extensions) {
      await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([`${projectSlug}.${ext}`]);
    }

    return true;
  } catch (error) {
    console.error('Logo deletion failed:', error);
    return false;
  }
}
