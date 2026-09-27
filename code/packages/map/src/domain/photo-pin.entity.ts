export interface PhotoPin {
  id: number;
  title: string;
  location: string;
  narrative: string;
  coordinates: {
    lng: number;
    lat: number;
  };
  thumbnailPath: string;
  publishedAt: Date;
}
