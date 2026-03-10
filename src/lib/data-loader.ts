// src/lib/data-loader.ts
// Утилита для загрузки данных с fallback на FTP

import { API_CONFIG } from '../config/api';

export interface BlockItem {
  title?: string;
  description?: string;
  value?: string;
}

export interface Block {
  id: number;
  name: string;
  title: string;
  subtitle: string;
  content: string;
  button_text: string;
  button_link: string;
  image: string;
  items: BlockItem[] | null;
  is_visible: boolean;
  legal_info?: string;
  map_address?: string;
}

export interface DocumentType {
  id: number;
  title: string;
  description: string;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  downloadUrl: string;
  fileUrl?: string;
  section_id?: number | null;
  subsection_id?: number | null;
  section_name?: string | null;
  subsection_name?: string | null;
  is_visible: boolean;
  created_at: string;
}

export interface SectionType {
  id: number;
  name: string;
  sort_order: number;
  is_visible: boolean;
  subsections: SubsectionType[];
}

export interface SubsectionType {
  id: number;
  section_id: number;
  name: string;
  sort_order: number;
  is_visible: boolean;
}

export interface SiteData {
  version: string;
  timestamp: string;
  generated: string;
  blocks: Block[];
  documents: DocumentType[];
  sections: SectionType[];
}

// URL для доступа к данным на FTP (webnames)
// Файл site-data.json загружается на FTP сервером
const FTP_DATA_URL = 'https://avmashinka.ru/uploads/named/site-data.json';

// Ключ для хранения данных в localStorage
const CACHE_KEY = 'site-data-cache';
const CACHE_TIMESTAMP_KEY = 'site-data-timestamp';

// Время актуальности кэша (в миллисекундах)
// Увеличено до 24 часов - данные сохраняются надолго
const CACHE_VALID_TIME = 24 * 60 * 60 * 1000; // 24 часа

/**
 * Получить данные из локального кэша
 */
function getCachedData(): SiteData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cached || !timestamp) return null;
    
    // Проверяем актуальность кэша
    const cacheAge = Date.now() - parseInt(timestamp, 10);
    if (cacheAge > CACHE_VALID_TIME) {
      return null;
    }
    
    return JSON.parse(cached);
  } catch (error) {
    return null;
  }
}

/**
 * Сохранить данные в локальный кэш
 */
function setCachedData(data: SiteData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    // Игнорируем ошибки записи в кэш
  }
}

/**
 * Загрузить данные с API сервера
 */
async function fetchFromAPI(): Promise<SiteData | null> {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/alldata`, {
      signal: AbortSignal.timeout(10000) // 10 секунд таймаут
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
}

/**
 * Загрузить данные с FTP (webnames)
 */
async function fetchFromFTP(): Promise<SiteData | null> {
  try {
    const response = await fetch(FTP_DATA_URL, {
      signal: AbortSignal.timeout(15000) // 15 секунд таймаут для FTP
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
}

/**
 * Основная функция загрузки данных
 * Стратегия (FTP как основной источник):
 * 1. Пробуем FTP (webnames) - основной источник
 * 2. Если недоступен - пробуем API сервера
 * 3. Если недоступен - используем кэш
 * 4. Если ничего нет - возвращаем null
 */
export async function loadSiteData(): Promise<SiteData | null> {
  // 1. Пробуем FTP (основной источник - всегда доступен)
  let data = await fetchFromFTP();
  if (data) {
    setCachedData(data);
    return data;
  }
  
  // 2. Пробуем API (резерв)
  data = await fetchFromAPI();
  if (data) {
    setCachedData(data);
    return data;
  }
  
  // 3. Используем кэш
  const cached = getCachedData();
  if (cached) {
    return cached;
  }
  
  // 4. Ничего не найдено
  return null;
}

/**
 * Получить данные блоков из загруженных данных
 */
export function getBlocksFromData(data: SiteData | null): Block[] {
  if (!data || !data.blocks) return [];
  return data.blocks;
}

/**
 * Получить документы из загруженных данных
 * С дополнительной очисткой от дубликатов по filename
 */
export function getDocumentsFromData(data: SiteData | null): DocumentType[] {
  if (!data || !data.documents) return [];
  
  // Очищаем от дубликатов по filename (оставляем первый)
  const seen = new Set<string>();
  const uniqueDocs: DocumentType[] = [];
  
  for (const doc of data.documents) {
    if (!seen.has(doc.filename)) {
      seen.add(doc.filename);
      // Приводим is_visible к boolean (может прийти как число 1/0)
      const isVisible = doc.is_visible === true || doc.is_visible === 1 || doc.is_visible === '1';
      uniqueDocs.push({ ...doc, is_visible: isVisible });
    }
  }
  
  // Фильтруем только видимые документы
  return uniqueDocs.filter(doc => doc.is_visible === true || doc.is_visible === 1);
}

/**
 * Получить разделы из загруженных данных
 */
export function getSectionsFromData(data: SiteData | null): SectionType[] {
  if (!data || !data.sections) return [];
  // Приводим is_visible к boolean (может прийти как число 1/0)
  return data.sections
    .map(section => ({
      ...section,
      is_visible: section.is_visible === true || section.is_visible === 1 || section.is_visible === '1',
      subsections: section.subsections?.map(sub => ({
        ...sub,
        is_visible: sub.is_visible === true || sub.is_visible === 1 || sub.is_visible === '1'
      })) || []
    }))
    .filter(section => section.is_visible);
}

/**
 * Очистить кэш данных
 */
export function clearDataCache(): void {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
}
