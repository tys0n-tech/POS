import { create } from 'zustand';
import { ToastMessage } from '../types';

interface ToastState {
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  showToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));

    const duration = toast.duration || 3000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, duration);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
}));
