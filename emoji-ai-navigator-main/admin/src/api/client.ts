import axios from 'axios';
import { message } from 'antd';

const client = axios.create({
  baseURL: '/admin',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.detail || err.message || '请求失败';
    message.error(String(msg));
    return Promise.reject(err);
  }
);

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboard = () => client.get('/dashboard');

// ── Categories ────────────────────────────────────────────────────────────────
export const getCategories = () => client.get('/categories');
export const createCategory = (data: any) => client.post('/categories', data);
export const updateCategory = (id: number, data: any) => client.put(`/categories/${id}`, data);
export const deleteCategory = (id: number) => client.delete(`/categories/${id}`);
export const updateCategorySort = (items: { id: number; sort_order: number }[]) =>
  client.patch('/categories/sort', items);

// ── Tools ─────────────────────────────────────────────────────────────────────
export const getTools = (params?: any) => client.get('/tools', { params });
export const createTool = (data: any) => client.post('/tools', data);
export const updateTool = (id: number, data: any) => client.put(`/tools/${id}`, data);
export const deleteTool = (id: number) => client.delete(`/tools/${id}`);
export const updateToolSort = (items: { id: number; sort_order: number }[]) =>
  client.patch('/tools/sort', items);
export const batchDeleteTools = (ids: number[]) => client.post('/tools/batch-delete', { ids });
export const batchMoveTools = (ids: number[], category_id: number) =>
  client.post('/tools/batch-move', { ids, category_id });

// ── Nav Sites ─────────────────────────────────────────────────────────────────
export const getNavSites = () => client.get('/nav-sites');
export const createNavSite = (data: any) => client.post('/nav-sites', data);
export const updateNavSite = (id: number, data: any) => client.put(`/nav-sites/${id}`, data);
export const deleteNavSite = (id: number) => client.delete(`/nav-sites/${id}`);
export const updateNavSiteSort = (items: { id: number; sort_order: number }[]) =>
  client.patch('/nav-sites/sort', items);

// ── Submissions ───────────────────────────────────────────────────────────────
export const getSubmissions = (params?: any) => client.get('/submissions', { params });
export const reviewSubmission = (id: number, data: { status: string; review_note?: string }) =>
  client.patch(`/submissions/${id}/review`, data);
export const deleteSubmission = (id: number) => client.delete(`/submissions/${id}`);

// ── Users ─────────────────────────────────────────────────────────────────────
export const getUsers = (params?: any) => client.get('/users', { params });
export const createUser = (data: any) => client.post('/users', data);
export const updateUser = (id: number, data: any) => client.put(`/users/${id}`, data);
export const deleteUser = (id: number) => client.delete(`/users/${id}`);

// ── Calendar ──────────────────────────────────────────────────────────────────
export const getCalendarEvents = (params?: any) => client.get('/calendar-events', { params });
export const createCalendarEvent = (data: any) => client.post('/calendar-events', data);
export const updateCalendarEvent = (id: number, data: any) => client.put(`/calendar-events/${id}`, data);
export const deleteCalendarEvent = (id: number) => client.delete(`/calendar-events/${id}`);

// ── Business ──────────────────────────────────────────────────────────────────
export const getBusinessInquiries = (params?: any) => client.get('/business-inquiries', { params });
export const updateInquiryStatus = (id: number, status: string) =>
  client.patch(`/business-inquiries/${id}/status`, null, { params: { status } });
export const deleteInquiry = (id: number) => client.delete(`/business-inquiries/${id}`);

// ── Recommended Tools ─────────────────────────────────────────────────────────
export const getRecommendedTools = () => client.get('/recommended-tools');
export const addRecommendedTool = (data: any) => client.post('/recommended-tools', data);
export const updateRecommendedTool = (id: number, data: any) => client.put(`/recommended-tools/${id}`, data);
export const removeRecommendedTool = (id: number) => client.delete(`/recommended-tools/${id}`);
export const updateRecommendedSort = (items: { id: number; sort_order: number }[]) =>
  client.patch('/recommended-tools/sort', items);

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadFile = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append('file', file);
  const res: any = await axios.post('/admin/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.url || '';
};
