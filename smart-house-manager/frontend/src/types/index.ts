export type UserRole = 'admin' | 'premium' | 'normal';

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
