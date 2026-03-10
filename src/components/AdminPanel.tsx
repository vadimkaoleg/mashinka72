import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import {
  Layout, 
  Save, 
  Upload, 
  Image as ImageIcon,
  LogOut,
  Loader2,
  AlertCircle,
  CheckCircle,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Trash2,
  Plus,
  X,
  Download,
  ChevronUp,
  ChevronDown,
  Check,
  Key,
  Search,
  Filter,
  Home,
  FilePlus,
  Layers,
  Clock,
  CheckSquare,
  Square,
  GripVertical,
  Folder,
  RefreshCw
} from 'lucide-react';
import { API_CONFIG } from '../config/api';

interface BlockItem {
  title?: string;
  description?: string;
  value?: string;
  price?: string;
}

interface Block {
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
}

interface Document {
  id: number;
  title: string;
  description: string;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  is_visible: boolean;
  created_at: string;
  section_id?: number | null;
}

interface Section {
  id: number;
  name: string;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
}

const BLOCK_LABELS: Record<string, string> = {
  hero: 'Главный баннер (Hero)',
  about: 'О нас',
  advantages: 'Преимущества',
  courses: 'Курсы',
  contact: 'Контакты',
  footer: 'Подвал (Footer)'
};

export function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'blocks' | 'documents' | 'sections' | 'settings'>('dashboard');

  // Смена пароля
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Поиск и фильтры документов
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [docStatusFilter, setDocStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);

  // Удаление документа
  const [deleteDocId, setDeleteDocId] = useState<number | null>(null);
  const [deleteDocTitle, setDeleteDocTitle] = useState('');

  // Предпросмотр блока
  const [previewBlock, setPreviewBlock] = useState<Block | null>(null);

  // Разделы документов (sections)
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  // Редактирование раздела
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [editingSectionName, setEditingSectionName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');

  // Drag and drop
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

// Редактирование названия документа
  const [editingDocId, setEditingDocId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  
  const [formData, setFormData] = useState<Partial<Block>>({});
  const [itemsData, setItemsData] = useState<BlockItem[]>([]);

  // Синхронизация с FTP
  const [syncingFtp, setSyncingFtp] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const syncWithFtp = async () => {
    setSyncingFtp(true);
    setSyncMessage(null);
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_CONFIG.baseUrl}/admin/sync-ftp`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.synced) {
          setSyncMessage({ type: 'success', text: `Данные обновлены с FTP! Документов: ${data.stats?.documents || 0}` });
          // Перезагружаем данные после синхронизации
          fetchDocuments();
          fetchBlocks();
        } else {
          setSyncMessage({ type: 'success', text: data.message || 'Нет новых данных на FTP' });
        }
      } else {
        setSyncMessage({ type: 'error', text: data.message || 'Ошибка синхронизации' });
      }
    } catch (err) {
      console.error('Ошибка синхронизации с FTP:', err);
      setSyncMessage({ type: 'error', text: 'Ошибка соединения с сервером' });
    } finally {
      setSyncingFtp(false);
      // Скрываем сообщение через 5 секунд
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  // Проверка токена при загрузке
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
      fetchBlocks();
      fetchDocuments();
      fetchSections();
    }
  }, []);

  const fetchBlocks = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }
      
      const response = await fetch(`${API_CONFIG.baseUrl}/admin/blocks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 401) {
        localStorage.removeItem('admin_token');
        setIsAuthenticated(false);
        return;
      }
      
      if (!response.ok) throw new Error('Не удалось загрузить блоки');
      
      const data = await response.json();
      setBlocks(data);
      if (data.length > 0 && !selectedBlock) {
        selectBlock(data[0]);
      }
    } catch (err) {
      console.error('Ошибка загрузки блоков:', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;
      
      // Сбрасываем документы перед загрузкой
      setDocuments([]);
      
      const response = await fetch(`${API_CONFIG.baseUrl}/admin/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Убираем дубликаты по id
        const uniqueData = data.filter((doc: Document, index: number, self: Document[]) => 
          index === self.findIndex((d: Document) => d.id === doc.id)
        );
        setDocuments(uniqueData);
      }
    } catch (err) {
      console.error('Ошибка загрузки документов:', err);
    }
  };

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const response = await fetch(`${API_CONFIG.baseUrl}/admin/sections`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSections(data);
      }
    } catch (err) {
      console.error('Ошибка загрузки разделов:', err);
    }
  };

  // Создание раздела
  const createSection = async (name: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_CONFIG.baseUrl}/admin/sections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      
      if (response.ok) {
        fetchSections();
        return true;
      }
    } catch (err) {
      console.error('Ошибка создания раздела:', err);
    }
    return false;
  };

  // Обновление раздела
  const updateSection = async (id: number, data: { name?: string; is_visible?: boolean; sort_order?: number }) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_CONFIG.baseUrl}/admin/sections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        fetchSections();
        return true;
      }
    } catch (err) {
      console.error('Ошибка обновления раздела:', err);
    }
    return false;
  };

  // Удаление раздела
  const deleteSection = async (id: number) => {
    if (!confirm('Удалить этот раздел? Все документы в нём станут без раздела.')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_CONFIG.baseUrl}/admin/sections/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchSections();
        fetchDocuments();
      }
    } catch (err) {
      console.error('Ошибка удаления раздела:', err);
    }
  };

  // Переключение видимости раздела
  const toggleSectionVisibility = async (section: Section) => {
    await updateSection(section.id, { is_visible: !section.is_visible });
  };

  // Начать редактирование раздела
  const startEditSection = (section: Section) => {
    setEditingSectionId(section.id);
    setEditingSectionName(section.name);
  };

  // Сохранить название раздела
  const saveSectionName = async () => {
    if (!editingSectionId) return;
    await updateSection(editingSectionId, { name: editingSectionName });
    setEditingSectionId(null);
    setEditingSectionName('');
  };

  // Новая вкладка - Разделы
  const [docsSubTab, setDocsSubTab] = useState<'documents' | 'sections'>('documents');

  const login = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        localStorage.setItem('admin_token', data.token);
        setIsAuthenticated(true);
        fetchBlocks();
        fetchDocuments();
        fetchSections();
      } else {
        setError(data.error || 'Неверные учетные данные');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setBlocks([]);
    setDocuments([]);
    setSelectedBlock(null);
    setUsername('');
    setPassword('');
  };

  const selectBlock = (block: Block) => {
    setSelectedBlock(block);
    setFormData({
      title: block.title,
      subtitle: block.subtitle,
      content: block.content,
      button_text: block.button_text,
      button_link: block.button_link,
      image: block.image,
      is_visible: block.is_visible
    });
    setItemsData(block.items || []);
    setSaveSuccess(false);
    setHasUnsavedChanges(false);
  };

  const handleSave = async (showNotification = true) => {
    if (!selectedBlock) return;
    
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_CONFIG.baseUrl}/admin/blocks/${selectedBlock.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, items: itemsData })
      });
      
      if (!response.ok) throw new Error('Не удалось сохранить блок');
      
      if (showNotification) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      fetchBlocks();
      setSelectedBlock(prev => prev ? { ...prev, ...formData, items: itemsData } : null);
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setError('Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  };

  // Автосохранение каждые 30 секунд
  useEffect(() => {
    if (!autoSaveEnabled || !selectedBlock || !hasUnsavedChanges) return;

    const autoSaveTimer = setInterval(() => {
      if (hasUnsavedChanges) {
        setAutoSaving(true);
        handleSave(false).finally(() => setAutoSaving(false));
      }
    }, 30000); // 30 секунд

    return () => clearInterval(autoSaveTimer);
  }, [autoSaveEnabled, selectedBlock, hasUnsavedChanges, formData, itemsData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formDataImg = new FormData();
    formDataImg.append('image', file);
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_CONFIG.baseUrl}/admin/blocks/upload-image`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataImg
      });
      
      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, image: data.url }));
      }
    } catch (err) {
      console.error('Ошибка загрузки изображения:', err);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const formDataDoc = new FormData();
    formDataDoc.append('file', file);
    formDataDoc.append('title', file.name.replace(/\.[^/.]+$/, ''));
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_CONFIG.baseUrl}/admin/documents`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataDoc
      });
      
      if (response.ok) {
        // Не вызываем fetchDocuments сразу - используем данные из ответа
        const data = await response.json();
        if (data) {
          setDocuments(prev => {
            const newDoc = Array.isArray(data) ? data[0] : data;
            if (newDoc && newDoc.id) {
              return [...prev, newDoc];
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.error('Ошибка загрузки документа:', err);
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (id: number) => {
    if (!confirm('Удалить этот документ?')) return;
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_CONFIG.baseUrl}/admin/documents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchDocuments();
      }
    } catch (err) {
      console.error('Ошибка удаления документа:', err);
    }
  };

  const toggleDocumentVisibility = async (doc: Document) => {
    try {
      const token = localStorage.getItem('admin_token');
      const newVisibility = doc.is_visible ? 'false' : 'true';
      await fetch(`${API_CONFIG.baseUrl}/admin/documents/${doc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_visible: newVisibility })
      });
      fetchDocuments();
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };

  // Начать редактирование названия
  const startEditTitle = (doc: Document) => {
    setEditingDocId(doc.id);
    setEditingTitle(doc.title);
  };

  // Сохранить название документа
  const saveDocumentTitle = async (id: number) => {
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`${API_CONFIG.baseUrl}/admin/documents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: editingTitle })
      });
      setEditingDocId(null);
      fetchDocuments();
    } catch (err) {
      console.error('Ошибка сохранения:', err);
    }
  };

  // Переместить документ
  const moveDocument = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= documents.length) return;
    
    // Создаем новый массив с переставленными элементами
    const newDocs = [...documents];
    const [movedDoc] = newDocs.splice(fromIndex, 1);
    newDocs.splice(toIndex, 0, movedDoc);
    
    // Обновляем локально сразу
    setDocuments(newDocs);
    
    // Отправляем новый порядок на сервер
    try {
      const token = localStorage.getItem('admin_token');
      const order = newDocs.map(d => d.id);
      await fetch(`${API_CONFIG.baseUrl}/admin/documents/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ order })
      });
    } catch (err) {
      console.error('Ошибка сохранения порядка:', err);
      fetchDocuments(); // Восстанавливаем исходный порядок при ошибке
    }
  };

  // Toggle выбора документа
  const toggleDocSelection = (id: number) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  // Выбрать все
  const selectAllDocs = () => {
    if (selectedDocs.length === filteredDocuments.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(filteredDocuments.map(d => d.id));
    }
  };

  // Массовое удаление
  const deleteSelectedDocs = async () => {
    if (selectedDocs.length === 0) return;

    if (!confirm(`Удалить ${selectedDocs.length} выбранных документов?`)) return;

    try {
      const token = localStorage.getItem('admin_token');
      await Promise.all(
        selectedDocs.map(id =>
          fetch(`${API_CONFIG.baseUrl}/admin/documents/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          })
        )
      );
      setSelectedDocs([]);
      fetchDocuments();
    } catch (err) {
      console.error('Ошибка массового удаления:', err);
    }
  };

  // Фильтрация документов
  const filteredDocuments = documents.filter(doc => {
    // Поиск по названию
    if (docSearchQuery && !doc.title.toLowerCase().includes(docSearchQuery.toLowerCase()) &&
        !doc.original_name.toLowerCase().includes(docSearchQuery.toLowerCase())) {
      return false;
    }
    // Фильтр по статусу
    if (docStatusFilter === 'visible' && !doc.is_visible) return false;
    if (docStatusFilter === 'hidden' && doc.is_visible) return false;
    return true;
  });

  // Drag and drop обработчики
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    setUploading(true);

    for (const file of files) {
      const formDataDoc = new FormData();
      formDataDoc.append('file', file);
      formDataDoc.append('title', file.name.replace(/\.[^/.]+$/, ''));

      try {
        const token = localStorage.getItem('admin_token');
        await fetch(`${API_CONFIG.baseUrl}/admin/documents`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formDataDoc
        });
      } catch (err) {
        console.error('Ошибка загрузки:', err);
      }
    }

    setUploading(false);
  }, []);

  // Подтверждение удаления
  const confirmDelete = (doc: Document) => {
    setDeleteDocId(doc.id);
    setDeleteDocTitle(doc.title);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteDocId) return;
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`${API_CONFIG.baseUrl}/admin/documents/${deleteDocId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDocuments();
    } catch (err) {
      console.error('Ошибка удаления:', err);
    }
    setDeleteDocId(null);
    setDeleteDocTitle('');
  };

  const addItem = () => setItemsData([...itemsData, { title: '', description: '', value: '' }]);
  const updateItem = (index: number, field: keyof BlockItem, value: string) => {
    const newItems = [...itemsData];
    newItems[index] = { ...newItems[index], [field]: value };
    setItemsData(newItems);
  };
  const removeItem = (index: number) => setItemsData(itemsData.filter((_, i) => i !== index));

  // Отслеживание изменений формы
  const handleFormChange = (setter: (value: any) => void, value: any) => {
    setter(value);
    setHasUnsavedChanges(true);
  };

  // Смена пароля
  const changePassword = async () => {
    setPasswordError('');
    setPasswordSuccess(false);
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Заполните все поля');
      return;
    }
    
    if (newPassword.length < 4) {
      setPasswordError('Новый пароль должен быть минимум 4 символа');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Новые пароли не совпадают');
      return;
    }
    
    setChangingPassword(true);
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${API_CONFIG.baseUrl}/admin/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(false), 3000);
      } else {
        setPasswordError(data.error || 'Ошибка смены пароля');
      }
    } catch (err) {
      setPasswordError('Ошибка соединения с сервером');
    } finally {
      setChangingPassword(false);
    }
  };

  // Форма входа
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layout className="w-8 h-8 text-accent" />
            </div>
            <CardTitle className="text-2xl">Админ-панель</CardTitle>
            <p className="text-muted-foreground">Вход для администратора</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Логин</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Введите логин" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Введите пароль" />
              </div>
              <Button className="w-full" onClick={login} disabled={loading || !username || !password}>
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Вход...</> : 'Войти'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasItems = selectedBlock && ['advantages', 'courses', 'footer', 'about'].includes(selectedBlock.name);

  return (
    <div className="min-h-screen bg-slate-100" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Layout className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Панель управления</h1>
                <p className="text-xs text-muted-foreground">Автошкола "Машинка"</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={() => window.open('/', '_blank')}>
                <Eye className="w-4 h-4 mr-2" />Сайт
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Табы навигации */}
      <div className="bg-white border-b px-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'dashboard'
                ? 'border-accent text-accent' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Home className="w-4 h-4 inline mr-2" />
            Главная
          </button>
          <button
            onClick={() => setActiveTab('blocks')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'blocks'
                ? 'border-accent text-accent' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="w-4 h-4 inline mr-2" />
            Блоки
          </button>
          <button
            onClick={() => { setActiveTab('documents'); fetchSections(); }}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'documents'
                ? 'border-accent text-accent' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Документы
          </button>
          <button
            onClick={() => { setActiveTab('sections'); fetchSections(); }}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'sections'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Folder className="w-4 h-4 inline mr-2" />
            Разделы
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'settings'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Key className="w-4 h-4 inline mr-2" />
            Настройки
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* ДАШБОРД */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Статистика: Документы */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('documents')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Документов</p>
                      <p className="text-3xl font-bold">{documents.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Статистика: Блоки */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('blocks')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Блоков</p>
                      <p className="text-3xl font-bold">{blocks.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Layers className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Статистика: Видимые документы */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('documents')}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Опубликовано</p>
                      <p className="text-3xl font-bold">{documents.filter(d => d.is_visible).length}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Статистика: Скрытые документы */}
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setActiveTab('documents'); setDocStatusFilter('hidden'); }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Скрыто</p>
                      <p className="text-3xl font-bold">{documents.filter(d => !d.is_visible).length}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <EyeOff className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Быстрые действия */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Быстрые действия</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => document.getElementById('doc-upload')?.click()}
                  >
                    <FilePlus className="w-6 h-6" />
                    <span className="text-sm">Загрузить документ</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => setActiveTab('blocks')}
                  >
                    <Layout className="w-6 h-6" />
                    <span className="text-sm">Редактировать блоки</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={() => window.open('/', '_blank')}
                  >
                    <Eye className="w-6 h-6" />
                    <span className="text-sm">Посмотреть сайт</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2"
                    onClick={syncWithFtp}
                    disabled={syncingFtp}
                  >
                    {syncingFtp ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCw className="w-6 h-6" />}
                    <span className="text-sm">{syncingFtp ? 'Синхронизация...' : 'Синхр. с FTP'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Сообщение о синхронизации */}
            {syncMessage && (
              <div className={`flex items-center gap-2 p-4 rounded-lg ${
                syncMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {syncMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <span>{syncMessage.text}</span>
              </div>
            )}

            {/* Последние документы */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Последние документы</CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Нет документов</p>
                ) : (
                  <div className="space-y-2">
                    {documents.slice(0, 5).map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">{doc.original_name}</p>
                          </div>
                        </div>
                        <Badge variant={doc.is_visible ? 'default' : 'secondary'}>
                          {doc.is_visible ? 'Виден' : 'Скрыт'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* БЛОКИ */}
        {activeTab === 'blocks' && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Sidebar */}
            <div className="xl:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Блоки сайта</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="space-y-1">
                    {blocks.map((block) => (
                      <button
                        key={block.id}
                        onClick={() => selectBlock(block)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                          selectedBlock?.id === block.id ? 'bg-accent text-white' : 'hover:bg-slate-100'
                        }`}
                      >
                        <span className="text-sm font-medium">{BLOCK_LABELS[block.name] || block.name}</span>
                        <div className="flex items-center gap-2">
                          {!block.is_visible && <Badge variant="secondary" className="text-xs">скрыт</Badge>}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Редактирование блока */}
            <div className="xl:col-span-4">
              {selectedBlock ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Редактирование: {BLOCK_LABELS[selectedBlock.name] || selectedBlock.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setPreviewBlock(selectedBlock)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Предпросмотр
                        </Button>
                        {saveSuccess && (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle className="w-4 h-4" />Сохранено
                          </span>
                        )}
                        <Button onClick={handleSave} disabled={saving} className="gap-2">
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          Сохранить
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="main" className="w-full">
                      <TabsList className="mb-4">
                        <TabsTrigger value="main">Основное</TabsTrigger>
                        {hasItems && <TabsTrigger value="items">Элементы</TabsTrigger>}
                        <TabsTrigger value="settings">Настройки</TabsTrigger>
                      </TabsList>

                      <TabsContent value="main" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Заголовок</Label>
                            <Input id="title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Заголовок блока" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="subtitle">Подзаголовок</Label>
                            <Input id="subtitle" value={formData.subtitle || ''} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} placeholder="Подзаголовок" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="content">Описание / Контент</Label>
                          <Textarea id="content" value={formData.content || ''} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Текст описания" rows={4} />
                        </div>

                        {selectedBlock.name === 'hero' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="button_text">Текст кнопки</Label>
                              <Input id="button_text" value={formData.button_text || ''} onChange={(e) => setFormData({ ...formData, button_text: e.target.value })} placeholder="Текст на кнопке" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="button_link">Ссылка кнопки</Label>
                              <Input id="button_link" value={formData.button_link || ''} onChange={(e) => setFormData({ ...formData, button_link: e.target.value })} placeholder="contact, courses" />
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Изображение</Label>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <Input value={formData.image || ''} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="URL изображения" />
                            </div>
                            <Label htmlFor="image-upload" className="cursor-pointer">
                              <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg">
                                <Upload className="w-4 h-4" />Загрузить
                              </div>
                            </Label>
                            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                          </div>
                          {formData.image && (
                            <div className="mt-2 relative w-40 h-40 rounded-lg overflow-hidden border">
                              <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.png'; }} />
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      {hasItems && (
                        <TabsContent value="items">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label>Список элементов</Label>
                              <Button variant="outline" size="sm" onClick={addItem}>+ Добавить элемент</Button>
                            </div>
                            {itemsData.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>Нет элементов</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {itemsData.map((item, index) => (
                                  <div key={index} className="p-4 bg-slate-50 rounded-lg border">
                                    <div className="flex items-start justify-between mb-3">
                                      <Badge variant="outline">Элемент {index + 1}</Badge>
                                      <Button variant="ghost" size="sm" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700">Удалить</Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div className="space-y-1">
                                        <Label className="text-xs">Заголовок</Label>
                                        <Input value={item.title || ''} onChange={(e) => updateItem(index, 'title', e.target.value)} placeholder="Заголовок" />
                                      </div>
                                      {selectedBlock.name === 'courses' && (
                                        <div className="space-y-1">
                                          <Label className="text-xs">Цена</Label>
                                          <Input value={item.price || ''} onChange={(e) => updateItem(index, 'price', e.target.value)} placeholder="от 25 000 ₽" />
                                        </div>
                                      )}
                                      <div className="space-y-1 md:col-span-2">
                                        <Label className="text-xs">Описание</Label>
                                        <Input value={item.description || ''} onChange={(e) => updateItem(index, 'description', e.target.value)} placeholder="Описание элемента" />
                                      </div>
                                      {selectedBlock.name === 'footer' && (
                                        <div className="space-y-1 md:col-span-2">
                                          <Label className="text-xs">Значение</Label>
                                          <Input value={item.value || ''} onChange={(e) => updateItem(index, 'value', e.target.value)} placeholder="Значение (телефон, email, адрес)" />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </TabsContent>
                      )}

                      <TabsContent value="settings">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <div>
                              <Label className="font-medium">Показывать блок</Label>
                              <p className="text-sm text-muted-foreground">Блок будет отображаться на сайте</p>
                            </div>
                            <Switch checked={formData.is_visible ?? true} onCheckedChange={(checked: any) => setFormData({ ...formData, is_visible: checked })} />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card><CardContent className="py-12 text-center"><Layout className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" /><p className="text-muted-foreground">Выберите блок для редактирования</p></CardContent></Card>
              )}
            </div>
          </div>
        )}

        {/* ДОКУМЕНТЫ */}
        {activeTab === 'documents' && (
          <div className="max-w-6xl mx-auto space-y-4">
            {/* Поиск и фильтры */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Поиск */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Поиск по названию..."
                      value={docSearchQuery}
                      onChange={(e) => setDocSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Фильтр по статусу */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <select
                      value={docStatusFilter}
                      onChange={(e) => setDocStatusFilter(e.target.value as 'all' | 'visible' | 'hidden')}
                      className="h-10 px-3 rounded-lg border bg-background text-sm"
                    >
                      <option value="all">Все статусы</option>
                      <option value="visible">Только видимые</option>
                      <option value="hidden">Только скрытые</option>
                    </select>
                  </div>

                  {/* Кнопка загрузки */}
                  <Label htmlFor="doc-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90">
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Загрузить документ
                    </div>
                  </Label>
                  <input
                    id="doc-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    className="hidden"
                    onChange={handleDocumentUpload}
                    disabled={uploading}
                    multiple
                  />
                </div>

                {/* Массовые действия */}
                {selectedDocs.length > 0 && (
                  <div className="mt-4 flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm">Выбрано: {selectedDocs.length}</span>
                    <Button variant="outline" size="sm" onClick={selectAllDocs}>
                      {selectedDocs.length === filteredDocuments.length ? 'Снять выбор' : 'Выбрать все'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={deleteSelectedDocs} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Удалить выбранные
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Drag & Drop зона */}
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? 'border-accent bg-accent/5' : 'border-transparent'
              }`}
            >
              <Card>
                <CardContent className={documents.length === 0 ? 'py-12' : 'py-6'}>
                  {documents.length === 0 ? (
                    <>
                      <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-lg font-medium">Нет документов</p>
                      <p className="text-sm text-muted-foreground mb-4">Перетащите файлы сюда или нажмите кнопку загрузки</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mb-2">
                        {isDragging ? 'Отпустите для загрузки' : 'Перетащите файлы для массовой загрузки'}
                      </p>
                      <p className="text-xs text-muted-foreground">Найдено документов: {filteredDocuments.length} из {documents.length}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Таблица документов */}
            {filteredDocuments.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-slate-50">
                          <th className="text-left py-3 px-2 font-medium w-10">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={selectAllDocs}
                            >
                              {selectedDocs.length === filteredDocuments.length ? (
                                <CheckSquare className="w-3 h-3" />
                              ) : (
                                <Square className="w-3 h-3" />
                              )}
                            </Button>
                          </th>
                          <th className="text-left py-2 px-2 font-medium text-sm">Название</th>
                          <th className="text-left py-2 px-2 font-medium text-sm">Файл</th>
                          <th className="text-left py-2 px-2 font-medium text-sm">Размер</th>
                          <th className="text-left py-2 px-2 font-medium text-sm">Статус</th>
                          <th className="text-left py-2 px-2 font-medium text-sm">Раздел</th>
                          <th className="text-right py-2 px-2 font-medium text-sm">Действ.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDocuments.map((doc, index) => (
                          <tr key={doc.id} className={`border-b hover:bg-slate-50 ${selectedDocs.includes(doc.id) ? 'bg-blue-50' : ''}`}>
                            <td className="py-3 px-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => toggleDocSelection(doc.id)}
                              >
                                {selectedDocs.includes(doc.id) ? (
                                  <CheckSquare className="w-3 h-3 text-blue-600" />
                                ) : (
                                  <Square className="w-3 h-3" />
                                )}
                              </Button>
                            </td>
                            <td className="py-3 px-2">
                              {editingDocId === doc.id ? (
                                <div className="flex gap-1">
                                  <Input
                                    value={editingTitle}
                                    onChange={(e) => setEditingTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && saveDocumentTitle(doc.id)}
                                    className="h-7 text-sm"
                                    autoFocus
                                  />
                                  <Button size="sm" className="h-7 px-2" onClick={() => saveDocumentTitle(doc.id)}>
                                    <Check className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-7 px-1" onClick={() => setEditingDocId(null)}>
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div
                                  className="font-medium cursor-pointer hover:text-blue-600 flex items-center gap-1 text-sm"
                                  onClick={() => startEditTitle(doc)}
                                >
                                  {doc.title}
                                  <Edit3 className="w-3 h-3 text-muted-foreground" />
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-1">
                                <FileText className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs truncate max-w-[100px]">{doc.original_name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 text-xs text-muted-foreground">
                              {doc.file_size ? (doc.file_size / 1024).toFixed(0) + ' КБ' : '-'}
                            </td>
                            <td className="py-3 px-2">
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${doc.is_visible ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {doc.is_visible ? 'Виден' : 'Скрыт'}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <select
                                value={doc.section_id || ''}
                                onChange={async (e) => {
                                  const newSectionId = e.target.value ? parseInt(e.target.value) : null;
                                  try {
                                    const adminToken = localStorage.getItem('admin_token');
                                    const response = await fetch(`${API_CONFIG.baseUrl}/admin/documents/${doc.id}`, {
                                      method: 'PUT',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${adminToken}`
                                      },
                                      body: JSON.stringify({ section_id: newSectionId })
                                    });
                                    if (response.ok) {
                                      // Обновляем локальное состояние
                                      setDocuments(docs => docs.map(d => 
                                        d.id === doc.id ? { ...d, section_id: newSectionId } : d
                                      ));
                                    }
                                  } catch (err) {
                                    console.error('Ошибка изменения раздела:', err);
                                  }
                                }}
                                className="text-xs border rounded px-1 py-0.5 bg-white w-24"
                              >
                                <option value="">— Без раздела —</option>
                                {sections.map(section => (
                                  <option key={section.id} value={section.id}>
                                    {section.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <div className="flex items-center justify-end gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  onClick={() => toggleDocumentVisibility(doc)}
                                  title={doc.is_visible ? 'Скрыть' : 'Показать'}
                                >
                                  {doc.is_visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={async () => {
                                  try {
                                    const response = await fetch(`${API_CONFIG.baseUrl}/download/${doc.filename}`);
                                    if (!response.ok) throw new Error('Ошибка загрузки');
                                    const blob = await response.blob();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = doc.original_name || doc.filename;
                                    document.body.appendChild(a);
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                  } catch (err) {
                                    console.error('Ошибка скачивания:', err);
                                    window.open(`${API_CONFIG.baseUrl}/download/${doc.filename}`, '_blank');
                                  }
                                }}>
                                  <Download className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={() => confirmDelete(doc)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {filteredDocuments.length === 0 && documents.length > 0 && (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">Документы не найдены по вашему запросу</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* РАЗДЕЛЫ */}
        {activeTab === 'sections' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Управление разделами</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Форма создания нового раздела */}
                <div className="flex gap-2 mb-6">
                  <Input
                    placeholder="Название нового раздела..."
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && newSectionName.trim() && createSection(newSectionName.trim()).then(() => setNewSectionName(''))}
                  />
                  <Button 
                    onClick={() => {
                      if (newSectionName.trim()) {
                        createSection(newSectionName.trim()).then(() => setNewSectionName(''));
                      }
                    }}
                    disabled={!newSectionName.trim()}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить
                  </Button>
                </div>

                {/* Список разделов */}
                {sections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Нет разделов</p>
                    <p className="text-sm">Создайте раздел для группировки документов</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sections.map((section) => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors"
                      >
                        {editingSectionId === section.id ? (
                          <div className="flex gap-2 flex-1">
                            <Input
                              value={editingSectionName}
                              onChange={(e) => setEditingSectionName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && saveSectionName()}
                              className="flex-1"
                              autoFocus
                            />
                            <Button size="sm" onClick={saveSectionName}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingSectionId(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <Folder className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium cursor-pointer hover:text-blue-600" onClick={() => startEditSection(section)}>
                                  {section.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {documents.filter(d => d.section_id === section.id).length} документов
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSectionVisibility(section)}
                                title={section.is_visible ? 'Скрыть раздел' : 'Показать раздел'}
                                className={section.is_visible ? 'text-orange-500 hover:text-orange-700' : 'text-green-500 hover:text-green-700'}
                              >
                                {section.is_visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditSection(section)}
                                title="Переименовать"
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteSection(section.id)}
                                className="text-red-500 hover:text-red-700"
                                title="Удалить"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Инструкция */}
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-2">Как использовать разделы:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Создайте разделы для группировки документов</li>
                    <li>При загрузке документа можно выбрать раздел</li>
                    <li>На сайте документы будут отображаться по разделам</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* НАСТРОЙКИ */}
        {activeTab === 'settings' && (
          <div className="max-w-xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Key className="w-5 h-5" />Смена пароля
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {passwordError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Пароль успешно изменён
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Текущий пароль</Label>
                    <Input 
                      id="currentPassword" 
                      type="password" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                      placeholder="Введите текущий пароль" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Новый пароль</Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="Введите новый пароль (минимум 4 символа)" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="Повторите новый пароль" 
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={changePassword} 
                    disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                  >
                    {changingPassword ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Смена пароля...</> : 'Изменить пароль'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Модальное окно подтверждения удаления */}
      <AlertDialog open={deleteDocId !== null} onOpenChange={() => setDeleteDocId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить документ?</AlertDialogTitle>
            <AlertDialogDescription>
              Вы собираетесь удалить документ "{deleteDocTitle}". Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmed} className="bg-red-600 hover:bg-red-700">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Модальное окно предпросмотра блока */}
      <Dialog open={previewBlock !== null} onOpenChange={() => setPreviewBlock(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Предпросмотр: {BLOCK_LABELS[previewBlock?.name || ''] || previewBlock?.name}</DialogTitle>
            <DialogDescription>
              Так блок будет выглядеть на сайте
            </DialogDescription>
          </DialogHeader>

          {previewBlock && (
            <div className="mt-4 space-y-4">
              {/* Hero Block Preview */}
              {previewBlock.name === 'hero' && (
                <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 rounded-lg">
                  <h1 className="text-4xl font-bold mb-4">{formData.title || previewBlock.title || 'Заголовок'}</h1>
                  <p className="text-xl mb-6">{formData.subtitle || previewBlock.subtitle || 'Подзаголовок'}</p>
                  <p className="text-lg mb-6">{formData.content || previewBlock.content || 'Описание'}</p>
                  {formData.button_text && (
                    <button className="bg-accent text-accent-foreground px-6 py-3 rounded-lg">
                      {formData.button_text}
                    </button>
                  )}
                </div>
              )}

              {/* About Block Preview */}
              {previewBlock.name === 'about' && (
                <div className="bg-background p-8 rounded-lg border">
                  <h2 className="text-3xl font-bold mb-4">{formData.title || previewBlock.title || 'О нас'}</h2>
                  <div className="w-20 h-1 bg-accent mb-6"></div>
                  <p className="text-lg">{formData.content || previewBlock.content || 'Описание'}</p>
                </div>
              )}

              {/* Advantages Block Preview */}
              {previewBlock.name === 'advantages' && (
                <div className="bg-background p-8 rounded-lg border">
                  <h2 className="text-3xl text-center mb-4">{formData.title || previewBlock.title || 'Преимущества'}</h2>
                  <div className="w-20 h-1 bg-accent mx-auto mb-6"></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(itemsData.length > 0 ? itemsData : previewBlock.items || []).map((item, i) => (
                      <div key={i} className="p-4 bg-card rounded-lg text-center">
                        <h3 className="font-medium">{item.title || 'Заголовок'}</h3>
                        <p className="text-sm text-muted-foreground">{item.description || 'Описание'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Courses Block Preview */}
              {previewBlock.name === 'courses' && (
                <div className="bg-background p-8 rounded-lg border">
                  <h2 className="text-3xl text-center mb-4">{formData.title || previewBlock.title || 'Курсы'}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(itemsData.length > 0 ? itemsData : previewBlock.items || []).map((item, i) => (
                      <div key={i} className="p-6 bg-card rounded-xl border">
                        <h3 className="font-bold text-lg">{item.title || 'Название курса'}</h3>
                        <p className="text-2xl font-bold text-accent mt-2">{item.price || 'Цена'}</p>
                        <p className="text-sm text-muted-foreground mt-2">{item.description || 'Описание'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Block Preview */}
              {previewBlock.name === 'contact' && (
                <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-8 rounded-lg">
                  <h2 className="text-3xl font-bold mb-4">{formData.title || previewBlock.title || 'Контакты'}</h2>
                  <p className="text-lg mb-6">{formData.content || previewBlock.content || 'Описание'}</p>
                  <div className="grid grid-cols-2 gap-4">
                    {(itemsData.length > 0 ? itemsData : previewBlock.items || []).map((item, i) => (
                      <div key={i} className="p-4 bg-white/10 rounded-lg">
                        <h3 className="font-medium">{item.title || 'Заголовок'}</h3>
                        <p>{item.value || 'Значение'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer Block Preview */}
              {previewBlock.name === 'footer' && (
                <div className="bg-primary text-primary-foreground p-8 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(itemsData.length > 0 ? itemsData : previewBlock.items || []).map((item, i) => (
                      <div key={i}>
                        <h3 className="font-medium mb-2">{item.title || 'Заголовок'}</h3>
                        <p className="text-sm opacity-90">{item.value || 'Значение'}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/20 text-center text-sm">
                    {formData.subtitle || previewBlock.subtitle || '© 2026 Автошкола Машинка'}
                  </div>
                </div>
              )}

              {/* Documents Block Preview */}
              {previewBlock.name === 'documents' && (
                <div className="bg-background p-8 rounded-lg border">
                  <h2 className="text-3xl text-center mb-4">{formData.title || previewBlock.title || 'Документы'}</h2>
                  <div className="space-y-2 mt-6">
                    {documents.slice(0, 5).map((doc, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                        <FileText className="w-5 h-5 text-accent" />
                        <span className="font-medium">{doc.title}</span>
                        <span className="text-sm text-muted-foreground ml-auto">{doc.original_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={() => setPreviewBlock(null)}>
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// cd "C:\Users\79153\Documents\GitHub\avtomashinka\server"
// node server.js