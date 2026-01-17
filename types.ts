
export enum UserRole {
  VISITOR = 'VISITOR',
  BUSINESS_PARTNER = 'BUSINESS_PARTNER',
  ADMIN = 'ADMIN'
}

export enum TrailCategory {
  COASTAL = 'Coastal',
  FOREST = 'Forest',
  MOUNTAIN = 'Mountain',
  HISTORICAL = 'Historical Site',
  URBAN = 'Urban Exploration'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Checkpoint {
  id: string;
  name: string;
  description: string;
  location: Coordinates;
  hasReward: boolean;
  rewardText?: string;
}

export interface Trail {
  id: string;
  title: string;
  description: string;
  location: Coordinates;
  price: number;
  currency: 'GBP' | 'USD' | 'EUR';
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  durationMinutes: number;
  distanceKm: number;
  imageUrl: string;
  panoramaUrl?: string;
  galleryImages?: string[];
  tags: string[];
  category: TrailCategory;
  checkpoints: Checkpoint[];
  partnerId?: string;
  // Dashboard Insight Fields
  popularityScore: number; // 0-100
  activeVisitors: number;
  trending?: boolean;
}

export interface UserActivity {
  id: string;
  trailId: string;
  trailTitle: string;
  status: 'COMPLETED' | 'IN_PROGRESS';
  progressPercent: number;
  date: string;
  rewardsEarned: string[];
}

export interface UserBooking {
  id: string;
  accommodationId: string;
  accommodationName: string;
  checkIn: string;
  checkOut: string;
  priceTotal: number;
  status: 'CONFIRMED' | 'STAYED' | 'CANCELLED';
  imageUrl: string;
}

export interface Accommodation {
  id: string;
  trailId: string;
  name: string;
  type: 'Hotel' | 'B&B' | 'Cabin' | 'Hostel' | 'Glamping' | 'Airbnb' | 'Caravan' | 'Mobile Home';
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  originalPrice?: number;
  currency: string;
  imageUrl: string;
  amenities: string[];
  distanceToTrailKm: number;
  tags: string[];
  scarcityMsg?: string;
}

export interface BusinessPartner {
  id: string;
  name: string;
  type: 'Hospitality' | 'Retail' | 'Heritage';
  logoUrl: string;
  subscriptionTier: 'Basic' | 'Premium';
}
