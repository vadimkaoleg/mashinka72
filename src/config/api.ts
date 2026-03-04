// src/config/api.ts
// Замени на свой Render URL после деплоя
const RENDER_URL = 'https://avtomashinka-backend.onrender.com';

const isProduction = window.location.hostname !== 'localhost';
// Убираем слэши на конце, чтобы избежать двойного слэша
const RENDER_API = RENDER_URL.replace(/\/$/, '');
const API_BASE = isProduction ? `${RENDER_API}/api` : 'http://localhost:3001';

export const API_CONFIG = {
  baseUrl: API_BASE,
  timeout: 30000,
};

export type DocumentType = {
  id: number;
  title: string;
  description: string;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  downloadUrl: string;
  fileUrl?: string;  // Прямая ссылка на файл (webnames)
  section_id?: number | null;
  subsection_id?: number | null;
  section_name?: string | null;
  subsection_name?: string | null;
  is_visible: boolean;
  created_at: string;
};

export type SectionType = {
  id: number;
  name: string;
  sort_order: number;
  is_visible: boolean;
  subsections: SubsectionType[];
};

export type SubsectionType = {
  id: number;
  section_id: number;
  name: string;
  sort_order: number;
  is_visible: boolean;
};

class ApiService {
  private baseUrl: string;
  public token: string | null = null;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<{
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }> {
    const url = `${this.baseUrl}/${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Добавляем Authorization если есть токен
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Добавляем остальные заголовки из options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      // Проверяем, есть ли контент для парсинга
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else if (response.status === 204) {
        data = null;
      } else {
        throw new Error(`Unexpected content type: ${contentType}`);
      }

      if (!response.ok) {
        return {
          success: false,
          error: data?.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
        message: data?.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Авторизация
  async login(username: string, password: string) {
    const result = await this.request<{
      token: string;
      username: string;
      expiresIn: string;
    }>('login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (result.success && result.data?.token) {
      this.token = result.data.token;
      localStorage.setItem('authToken', result.data.token);
    }

    return result;
  }

  // Проверка токена (упрощенная версия для PHP)
  async verifyToken() {
    if (!this.token) {
      return { success: false, error: 'No token' };
    }

    try {
      // Для PHP JWT - просто проверяем формат
      const parts = this.token.split('.');
      if (parts.length !== 3) {
        return { success: false, error: 'Invalid token format' };
      }

      // Пытаемся декодировать payload
      try {
        const payload = JSON.parse(atob(parts[1]));
        const isValid = payload.exp * 1000 > Date.now();
        
        return {
          success: isValid,
          valid: isValid,
          user: isValid ? { 
            id: payload.id, 
            username: payload.username 
          } : null,
        };
      } catch {
        // Если не удалось декодировать, считаем токен невалидным
        return { success: false, error: 'Invalid token payload' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid token' 
      };
    }
  }

  // Получение документов (публичных)
  async getDocuments() {
    return this.request<DocumentType[]>('documents', {
      method: 'GET',
    });
  }

  // Получение документов (для админа)
  async getAdminDocuments() {
    return this.request<DocumentType[]>('admin/documents', {
      method: 'GET',
    });
  }

  // Получение разделов (публичных)
  async getSections() {
    return this.request<SectionType[]>('sections', {
      method: 'GET',
    });
  }

  // Получение разделов (для админа)
  async getAdminSections() {
    return this.request<SectionType[]>('admin/sections', {
      method: 'GET',
    });
  }

  // Загрузка документа
  async uploadDocument(formData: FormData) {
    // Для FormData не добавляем Content-Type, браузер сам установит
    const headers: Record<string, string> = {};
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}/admin/documents`, {
      method: 'POST',
      headers,
      body: formData,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = { error: 'Failed to parse response' };
    }

    return {
      success: response.ok,
      data,
      error: data?.error,
    };
  }

  // Обновление документа
  async updateDocument(id: number, updates: { 
    title?: string; 
    description?: string; 
    is_visible?: boolean;
    section_id?: number | null;
    subsection_id?: number | null;
  }) {
    return this.request(`admin/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Удаление документа
  async deleteDocument(id: number) {
    return this.request(`admin/documents/${id}`, {
      method: 'DELETE',
    });
  }

  // Скачивание файла
  async downloadFile(filename: string, originalName: string) {
    const headers: Record<string, string> = {};
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return fetch(`${this.baseUrl}/download/${filename}`, {
      method: 'GET',
      headers,
    });
  }

  // Выход
  logout() {
    this.token = null;
    localStorage.removeItem('authToken');
  }
}

export const api = new ApiService();