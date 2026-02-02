export interface Photo {
  id: number;
  route_point_id: number;
  title: string;
  narrative: string;
  location: string;
  coordinates: {
    x: number;
    y: number;
  };
  camera_model: string | null;
  lens: string | null;
  iso: number | null;
  shutter_speed: string | null;
  roll_number: string | null;
  frame_number: string | null;
  series_name: string | null;
  volume_issue: string | null;
  image_path: string;
  thumbnail_path: string;
  published_at: string;
  created_at: string;
}

export interface RoutePoint {
  id: number;
  journey_id: number;
  sequence: number;
  longitude: number;
  latitude: number;
  distance_km: number | null;
  city_name: string | null;
  country_name: string | null;
  status: 'pending' | 'researched' | 'content_generated' | 'image_ready' | 'published' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface JourneyStats {
  journey: {
    id: number;
    name: string;
    started_at: string;
    updated_at: string;
  };
  stats: {
    total_distance_km: number;
    route_points: Array<{
      status: string;
      count: number;
    }>;
    photos_published: number;
  };
}
