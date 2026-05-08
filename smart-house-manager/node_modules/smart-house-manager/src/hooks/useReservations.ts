import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '@/lib/api';
import { Reservation } from '@/types';
import toast from 'react-hot-toast';

export const useMyReservations = (params?: { status?: string; upcoming?: boolean }) => {
  return useQuery({
    queryKey: ['my-reservations', params],
    queryFn: async () => {
      const response = await reservationsApi.getMy(params);
      return response.data.reservations as Reservation[];
    },
  });
};

export const useAllReservations = (params?: any) => {
  return useQuery({
    queryKey: ['all-reservations', params],
    queryFn: async () => {
      const response = await reservationsApi.getAll(params);
      return response.data.reservations as Reservation[];
    },
  });
};

export const useCalendarReservations = (month?: number, year?: number) => {
  return useQuery({
    queryKey: ['calendar-reservations', month, year],
    queryFn: async () => {
      const response = await reservationsApi.getCalendar(month, year);
      return response.data.reservations as Reservation[];
    },
  });
};

export const useCreateReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { room_id: string; start_time: string; end_time: string; notes?: string }) =>
      reservationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-reservations'] });
      toast.success('Reservation confirmed!');
    },
  });
};

export const useCancelReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reservationsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['all-reservations'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-reservations'] });
      toast.success('Reservation cancelled.');
    },
  });
};

export const useUpdateReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => reservationsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] });
      toast.success('Reservation updated!');
    },
  });
};
