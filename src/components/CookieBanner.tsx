import { useState, useEffect } from 'react';
import { Button } from './ui/button';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('cookieAccepted');
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieAccepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-foreground flex-1">
          Мы используем файлы cookie для улучшения работы сайта. Продолжая использовать сайт, 
          вы соглашаетесь с {' '}
          <a 
            href="/docs/cookie.pdf" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            использованием файлов cookie
          </a>
        </p>
        <Button onClick={handleAccept} size="sm">
          Принять
        </Button>
      </div>
    </div>
  );
}