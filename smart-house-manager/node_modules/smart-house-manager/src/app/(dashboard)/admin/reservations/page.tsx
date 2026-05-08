'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function AdminReservationsPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin'); }, []);
  return null;
}
