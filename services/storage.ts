
import { MemoryEvent, User } from '../types';
import { fetchWithAuth, API_URL } from './api';

export const storageService = {
  // --- Auth Methods ---

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const user = await fetchWithAuth('/auth/me');
      return { ...user, id: user._id }; // Map _id to id
    } catch (e) {
      return null;
    }
  },

  register: async (name: string, email: string, password: string): Promise<User> => {
    const res = await fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    return { ...res.user, id: res.user.id };
  },

  login: async (email: string, password: string): Promise<User> => {
    const res = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return { ...res.user, id: res.user.id };
  },

  logout: async () => {
    await fetchWithAuth('/auth/logout', { method: 'POST' });
  },

  // --- Event Methods ---

  getEvents: async (userId: string): Promise<MemoryEvent[]> => {
    // Note: userId param unused in backend route '/my-events' as it uses session cookie
    const events = await fetchWithAuth('/my-events');
    return events.map((e: any) => {
      // Normalize photos with default dimensions if missing
      if (e.photos && Array.isArray(e.photos)) {
        e.photos = e.photos.map((photo: any) => ({
          ...photo,
          width: photo.width || 1000,
          height: photo.height || 750,
          aspectRatio: photo.aspectRatio || (photo.width && photo.height ? photo.width / photo.height : 4 / 3)
        }));
      }
      return { ...e, id: e._id };
    });
  },

  getEventById: async (id: string): Promise<MemoryEvent | null> => {
    if (id === 'demo') return null; // Demo legacy handling
    try {
      const res = await fetch(`${API_URL}/events/${id}`);
      if (!res.ok) return null;
      const data = await res.json();
      
      // Ensure photos have proper dimensions
      const event = { ...data, id: data._id };
      if (event.photos && Array.isArray(event.photos)) {
        event.photos = event.photos.map((photo: any) => ({
          ...photo,
          width: photo.width || 1000,
          height: photo.height || 750,
          aspectRatio: photo.aspectRatio || (photo.width && photo.height ? photo.width / photo.height : 4 / 3)
        }));
      }
      
      return event;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  createEvent: async (event: MemoryEvent): Promise<string> => {
    const res = await fetchWithAuth('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
    return res._id || res.id;
  },

  updateEvent: async (id: string, event: Partial<MemoryEvent>): Promise<void> => {
    await fetchWithAuth(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  },

  deleteEvent: async (id: string): Promise<void> => {
    await fetchWithAuth(`/events/${id}`, {
      method: 'DELETE',
    });
  },

  incrementView: async (id: string): Promise<void> => {
    if(id === 'demo') return;
    // Fire and forget, but use full URL
    await fetch(`${API_URL}/events/${id}/view`, { method: 'POST' });
  },

  toggleLike: async (id: string): Promise<void> => {
    if(id === 'demo') return;
    // Fire and forget
    await fetch(`${API_URL}/events/${id}/like`, { method: 'POST' });
  },

  // --- Search ---
  searchEvents: async (query: string) => {
    const res = await fetchWithAuth(`/search?q=${encodeURIComponent(query)}`);
    return res.map((r: any) => ({ ...r, event: { ...r.event, id: r.event._id } }));
  }
};
