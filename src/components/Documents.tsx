import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Download, AlertCircle, ZoomIn } from 'lucide-react';
import { useState } from 'react';

interface DocumentType {
  title: string;
  description: string;
  imageUrl: string;   // Превью изображения (jpg/png)
  fileUrl: string;    // Файл для открытия/скачивания (pdf/jpg)
  type: 'pdf' | 'image';
  size?: string;
}

export function Documents() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showAllDownloads, setShowAllDownloads] = useState(false);

  const documents: DocumentType[] = [
    {
      title: "Устав",
      description: "Устав нашей автошколы",
      imageUrl: "/docs/ustav_prev.jpg",
      fileUrl: "/docs/ustav.pdf",
      type: "pdf",
      size: "156 КБ",
    },
    {
      title: "Программа",
      description: "Рабочая программа кат В",
      imageUrl: "/docs/programm_prev.jpg",
      fileUrl: "/docs/programm.pdf",
      type: "pdf",
      size: "89 КБ",
    },
    {
      title: "План",
      description: "Учебный план",
      imageUrl: "/docs/plan_prev.jpg",
      fileUrl: "/docs/docs.pdf",
      type: "pdf",
      size: "112 КБ",
    },
    {
      title: "Положение",
      description: "О создании безбарьерной среды",
      imageUrl: "/docs/bezbar_prev.jpg",
      fileUrl: "/docs/bezbar.pdf",
      type: "pdf",
      size: "234 КБ",
    },
    {
      title: "Положение",
      description: "об антикоррупционной политике",
      imageUrl: "/docs/anticorr_prev.jpg",
      fileUrl: "/docs/anticorr.pdf",
      type: "pdf",
    },
    {
      title: "Политика",
      description: "об обработке персональных данных",
      imageUrl: "/docs/personalinfo_prev.jpg",
      fileUrl: "/docs/personalinfo.pdf",
      type: "pdf",
    },
    {
      title: "Согласие",
      description: "На обработку персональных данных",
      imageUrl: "/docs/soglasie_persinf_prev.jpg",
      fileUrl: "/docs/soglasie_persinf.pdf",
      type: "pdf",
    },
    {
      title: "Политика",
      description: "об обработке файлов cookie",
      imageUrl: "/docs/cookie_prev.jpg",
      fileUrl: "/docs/cookie.pdf",
      type: "pdf",
    }
  ];

  const handleOpen = (doc: DocumentType) => {
    if (doc.type === 'pdf') {
      window.open(doc.fileUrl, '_blank'); // PDF открывается в новой вкладке
    } else {
      setSelectedImage(doc.fileUrl); // Картинка открывается в модальном окне
    }
  };

  const handleDownload = (fileUrl: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileUrl.split('/').pop() || 'file';
    link.click();
  };

  const closeModal = () => setSelectedImage(null);

  return (
    <section id="documents" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl text-primary">
            Документы и материалы
          </h2>
          <div className="w-20 h-1 bg-accent mx-auto"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ознакомьтесь с нашими документами и скачайте необходимые материалы
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Секция скачиваемых документов */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="w-5 h-5 text-accent" />
                <span>Скачать документы</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(showAllDownloads ? documents : documents.slice(0, 4)).map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-background rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Download className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium text-primary">{doc.title}</h4>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                      {doc.size && <span className="text-xs text-muted-foreground">{doc.size}</span>}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleDownload(doc.fileUrl)}>
                      <Download className="w-4 h-4" />
                    </Button>

                  </div>
                </div>
              ))}

              {documents.length > 4 && (
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => setShowAllDownloads(!showAllDownloads)}
                >
                  {showAllDownloads ? "Свернуть" : "Показать ещё"}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Секция предпросмотра изображений */}
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {(showAllImages ? documents : documents.slice(0, 4)).map((doc, idx) => (
                <div
                  key={idx}
                  className="group cursor-pointer"
                  onClick={() => handleOpen(doc)}
                >
                  <div className="relative overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <ImageWithFallback
                      src={doc.imageUrl}
                      alt={doc.title}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="font-medium text-primary text-sm">{doc.title}</h4>
                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {documents.length > 4 && (
              <div className="mt-4">
                <Button variant="outline" className="w-full" onClick={() => setShowAllImages(!showAllImages)}>
                  {showAllImages ? "Свернуть" : "Показать ещё документы"}
                </Button>
              </div>
            )}
          </CardContent>

          <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mt-4">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-800 font-medium">Информация:</p>
              <p className="text-blue-700">
                Нажмите на изображение для просмотра документа. PDF откроется в новой вкладке.
              </p>
            </div>
          </div>
        </div>

        {/* Модальное окно для изображений */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <div className="relative max-w-4xl max-h-full">
              <button
                onClick={closeModal}
                className="absolute -top-10 right-0 text-white hover:text-accent text-2xl"
              >
                ×
              </button>
              <ImageWithFallback
                src={selectedImage}
                alt="Документ"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
