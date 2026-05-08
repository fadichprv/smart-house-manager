import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, onSnapshot, serverTimestamp,
  Timestamp, writeBatch, increment, runTransaction,
  QueryConstraint, DocumentData
} from 'firebase/firestore';
import { db } from './firebase';

// ── Collection names ──────────────────────────────────────────
export const COLLECTIONS = {
  USERS: 'users',
  ROOMS: 'rooms',
  RESERVATIONS: 'reservations',
  DONATIONS: 'donations',
  NOTIFICATIONS: 'notifications',
};

// ── Business rules ────────────────────────────────────────────
export const RULES = {
  normal:  { maxPerDay: 1, maxPerWeek: 3,  maxHours: 4,  advanceDays: 3  },
  premium: { maxPerDay: 3, maxPerWeek: 10, maxHours: 8,  advanceDays: 14 },
  admin:   { maxPerDay: 99,maxPerWeek: 99, maxHours: 24, advanceDays: 365},
};

// ── Helpers ───────────────────────────────────────────────────
export const tsToDate = (ts: any): Date => {
  if (!ts) return new Date();
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts?.seconds) return new Date(ts.seconds * 1000);
  return new Date(ts);
};

// ── USERS ─────────────────────────────────────────────────────
export const getUser = async (uid: string) => {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const createUserDoc = async (uid: string, data: any) => {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), data).catch(async () => {
    const { setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, COLLECTIONS.USERS, uid), {
      ...data,
      role: 'normal',
      totalDonations: 0,
      isActive: true,
      createdAt: serverTimestamp(),
    });
  });
};

export const updateUserDoc = async (uid: string, data: any) => {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), data);
};

export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, COLLECTIONS.USERS));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ── ROOMS ─────────────────────────────────────────────────────
export const getRooms = async (filters?: { type?: string }) => {
  const constraints: QueryConstraint[] = [orderBy('name')];
  if (filters?.type) constraints.unshift(where('roomType', '==', filters.type));
  const snap = await getDocs(query(collection(db, COLLECTIONS.ROOMS), ...constraints));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getRoom = async (id: string) => {
  const snap = await getDoc(doc(db, COLLECTIONS.ROOMS, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const createRoom = async (data: any) => {
  return addDoc(collection(db, COLLECTIONS.ROOMS), { ...data, createdAt: serverTimestamp() });
};

export const updateRoom = async (id: string, data: any) => {
  await updateDoc(doc(db, COLLECTIONS.ROOMS, id), data);
};

export const deleteRoom = async (id: string) => {
  await deleteDoc(doc(db, COLLECTIONS.ROOMS, id));
};

export const seedRooms = async () => {
  const snap = await getDocs(collection(db, COLLECTIONS.ROOMS));
  if (snap.size > 0) return;
  const rooms = [
    { name: 'Main Living Room', description: 'Spacious living room with TV and comfortable sofas.', capacity: 8, roomType: 'living_room', amenities: ['TV', 'Sofa', 'AC', 'WiFi'], floor: 1, isAvailable: true, maxHoursNormal: 4, maxHoursPremium: 8 },
    { name: 'Study Room A', description: 'Quiet study room with desks and fast WiFi.', capacity: 4, roomType: 'study', amenities: ['Desks', 'WiFi', 'Whiteboard', 'Printer'], floor: 2, isAvailable: true, maxHoursNormal: 3, maxHoursPremium: 6 },
    { name: 'Kitchen & Dining', description: 'Fully equipped kitchen with dining area.', capacity: 6, roomType: 'kitchen', amenities: ['Oven', 'Microwave', 'Fridge', 'Coffee Machine'], floor: 1, isAvailable: true, maxHoursNormal: 2, maxHoursPremium: 4 },
    { name: 'Gym Room', description: 'Well-equipped gym with cardio and weights.', capacity: 3, roomType: 'gym', amenities: ['Treadmill', 'Weights', 'Yoga Mats'], floor: 0, isAvailable: true, maxHoursNormal: 2, maxHoursPremium: 3 },
    { name: 'Laundry Room', description: 'Washing machines and dryers.', capacity: 2, roomType: 'laundry', amenities: ['Washing Machine', 'Dryer', 'Iron'], floor: 0, isAvailable: true, maxHoursNormal: 2, maxHoursPremium: 2 },
    { name: 'Rooftop Terrace', description: 'Beautiful rooftop with city views and BBQ.', capacity: 10, roomType: 'common', amenities: ['BBQ Grill', 'Outdoor Furniture', 'City View'], floor: 4, isAvailable: true, maxHoursNormal: 3, maxHoursPremium: 6 },
  ];
  const batch = writeBatch(db);
  rooms.forEach(r => batch.set(doc(collection(db, COLLECTIONS.ROOMS)), { ...r, createdAt: serverTimestamp() }));
  await batch.commit();
};

// ── RESERVATIONS ──────────────────────────────────────────────
export const getMyReservations = async (userId: string) => {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.RESERVATIONS),
      where('userId', '==', userId),
      orderBy('startTime', 'desc'),
      limit(50)
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getAllReservations = async () => {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.RESERVATIONS), orderBy('startTime', 'desc'), limit(100))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getCalendarReservations = async (year: number, month: number) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.RESERVATIONS),
      where('startTime', '>=', Timestamp.fromDate(start)),
      where('startTime', '<=', Timestamp.fromDate(end)),
      where('status', 'in', ['confirmed', 'pending'])
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const checkConflict = async (roomId: string, startTime: Date, endTime: Date, excludeId?: string) => {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.RESERVATIONS),
      where('roomId', '==', roomId),
      where('status', 'in', ['confirmed', 'pending']),
      where('endTime', '>', Timestamp.fromDate(startTime))
    )
  );
  return snap.docs.some(d => {
    if (excludeId && d.id === excludeId) return false;
    const data = d.data();
    const resStart = tsToDate(data.startTime);
    return resStart < endTime;
  });
};

export const getUserDailyCount = async (userId: string, date: Date) => {
  const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.RESERVATIONS),
      where('userId', '==', userId),
      where('status', 'in', ['confirmed', 'pending']),
      where('startTime', '>=', Timestamp.fromDate(dayStart)),
      where('startTime', '<=', Timestamp.fromDate(dayEnd))
    )
  );
  return snap.size;
};

export const getUserWeeklyCount = async (userId: string, date: Date) => {
  const d = new Date(date);
  const weekStart = new Date(d); weekStart.setDate(d.getDate() - d.getDay()); weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6); weekEnd.setHours(23, 59, 59, 999);
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.RESERVATIONS),
      where('userId', '==', userId),
      where('status', 'in', ['confirmed', 'pending']),
      where('startTime', '>=', Timestamp.fromDate(weekStart)),
      where('startTime', '<=', Timestamp.fromDate(weekEnd))
    )
  );
  return snap.size;
};

export const createReservation = async (data: {
  userId: string; userRole: string; userName: string;
  roomId: string; roomName: string;
  startTime: Date; endTime: Date; notes?: string;
}) => {
  const rules = RULES[data.userRole as keyof typeof RULES] || RULES.normal;
  const now = new Date();

  if (data.startTime < now) throw new Error('Cannot book in the past.');

  const durationHours = (data.endTime.getTime() - data.startTime.getTime()) / 3600000;
  if (durationHours <= 0) throw new Error('End time must be after start time.');
  if (durationHours > rules.maxHours) throw new Error(`Max duration is ${rules.maxHours} hours for your account type.`);

  const advanceDays = (data.startTime.getTime() - now.getTime()) / 86400000;
  if (advanceDays > rules.advanceDays) throw new Error(`You can only book up to ${rules.advanceDays} days in advance.`);

  const dailyCount = await getUserDailyCount(data.userId, data.startTime);
  if (dailyCount >= rules.maxPerDay) throw new Error(`Daily limit reached (${rules.maxPerDay}/day for your account).`);

  const weeklyCount = await getUserWeeklyCount(data.userId, data.startTime);
  if (weeklyCount >= rules.maxPerWeek) throw new Error(`Weekly limit reached (${rules.maxPerWeek}/week for your account).`);

  const conflict = await checkConflict(data.roomId, data.startTime, data.endTime);
  if (conflict) throw new Error('This time slot is already booked. Please choose another time.');

  const ref = await addDoc(collection(db, COLLECTIONS.RESERVATIONS), {
    userId: data.userId,
    userName: data.userName,
    userRole: data.userRole,
    roomId: data.roomId,
    roomName: data.roomName,
    startTime: Timestamp.fromDate(data.startTime),
    endTime: Timestamp.fromDate(data.endTime),
    notes: data.notes || '',
    status: 'confirmed',
    createdAt: serverTimestamp(),
  });

  await createNotification(data.userId, {
    title: 'Reservation Confirmed ✅',
    message: `Your booking for ${data.roomName} on ${data.startTime.toLocaleDateString()} at ${data.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} is confirmed.`,
    type: 'success',
    relatedId: ref.id,
  });

  return ref;
};

export const cancelReservation = async (id: string, userId: string, isAdmin = false) => {
  const snap = await getDoc(doc(db, COLLECTIONS.RESERVATIONS, id));
  if (!snap.exists()) throw new Error('Reservation not found.');
  const data = snap.data();
  if (!isAdmin && data.userId !== userId) throw new Error('Not authorized.');
  if (data.status === 'cancelled') throw new Error('Already cancelled.');
  await updateDoc(doc(db, COLLECTIONS.RESERVATIONS, id), { status: 'cancelled' });
  await createNotification(data.userId, {
    title: 'Reservation Cancelled',
    message: `Your booking for ${data.roomName} has been cancelled.`,
    type: 'warning',
    relatedId: id,
  });
};

// ── DONATIONS ─────────────────────────────────────────────────
export const createDonation = async (data: {
  userId: string; userName: string; userAvatar?: string;
  amount: number; message?: string; isAnonymous?: boolean;
}) => {
  const ref = await addDoc(collection(db, COLLECTIONS.DONATIONS), {
    ...data,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, COLLECTIONS.USERS, data.userId), {
    totalDonations: increment(data.amount),
    role: 'premium',
  });
  await createNotification(data.userId, {
    title: 'Thank you for your donation! 💝',
    message: `Your donation of $${data.amount.toFixed(2)} has been received. You now have Premium status!`,
    type: 'success',
    relatedId: ref.id,
  });
  return ref;
};

export const getDonations = async (limitCount = 50) => {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.DONATIONS), orderBy('createdAt', 'desc'), limit(limitCount))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getLeaderboard = async () => {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.USERS),
      where('totalDonations', '>', 0),
      orderBy('totalDonations', 'desc'),
      limit(10)
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getMonthlyDonationTotal = async () => {
  const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.DONATIONS),
      where('createdAt', '>=', Timestamp.fromDate(start))
    )
  );
  return snap.docs.reduce((sum, d) => sum + (d.data().amount || 0), 0);
};

// ── NOTIFICATIONS ─────────────────────────────────────────────
export const createNotification = async (userId: string, data: {
  title: string; message: string; type: string; relatedId?: string;
}) => {
  await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
    userId,
    ...data,
    isRead: false,
    createdAt: serverTimestamp(),
  });
};

export const getMyNotifications = async (userId: string) => {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const markNotificationRead = async (id: string) => {
  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id), { isRead: true });
};

export const markAllNotificationsRead = async (userId: string) => {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      where('isRead', '==', false)
    )
  );
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.update(d.ref, { isRead: true }));
  await batch.commit();
};

export const subscribeToNotifications = (userId: string, callback: (notifs: any[]) => void) => {
  return onSnapshot(
    query(collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    ),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
};

export const subscribeToRooms = (callback: (rooms: any[]) => void) => {
  return onSnapshot(
    query(collection(db, COLLECTIONS.ROOMS), orderBy('name')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
};

export const subscribeToReservations = (callback: (res: any[]) => void) => {
  return onSnapshot(
    query(collection(db, COLLECTIONS.RESERVATIONS),
      where('status', 'in', ['confirmed', 'pending']),
      orderBy('startTime', 'desc'),
      limit(100)
    ),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
};

export { serverTimestamp, Timestamp };
