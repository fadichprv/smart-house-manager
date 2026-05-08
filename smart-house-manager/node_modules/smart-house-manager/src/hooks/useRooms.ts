import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '@/lib/api';
import { Room } from '@/types';
import toast from 'react-hot-toast';

export const useRooms = (params?: { type?: string; available?: boolean }) => {
  return useQuery({
    queryKey: ['rooms', params],
    queryFn: async () => {
      const response = await roomsApi.getAll(params);
      return response.data.rooms as Room[];
    },
    staleTime: 30000,
  });
};

export const useRoom = (id: string) => {
  return useQuery({
    queryKey: ['room', id],
    queryFn: async () => {
      const response = await roomsApi.getById(id);
      return response.data as { room: Room; upcoming_reservations: any[] };
    },
    enabled: !!id,
  });
};

export const useRoomAvailability = (id: string, date?: string) => {
  return useQuery({
    queryKey: ['room-availability', id, date],
    queryFn: async () => {
      const response = await roomsApi.getAvailability(id, date);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => roomsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room created successfully!');
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => roomsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room updated successfully!');
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roomsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast.success('Room deleted.');
    },
  });
};
