import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_CONFIG } from '../config/api';
import { loadSiteData, getBlocksFromData, clearDataCache } from '../lib/data-loader';

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
}

interface BlocksContextType {
  blocks: Block[];
  loading: boolean;
  error: string | null;
  refreshBlocks: () => Promise<void>;
  getBlock: (name: string) => Block | undefined;
  dataSource: 'api' | 'ftp' | 'cache' | 'none';
}

const BlocksContext = createContext<BlocksContextType | undefined>(undefined);

export function BlocksProvider({ children }: { children: ReactNode }) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'api' | 'ftp' | 'cache' | 'none'>('none');

  // Попытка загрузки с FTP (основной) с fallback на API
  const fetchBlocks = async (useFallback = true) => {
    // 1. Пробуем загрузить с FTP (основной источник)
    try {
      const siteData = await loadSiteData();
      
      if (siteData) {
        const ftpBlocks = getBlocksFromData(siteData);
        setBlocks(ftpBlocks);
        setError(null);
        setDataSource('ftp');
        return;
      }
    } catch (ftpError) {
      // FTP недоступен
    }

    // 2. Если FTP недоступен - пробуем API
    if (useFallback) {
      try {
        const response = await fetch(`${API_CONFIG.baseUrl}/blocks`, {
          signal: AbortSignal.timeout(5000) // 5 секунд таймаут
        });
        
        if (response.ok) {
          const data = await response.json();
          setBlocks(data);
          setError(null);
          setDataSource('api');
          return;
        }
      } catch (apiError) {
        // API недоступен
      }
    }

    // 3. Если ничего не работает - используем пустой массив
    setError('Сервис временно недоступен. Данные загрузить не удалось.');
    setDataSource('none');
  };

  // Загружаем блоки при монтировании
  useEffect(() => {
    const loadBlocks = async () => {
      setLoading(true);
      await fetchBlocks(true);
      setLoading(false);
    };
    loadBlocks();
  }, []);

  // Периодическое обновление каждые 10 секунд для отображения изменений из админки
  useEffect(() => {
    const interval = setInterval(() => {
      // Не используем fallback при автообновлении - только API
      fetchBlocks(false);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getBlock = (name: string) => blocks.find(b => b.name === name);

  // Функция принудительного обновления с очисткой кэша
  const refreshBlocks = async () => {
    clearDataCache();
    await fetchBlocks(true);
  };

  return (
    <BlocksContext.Provider value={{ blocks, loading, error, refreshBlocks, getBlock, dataSource }}>
      {children}
    </BlocksContext.Provider>
  );
}

export function useBlocks() {
  const context = useContext(BlocksContext);
  if (!context) {
    throw new Error('useBlocks must be used within BlocksProvider');
  }
  return context;
}
