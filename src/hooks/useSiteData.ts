// src/hooks/useSiteData.ts
// Хук для загрузки данных с fallback на FTP

import { useState, useEffect, useCallback } from 'react';
import { 
  loadSiteData, 
  getBlocksFromData, 
  getDocumentsFromData, 
  getSectionsFromData,
  clearDataCache,
  SiteData,
  Block,
  DocumentType,
  SectionType
} from '../lib/data-loader';

interface UseSiteDataReturn {
  blocks: Block[];
  documents: DocumentType[];
  sections: SectionType[];
  loading: boolean;
  error: string | null;
  dataSource: 'api' | 'ftp' | 'cache' | 'none';
  refresh: () => Promise<void>;
  clearCache: () => void;
}

export function useSiteData(): UseSiteDataReturn {
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'api' | 'ftp' | 'cache' | 'none'>('none');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Пробуем загрузить сначала с API, потом с FTP, потом из кэша
      const data = await loadSiteData();
      
      if (data) {
        setSiteData(data);
        
        // Определяем источник данных
        // Это можно улучшить добавив timestamp в site-data.json
        if (data.version) {
          // Данные загружены (неважно откуда)
          setDataSource('api'); // Упрощенно считаем что с API
        }
      } else {
        setError('Не удалось загрузить данные');
        setDataSource('none');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
      setDataSource('none');
    } finally {
      setLoading(false);
    }
  }, []);

  // Загружаем данные при монтировании
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Функция обновления данных
  const refresh = useCallback(async () => {
    clearDataCache(); // Очищаем кэш перед обновлением
    await loadData();
  }, [loadData]);

  // Функция очистки кэша
  const clearCache = useCallback(() => {
    clearDataCache();
  }, []);

  return {
    blocks: getBlocksFromData(siteData),
    documents: getDocumentsFromData(siteData),
    sections: getSectionsFromData(siteData),
    loading,
    error,
    dataSource,
    refresh,
    clearCache
  };
}
