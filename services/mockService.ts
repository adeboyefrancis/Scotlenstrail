import { User, UserRole, Trail, AuthResponse, Accommodation, UserActivity, UserBooking, TrailCategory } from '../types';

let MOCK_TRAILS: Trail[] = [
  {
    id: 't1',
    title: 'The Royal Mile Secrets',
    description: 'Discover hidden closes and historical secrets along Edinburgh\'s most famous street. This AR tour reveals the ghosts of the past and the underground city forgotten by time.',
    location: { lat: 55.9501, lng: -3.1875 },
    price: 0,
    currency: 'GBP',
    difficulty: 'Easy',
    durationMinutes: 90,
    distanceKm: 1.8,
    imageUrl: 'https://cdn.tiqy.com/img/t/secrets-of-the-royal-mile-mercat-tours-scotland-5630.jpg?width=850&height=460&fixedwidthheight=true',
    panoramaUrl: 'https://cdn.tiqy.com/img/t/secrets-of-the-royal-mile-mercat-tours-scotland-5631.jpg?width=850&height=460&fixedwidthheight=true',
    galleryImages: [
      'https://cdn.tiqy.com/img/t/secrets-of-the-royal-mile-mercat-tours-scotland-5633.jpg?width=850&height=460&fixedwidthheight=true',
      'https://cdn.tiqy.com/img/t/secrets-of-the-royal-mile-mercat-tours-scotland-5630.jpg?width=850&height=460&fixedwidthheight=true'
    ],
    tags: ['History', 'Urban', 'Free'],
    category: TrailCategory.HISTORICAL,
    checkpoints: [
      { id: 'c1', name: 'St Giles Cathedral', description: 'Look for the Heart of Midlothian in the cobblestones.', location: { lat: 55.9495, lng: -3.1909 }, hasReward: false },
      { id: 'c2', name: 'The Real Mary King\'s Close', description: 'Underground streets frozen in the 17th century.', location: { lat: 55.9502, lng: -3.1904 }, hasReward: true, rewardText: '10% off entry ticket' }
    ],
    popularityScore: 95,
    activeVisitors: 42,
    trending: true
  },
  {
    id: 't2',
    title: 'Arthur\'s Seat Volcanic Walk',
    description: 'Hike up an ancient volcano for panoramic views of the city. AR overlays show the geological formation of the Edinburgh skyline.',
    location: { lat: 55.9441, lng: -3.1618 },
    price: 4.99,
    currency: 'GBP',
    difficulty: 'Moderate',
    durationMinutes: 120,
    distanceKm: 4.7,
    imageUrl: 'https://d1km7u9ubck4j.cloudfront.net/production-upgrade-2024/bef0032618987cbf7a5dff5ff3d5da7f/conversions/66e893a947670-HD.jpg',
    panoramaUrl: 'https://edinburghtips.com/images/arthursseat.jpg',
    galleryImages: [
        'https://edinburghtourist.co.uk/attractions/arthurs-seat/',
        'https://trekkingthedream.com/wp-content/uploads/2024/04/walking-arthurs-seat-3.jpg'
    ],
    tags: ['Nature', 'Geology', 'Premium'],
    category: TrailCategory.MOUNTAIN,
    checkpoints: [
      { id: 'c3', name: 'St Anthony\'s Chapel Ruins', description: 'Mysterious medieval chapel ruins.', location: { lat: 55.9460, lng: -3.1670 }, hasReward: false }
    ],
    popularityScore: 88,
    activeVisitors: 156
  },
  {
    id: 't3',
    title: 'Loch Ness Global Expedition',
    description: 'Explore the mystical shores of Loch Ness. Use the AR scanner to detect "anomalies" in the water and uncover the history of the Loch Ness Monster.',
    location: { lat: 57.3229, lng: -4.4244 },
    price: 12.00,
    currency: 'GBP',
    difficulty: 'Easy',
    durationMinutes: 60,
    distanceKm: 2.0,
    imageUrl: 'https://www.visitscotland.com/binaries/content/gallery/visitscotland/cms-images/2022/12/21/urquhart-castle',
    panoramaUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/51/LochNessUrquhart.jpg',
    tags: ['Mythology', 'Premium', 'International'],
    category: TrailCategory.COASTAL,
    checkpoints: [
      { id: 'c5', name: 'Urquhart Castle View', description: 'Best vantage point for detecting deep-water disturbances.', location: { lat: 57.3240, lng: -4.4420 }, hasReward: false }
    ],
    popularityScore: 99,
    activeVisitors: 312,
    trending: true
  },
  {
    id: 't4',
    title: 'Eilean Donan Castle AR',
    description: 'Experience one of Scotland\'s most iconic castles in high definition AR. Walk through its history on the shores of Kyle of Lochalsh.',
    location: { lat: 57.2739, lng: -5.5161 },
    price: 9.99,
    currency: 'GBP',
    difficulty: 'Easy',
    durationMinutes: 45,
    distanceKm: 0.8,
    imageUrl: 'https://d1km7u9ubck4j.cloudfront.net/production-upgrade-2024/8e047e51a0262a54c2dffb2274683c07/conversions/64268daf2cea7-HD.jpg',
    panoramaUrl: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/25/54/79/9d/caption.jpg?w=1200&h=-1&s=1',
    tags: ['Castle', 'Premium', 'HD'],
    category: TrailCategory.HISTORICAL,
    checkpoints: [],
    popularityScore: 92,
    activeVisitors: 64
  },
  {
    id: 't5',
    title: 'Glencoe Valley Legends',
    description: 'Walk through the dramatic landscapes of Glencoe. AR overlays reveal the clan conflicts and cinematic history of the glen.',
    location: { lat: 56.6826, lng: -5.1023 },
    price: 5.00,
    currency: 'GBP',
    difficulty: 'Moderate',
    durationMinutes: 120,
    distanceKm: 5.5,
    imageUrl: 'https://kittiaroundtheworld.com/wp-content/uploads/2021/09/Loch-Achtriochtan-2-1024x768.jpg',
    panoramaUrl: 'https://images.squarespace-cdn.com/content/v1/5efb46cf46fb3d2f36091afa/89f7d8b1-2190-4ce9-9d4b-e26e0b290c1e/Glencoe+white+house+Scotland.jpg',
    category: TrailCategory.MOUNTAIN,
    tags: ['History', 'Nature'],
    checkpoints: [],
    popularityScore: 94,
    activeVisitors: 112,
    trending: true
  },
  {
    id: 't6',
    title: 'Ben Nevis Summit Quest',
    description: 'Conquer Britain\'s highest peak. Use AR to identify distant peaks and learn about the local mountain rescue history.',
    location: { lat: 56.7969, lng: -5.0036 },
    price: 15.00,
    currency: 'GBP',
    difficulty: 'Hard',
    durationMinutes: 360,
    distanceKm: 17.0,
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    panoramaUrl: 'https://images.unsplash.com/photo-1598048145816-435003666d3a?auto=format&fit=crop&w=2000&q=80',
    category: TrailCategory.MOUNTAIN,
    tags: ['Adventure', 'Premium'],
    checkpoints: [],
    popularityScore: 87,
    activeVisitors: 45
  },
  {
    id: 't7',
    title: 'Old Man of Storr AR',
    description: 'Explore the otherworldly basalt pinnacles on the Isle of Skye. AR markers explain the volcanic origins of this unique landscape.',
    location: { lat: 57.5074, lng: -6.1754 },
    price: 7.99,
    currency: 'GBP',
    difficulty: 'Moderate',
    durationMinutes: 150,
    distanceKm: 3.8,
    imageUrl: 'https://www.visitscotland.com/wsimgs/visitscotland_33972782806-min_1007785955.jpg',
    panoramaUrl: 'https://1.bp.blogspot.com/-rkyQHnKwZog/X2Ta0XFwe4I/AAAAAAAAIxk/lHdHxFL_7-gGUAKw7Rw7fQ3tDZpP5IzRACLcBGAsYHQ/s2000/7-best-view-route-old-man-of-storr-walk-route-map-skye-hike-time-wanderung-store.png',
    category: TrailCategory.MOUNTAIN,
    tags: ['Nature', 'Skye'],
    checkpoints: [],
    popularityScore: 96,
    activeVisitors: 210,
    trending: true
  },
  {
    id: 't8',
    title: 'Cairngorms Wildlife Safari',
    description: 'Track the local wildlife in the Cairngorms National Park using augmented scanners. Detect red deer and rare golden eagles.',
    location: { lat: 57.0768, lng: -3.6198 },
    price: 0,
    currency: 'GBP',
    difficulty: 'Easy',
    durationMinutes: 180,
    distanceKm: 8.0,
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    panoramaUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2000&q=80',
    category: TrailCategory.FOREST,
    tags: ['Wildlife', 'Family'],
    checkpoints: [],
    popularityScore: 82,
    activeVisitors: 34
  },
  {
    id: 't9',
    title: 'Glasgow Street Art Odyssey',
    description: 'Find the famous murals of Glasgow with AR time-lapses showing the transformation of urban spaces into art galleries.',
    location: { lat: 55.8642, lng: -4.2518 },
    price: 0,
    currency: 'GBP',
    difficulty: 'Easy',
    durationMinutes: 100,
    distanceKm: 3.2,
    imageUrl: 'https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/197E/production/_92162560_mediaitem92162558.jpg',
    panoramaUrl: 'https://i2-prod.glasgowlive.co.uk/article16956729.ece/ALTERNATES/s1200d/0_SWG3-Yardworks-Arches_5.jpg',
    category: TrailCategory.URBAN,
    tags: ['Art', 'City'],
    checkpoints: [],
    popularityScore: 89,
    activeVisitors: 88
  }
];

const PURCHASE_KEY = 'scotlens_purchases';
const BOOKING_KEY = 'scotlens_bookings';

const getPurchasedTrails = (): string[] => {
  const stored = localStorage.getItem(PURCHASE_KEY);
  return stored ? JSON.parse(stored) : [];
};

const getStoredBookings = (): UserBooking[] => {
  const stored = localStorage.getItem(BOOKING_KEY);
  return stored ? JSON.parse(stored) : [];
};

const MOCK_ACCOMMODATIONS: Accommodation[] = [
  {
    id: 'acc1',
    trailId: 't1',
    name: 'Royal Mile Luxury Loft',
    type: 'Airbnb',
    rating: 9.8,
    reviewCount: 450,
    pricePerNight: 120,
    currency: 'GBP',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    amenities: ['Wifi', 'Kitchen'],
    distanceToTrailKm: 0.1,
    tags: ['Superhost'],
  },
  {
    id: 'acc2',
    trailId: 't3',
    name: 'Loch Ness View Lodge',
    type: 'Hotel',
    rating: 9.5,
    reviewCount: 120,
    pricePerNight: 210,
    currency: 'GBP',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    amenities: ['Breakfast', 'Spa'],
    distanceToTrailKm: 1.2,
    tags: ['Boutique'],
  }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockDataService = {
  getTrails: async (): Promise<Trail[]> => {
    await delay(600);
    return MOCK_TRAILS;
  },
  
  getTrailById: async (id: string): Promise<Trail | undefined> => {
    await delay(400);
    return MOCK_TRAILS.find(t => t.id === id);
  },

  isTrailPurchased: async (id: string): Promise<boolean> => {
    const trail = MOCK_TRAILS.find(t => t.id === id);
    if (!trail || trail.price === 0) return true;
    return getPurchasedTrails().includes(id);
  },

  purchaseTrail: async (id: string): Promise<void> => {
    await delay(1500);
    const current = getPurchasedTrails();
    if (!current.includes(id)) {
      localStorage.setItem(PURCHASE_KEY, JSON.stringify([...current, id]));
    }
  },

  createBooking: async (accommodation: Accommodation): Promise<void> => {
    await delay(2000);
    const newBooking: UserBooking = {
      id: `ub_${Math.random().toString(36).substring(7)}`,
      accommodationId: accommodation.id,
      accommodationName: accommodation.name,
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date(Date.now() + 172800000).toISOString().split('T')[0],
      priceTotal: accommodation.pricePerNight * 2,
      status: 'CONFIRMED',
      imageUrl: accommodation.imageUrl
    };
    const current = getStoredBookings();
    localStorage.setItem(BOOKING_KEY, JSON.stringify([newBooking, ...current]));
  },

  getAccommodationsByTrailId: async (trailId: string): Promise<Accommodation[]> => {
    await delay(500);
    return MOCK_ACCOMMODATIONS;
  },

  addGalleryImage: async (trailId: string, imageUrl: string): Promise<void> => {
    await delay(300);
    MOCK_TRAILS = MOCK_TRAILS.map(t => {
      if (t.id === trailId) {
        return {
          ...t,
          galleryImages: [imageUrl, ...(t.galleryImages || [])]
        };
      }
      return t;
    });
  },

  getUserActivities: async (): Promise<UserActivity[]> => {
    await delay(700);
    const purchased = getPurchasedTrails();
    return purchased.map(pid => {
      const trail = MOCK_TRAILS.find(t => t.id === pid);
      return {
        id: `act_${pid}`,
        trailId: pid,
        trailTitle: trail?.title || 'Unknown Trail',
        status: 'IN_PROGRESS',
        progressPercent: Math.floor(Math.random() * 80),
        date: new Date().toISOString(),
        rewardsEarned: []
      };
    }) as UserActivity[];
  },

  getUserBookings: async (): Promise<UserBooking[]> => {
    await delay(700);
    return getStoredBookings();
  }
};
