export type AdminRouteStatus =
  | 'pending'
  | 'researched'
  | 'content_generated'
  | 'image_ready'
  | 'published'
  | 'failed';

export type AdminRoutePointOrder = 'id_desc' | 'id_asc';

export interface AdminRoutePointTranslation {
  language: string;
  imagePrompt: string | null;
  narrative: string | null;
}

export interface AdminRoutePoint {
  id: number;
  journey_id: number;
  sequence: number;
  place_name: string | null;
  country: string | null;
  region: string | null;
  coordinates: { lat: number; lng: number };
  status: AdminRouteStatus;
  image_prompt: string | null;
  narrative_prompt: string | null;
  image_path: string | null;
  thumbnail_path: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  translations?: AdminRoutePointTranslation[];
}

export interface AdminRoutePointListResponse {
  route_points: AdminRoutePoint[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface AdminRoutePointUpdateInput {
  place_name?: string | null;
  country?: string | null;
  region?: string | null;
  coordinates?: { lat: number; lng: number };
  image_prompt?: string | null;
  narrative_prompt?: string | null;
  image_path?: string | null;
  thumbnail_path?: string | null;
  status?: AdminRouteStatus;
  error_message?: string | null;
}
