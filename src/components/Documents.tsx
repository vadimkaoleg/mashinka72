import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Download, FileText, ChevronDown, ChevronUp, File, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { API_CONFIG, api, DocumentType, SectionType, SubsectionType } from '../config/api';
import { useBlocks } from '../contexts/BlocksContext';
import { loadSiteData, getDocumentsFromData, getSectionsFromData } from '../lib/data-loader';

export function Documents() {
  const { getBlock } = useBlocks();
  const documentsBlock = getBlock('documents');
  
  // Если блок скрыт - не рендерим компонент
  if (documentsBlock?.is_visible === false) {
    return null;
  }
  
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [sections, setSections] = useState<SectionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSections, setLoadingSections] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchDocuments();
    fetchSections();
  }, []);

  // Попытка загрузки с FTP (основной) с fallback на API
  const fetchDocuments = async () => {
    // 1. Пробуем загрузить с FTP (основной источник)
    try {
      const siteData = await loadSiteData();
      if (siteData) {
        const ftpDocs = getDocumentsFromData(siteData);
        setDocuments(ftpDocs);
        setExpandedRows(new Set());
        setLoading(false);
        return;
      }
    } catch (ftpError) {
      // FTP недоступен, пробуем следующий источник
    }

    // 2. Fallback: пробуем API
    try {
      const result = await api.getDocuments();
      
      if (result.success && result.data) {
        setDocuments(result.data);
        setExpandedRows(new Set());
        setLoading(false);
        return;
      }
    } catch (apiError) {
      // API недоступен
    }

    // 3. Если ничего не работает - используем пустой массив
    setDocuments([]);
    setLoading(false);
  };

  const fetchSections = async () => {
    try {
      setLoadingSections(true);
      
      // 1. Пробуем загрузить с FTP (основной источник)
      const siteData = await loadSiteData();
      if (siteData) {
        const ftpSections = getSectionsFromData(siteData);
        setSections(ftpSections);
        setLoadingSections(false);
        return;
      }
    } catch (ftpError) {
      // FTP недоступен, пробуем следующий источник
    }

    // 2. Fallback: пробуем API
    try {
      const result = await api.getSections();
      
      if (result.success && result.data) {
        setSections(result.data);
        setLoadingSections(false);
        return;
      }
    } catch (apiError) {
      // API недоступен
    }

    // 3. Если ничего не работает - используем пустой массив
    setSections([]);
    setLoadingSections(false);
  };

  const getGroupedDocuments = () => {
    // Фильтруем только видимые разделы
    const visibleSections = sections.filter(s => s.is_visible !== false);
    
    // Фильтруем только видимые документы
    const visibleDocuments = documents.filter(d => d.is_visible !== false);
    
    const grouped: {
      [sectionId: number]: {
        section: SectionType;
        subsections: {
          [subsectionId: number]: {
            subsection: SubsectionType;
            documents: DocumentType[];
          };
        };
        documentsWithoutSubsection: DocumentType[];
      };
    } = {};

    visibleSections.forEach(section => {
      // Фильтруем видимые подразделы
      const visibleSubsections = (section.subsections || []).filter(sub => sub.is_visible !== false);
      grouped[section.id] = {
        section: { ...section, subsections: visibleSubsections },
        subsections: {},
        documentsWithoutSubsection: []
      };
    });

    grouped[0] = {
      section: {
        id: 0,
        name: 'Без раздела',
        sort_order: 999,
        is_visible: true,
        subsections: []
      },
      subsections: {},
      documentsWithoutSubsection: []
    };

    visibleDocuments.forEach(doc => {
      if (doc.section_id) {
        const sectionId = doc.section_id;
        
        if (!grouped[sectionId]) {
          grouped[sectionId] = {
            section: sections.find(s => s.id === sectionId) || {
              id: sectionId,
              name: `Раздел ${sectionId}`,
              sort_order: 999,
              is_visible: true,
              subsections: []
            },
            subsections: {},
            documentsWithoutSubsection: []
          };
        }

        if (doc.subsection_id) {
          const subsectionId = doc.subsection_id;
          if (!grouped[sectionId].subsections[subsectionId]) {
            const section = sections.find(s => s.id === sectionId);
            const subsection = section?.subsections?.find(s => s.id === subsectionId) || {
              id: subsectionId,
              section_id: sectionId,
              name: `Подраздел ${subsectionId}`,
              sort_order: 0,
              is_visible: true
            };
            
            grouped[sectionId].subsections[subsectionId] = {
              subsection,
              documents: []
            };
          }
          grouped[sectionId].subsections[subsectionId].documents.push(doc);
        } else {
          grouped[sectionId].documentsWithoutSubsection.push(doc);
        }
      } else {
        grouped[0].documentsWithoutSubsection.push(doc);
      }
    });

    Object.keys(grouped).forEach(key => {
      const sectionId = parseInt(key);
      const group = grouped[sectionId];
      
      if (sectionId > 0) {
        const hasDocuments = 
          group.documentsWithoutSubsection.length > 0 ||
          Object.keys(group.subsections).some(subId => 
            group.subsections[parseInt(subId)].documents.length > 0
          );
        
        if (!hasDocuments) {
          delete grouped[sectionId];
        }
      }
    });

    return grouped;
  };

  const getSortedGroupedDocuments = () => {
    const grouped = getGroupedDocuments();
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      const orderA = grouped[parseInt(a)].section.sort_order;
      const orderB = grouped[parseInt(b)].section.sort_order;
      return orderA - orderB;
    });
    
    const sorted: typeof grouped = {};
    sortedKeys.forEach(key => {
      const sectionId = parseInt(key);
      sorted[sectionId] = grouped[sectionId];
    });
    
    return sorted;
  };

  const handleDownload = async (doc: DocumentType) => {
    try {
      window.open(doc.downloadUrl, '_blank');
    } catch (error) {
      // Ошибка при открытии файла
    }
  };

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderDocumentCard = (doc: DocumentType) => {
    const isExpanded = expandedRows.has(doc.id);
    
    return (
      <div
        key={doc.id}
        className={`border rounded-lg overflow-hidden transition-all duration-300 ${
          isExpanded ? 'border-accent shadow-md' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <button
          onClick={() => toggleRow(doc.id)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center space-x-3 text-left">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isExpanded ? 'bg-accent text-white' : 'bg-accent/10 text-accent'
            }`}>
              <File className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 truncate max-w-xs">
                {doc.title}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-500">
                  {formatDate(doc.created_at)}
                </span>
                <span className="text-xs px-2 py-0.5 bg-slate-100 rounded">
                  {formatFileSize(doc.file_size)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded ${
              isExpanded ? 'bg-accent text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {isExpanded ? 'Скрыть' : 'Подробнее'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="border-t p-4 bg-slate-50/50">
            <div className="space-y-3">
              {doc.description && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-1">Описание:</h4>
                  <p className="text-sm text-slate-600">{doc.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-500 mb-1">Имя файла:</div>
                  <div className="font-medium truncate">{doc.original_name}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Тип файла:</div>
                  <div className="font-medium">{doc.file_type.toUpperCase()}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Дата загрузки:</div>
                  <div className="font-medium">{formatDate(doc.created_at)}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Размер:</div>
                  <div className="font-medium">{formatFileSize(doc.file_size)}</div>
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex items-center justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open(doc.fileUrl || doc.downloadUrl, '_blank');
                    }}
                    className="gap-2 mr-2"
                  >
                    <Eye className="w-4 h-4" />
                    Предпросмотр
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    className="gap-2 bg-accent hover:bg-accent/90"
                  >
                    <Download className="w-4 h-4" />
                    Скачать
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Данные из блока documents
  const title = documentsBlock?.title || 'Сведения об образовательной организации';
  const description = documentsBlock?.content || '';
  const legalInfo = documentsBlock?.legal_info || '';

  return (
    <section id="documents" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-3xl md:text-4xl text-primary">
            {title}
          </h2>
          <div className="w-20 h-1 bg-accent mx-auto"></div>
          {description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>

        {/* Юридическая информация */}
        {legalInfo && (
          <div className="mb-8 p-4 bg-white rounded-lg border shadow-sm">
            <div 
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: legalInfo }}
            />
          </div>
        )}



        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-accent" />
                <span>Документы автошколы</span>
              </div>
              <Badge variant="outline">
                {documents.filter(d => d.is_visible !== false).length} документов
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Загрузка документов...</p>
              </div>
            ) : loadingSections ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Загрузка разделов...</p>
              </div>
            ) : documents.length > 0 ? (
              <div className="space-y-8">
                {Object.entries(getSortedGroupedDocuments()).map(([sectionIdStr, group]) => {
                  const sectionId = parseInt(sectionIdStr);
                  const hasSubsections = Object.keys(group.subsections).length > 0;
                  const hasDocuments = 
                    group.documentsWithoutSubsection.length > 0 ||
                    Object.keys(group.subsections).some(subId => 
                      group.subsections[parseInt(subId)].documents.length > 0
                    );
                  
                  if (!hasDocuments) return null;
                  
                  return (
                    <div key={sectionId} className="border rounded-lg overflow-hidden">
                      <div className="bg-slate-50 border-b p-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                          <span className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm">
                            {sectionId === 0 ? '📄' : sectionId}
                          </span>
                          {group.section.name}
                          <Badge variant="outline" className="ml-auto">
                            {Object.values(group.subsections).reduce(
                              (total, sub) => total + sub.documents.length, 
                              group.documentsWithoutSubsection.length
                            )} документов
                          </Badge>
                        </h3>
                        {group.section.description && (
                          <p className="text-sm text-slate-600 mt-1">{group.section.description}</p>
                        )}
                      </div>
                      
                      <div className="p-4">
                        {hasSubsections && Object.values(group.subsections).map(subsectionGroup => (
                          <div key={subsectionGroup.subsection.id} className="mb-6 last:mb-0">
                            <h4 className="text-md font-medium text-slate-700 mb-3 border-b pb-2">
                              {subsectionGroup.subsection.name}
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {subsectionGroup.documents.length}
                              </Badge>
                            </h4>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {subsectionGroup.documents.map((doc) => renderDocumentCard(doc))}
                            </div>
                          </div>
                        ))}
                        
                        {group.documentsWithoutSubsection.length > 0 && (
                          <div className={`${hasSubsections ? 'mt-6 pt-6 border-t' : ''}`}>
                            {hasSubsections && (
                              <h4 className="text-md font-medium text-slate-700 mb-3">
                                Другие документы в разделе
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  {group.documentsWithoutSubsection.length}
                                </Badge>
                              </h4>
                            )}
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {group.documentsWithoutSubsection.map((doc) => renderDocumentCard(doc))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h4 className="text-lg font-medium mb-2">Нет доступных документов</h4>
                <p>Документы будут добавлены позже</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}