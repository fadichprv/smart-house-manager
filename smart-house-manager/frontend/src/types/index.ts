export type UserRole = 'admin' | 'premium' | 'normal';
export type User = AppUser;

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  isActive: boolean;
  totalDonations: number;
  createdAt: any;
}

export type RoomType = 'living_room' | 'study' | 'kitchen' | 'gym' | 'laundry' | 'common' | 'bedroom' | 'bathroom';

export interface Room {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  roomType: RoomType;
  amenities: string[];
  imageUrl?: string;
  isAvailable: boolean;
  floor: number;
  maxHoursNormal: number;
  maxHoursPremium: number;
  createdAt?: any;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  roomId: string;
  roomName: string;
  startTime: any;
  endTime: any;
  status: ReservationStatus;
  notes?: string;
  createdAt?: any;
}

export interface Donation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  createdAt?: any;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedId?: string;
  createdAt?: any;

}

export interface DonationLeaderboardEntry {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  totalDonations: number | string;
  donationCount?: number;
}

export interface AdminStats {
  users: {
    total: number;
    premium: number;
    admins: number;
  };
  rooms: {
    total: number;
    available: number;
  };
  reservations: {
    total: number;
    upcoming: number;
  };
  donations: {
    total_amount: number | string;
    this_month: number | string;
  };
  avatar_Url?: string;
}
