export type UUID = string;

export type Profile = {
  id: UUID;
  display_name: string;
  handle: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Circle = {
  id: UUID;
  name: string;
  image_url: string | null;
  creator_id: UUID;
  total_play_seconds: number;
  created_at: string;
};

export type CircleMember = {
  circle_id: UUID;
  user_id: UUID;
  order_index: number;
  joined_at: string;
  profiles?: Profile;
};

export type CircleInvite = {
  id: UUID;
  circle_id: UUID;
  code: string;
  created_by: UUID;
  created_at: string;
  expires_at: string;
  used_at: string | null;
  used_by: UUID | null;
};

export type FriendRequest = {
  id: UUID;
  sender_id: UUID;
  receiver_id: UUID;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  responded_at: string | null;
  sender?: Profile;
  receiver?: Profile;
};

export type AppNotification = {
  id: UUID;
  recipient_id: UUID;
  type: string;
  payload: Record<string, unknown>;
  circle_id: UUID | null;
  read_at: string | null;
  created_at: string;
};

export type Game = {
  id: UUID;
  circle_id: UUID;
  status: 'lobby' | 'in_progress' | 'finished' | 'abandoned';
  mode: string;
  current_target_id: UUID | null;
  current_poser_id: UUID | null;
  cycle_number: number;
  created_by: UUID;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
};
