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

// Pour les preuves de jeu : photo OU vidéo, pas de recadrage imposé.
export async function pickProofMedia(): Promise<{ uri: string; type: 'photo' | 'video' } | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    quality: 0.7,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  return { uri: asset.uri, type: asset.type === 'video' ? 'video' : 'photo' };
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
  return `${data.publicUrl}?t=${Date.now()}`;
}

// Upload vers un bucket PRIVÉ (chat-media, game-proofs) — pas d'URL publique,
// on résoud une URL signée à l'affichage via getSignedUrl.
export async function uploadPrivateFile(bucket: string, path: string, localUri: string, contentType: string) {
  const response = await fetch(localUri);
  const arrayBuffer = await response.arrayBuffer();
  const { error } = await supabase.storage.from(bucket).upload(path, arrayBuffer, { contentType, upsert: true });
  if (error) throw error;
}

export async function getSignedUrl(bucket: string, path: string, expiresSeconds = 3600): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresSeconds);
  if (error) throw error;
  return data.signedUrl;
}
