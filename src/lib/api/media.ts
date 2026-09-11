import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';

export async function pickImage(square = true): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
    allowsEditing: square,
    aspect: square ? [1, 1] : undefined,
  });
  if (result.canceled) return null;
  return result.assets[0].uri;
}

// Upload vers un bucket PUBLIC (avatars, circle-images) et renvoie l'URL publique.
export async function uploadPublicImage(bucket: string, path: string, localUri: string): Promise<string> {
  const response = await fetch(localUri);
  const arrayBuffer = await response.arrayBuffer();
  const { error } = await supabase.storage.from(bucket).upload(path, arrayBuffer, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  // Casse le cache CDN quand la même photo est remplacée au même chemin.
  return `${data.publicUrl}?t=${Date.now()}`;
}
