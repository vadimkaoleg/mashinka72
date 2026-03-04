import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityState {
  fontSize: number;
  contrast: 'normal' | 'high' | 'inverted' | 'blue';
  imagesEnabled: boolean;
  isEnabled: boolean;
  letterSpacing: 'normal' | 'medium' | 'large';
  lineHeight: 'normal' | 'medium' | 'large';
}

interface AccessibilityContextType extends AccessibilityState {
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  setContrast: (contrast: AccessibilityState['contrast']) => void;
  toggleImages: () => void;
  toggleAccessibility: () => void;
  setLetterSpacing: (spacing: AccessibilityState['letterSpacing']) => void;
  setLineHeight: (height: AccessibilityState['lineHeight']) => void;
  resetSettings: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

const defaultState: AccessibilityState = {
  fontSize: 16,
  contrast: 'normal',
  imagesEnabled: true,
  isEnabled: false,
  letterSpacing: 'normal',
  lineHeight: 'normal'
};

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(defaultState);

  // Загрузка настроек из localStorage
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        // Ошибка чтения настроек
      }
    }
  }, []);

  // Сохранение настроек в localStorage
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(state));
  }, [state]);

  // Применение стилей к документу
  useEffect(() => {
    const styleId = 'accessibility-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // Очищаем предыдущие стили
    styleElement.textContent = '';

    // Базовые стили для размера шрифта и интервалов
    const baseStyles = `
      /* Базовые стили доступности */
      body.accessibility-enabled {
        font-size: ${state.fontSize}px !important;
        letter-spacing: ${state.letterSpacing === 'medium' ? '0.05em' : state.letterSpacing === 'large' ? '0.1em' : 'normal'} !important;
        line-height: ${state.lineHeight === 'medium' ? '1.6' : state.lineHeight === 'large' ? '1.8' : '1.4'} !important;
      }

      /* Применяем размер шрифта ко всем текстовым элементам */
      body.accessibility-enabled * {
        font-size: inherit !important;
        letter-spacing: inherit !important;
        line-height: inherit !important;
      }

      /* Панель доступности - всегда видима */
      .accessibility-panel {
        background: #FFFFFF !important;
        color: #000000 !important;
        border: 3px solid #000000 !important;
        z-index: 10000 !important;
      }
      
      .accessibility-panel * {
        color: #000000 !important;
        background: transparent !important;
      }
      
      /* Кнопки в панели доступности */
      .accessibility-panel button {
        background: #000000 !important;
        color: #FFFFFF !important;
        border: 2px solid #000000 !important;
      }
      
      .accessibility-panel button:hover {
        background: #333333 !important;
        border-color: #333333 !important;
      }

      /* Управление изображениями */
      ${!state.imagesEnabled ? `
        body.accessibility-enabled img,
        body.accessibility-enabled picture,
        body.accessibility-enabled video {
          visibility: hidden !important;
          opacity: 0 !important;
        }
      ` : `
        body.accessibility-enabled img,
        body.accessibility-enabled picture,
        body.accessibility-enabled video {
          visibility: visible !important;
          opacity: 1 !important;
        }
      `}

      /* Улучшение фокуса для доступности */
      body.accessibility-enabled a:focus,
      body.accessibility-enabled button:focus,
      body.accessibility-enabled input:focus,
      body.accessibility-enabled select:focus,
      body.accessibility-enabled textarea:focus {
        outline: 3px solid #FFFF00 !important;
        outline-offset: 2px !important;
      }

      /* Улучшение читаемости ссылок */
      body.accessibility-enabled a {
        text-decoration: underline !important;
      }
    `;

    // Стили для цветовых схем
    let contrastStyles = '';
    
    if (state.contrast === 'high') {
      contrastStyles = `
         /* ВЫСОКАЯ КОНТРАСТНОСТЬ */
    body.accessibility-enabled {
      background: #000000 !important;
      color: #FFFFFF !important;
    }
    body.accessibility-enabled header,
    body.accessibility-enabled footer,
    body.accessibility-enabled main,
    body.accessibility-enabled section,
    body.accessibility-enabled article,
    body.accessibility-enabled div:not(.accessibility-panel):not(.accessibility-panel *) {
      background: #000000 !important;
      color: #FFFFFF !important;
    }
    body.accessibility-enabled .bg-primary {
      background: #000000 !important;
    }
    body.accessibility-enabled .text-primary-foreground {
      color: #FFFFFF !important;
    }
    
    /* ОСОБЫЕ СТИЛИ ДЛЯ ПАНЕЛИ ДОСТУПНОСТИ В КОНТРАСТНОМ РЕЖИМЕ */
    .accessibility-panel {
      background: #FFFFFF !important;
      color: #000000 !important;
      border: 3px solid #FFFFFF !important;
    }
    .accessibility-panel * {
      color: #000000 !important;
      background: transparent !important;
    }
    .accessibility-panel button {
      background: #000000 !important;
      color: #FFFFFF !important;
      border: 2px solid #000000 !important;
    }
    .accessibility-panel button:hover {
      background: #333333 !important;
      border-color: #333333 !important;
    }
      `;
    } else if (state.contrast === 'inverted') {
      contrastStyles = `
        /* ИНВЕРТИРОВАННЫЙ РЕЖИМ */
        body.accessibility-enabled {
          background: #FFFFFF !important;
          color: #000000 !important;
        }
        body.accessibility-enabled header,
        body.accessibility-enabled footer,
        body.accessibility-enabled main,
        body.accessibility-enabled section,
        body.accessibility-enabled article,
        body.accessibility-enabled div:not(.accessibility-panel) {
          background: #FFFFFF !important;
          color: #000000 !important;
        }
        body.accessibility-enabled .bg-primary {
          background: #FFFFFF !important;
        }
        body.accessibility-enabled .text-primary-foreground {
          color: #000000 !important;
        }
      `;
    } else if (state.contrast === 'blue') {
      contrastStyles = `
        /* СИНИЙ РЕЖИМ */
        body.accessibility-enabled {
          background: #1E3A8A !important;
          color: #FFFFFF !important;
        }
        body.accessibility-enabled header,
        body.accessibility-enabled footer,
        body.accessibility-enabled main,
        body.accessibility-enabled section,
        body.accessibility-enabled article,
        body.accessibility-enabled div:not(.accessibility-panel) {
          background: #1E3A8A !important;
          color: #FFFFFF !important;
        }
        body.accessibility-enabled .bg-primary {
          background: #1E3A8A !important;
        }
        body.accessibility-enabled .text-primary-foreground {
          color: #FFFFFF !important;
        }
      `;
    } else {
      // Стандартный режим - минимальные стили
      contrastStyles = `
        /* СТАНДАРТНЫЙ РЕЖИМ */
        body.accessibility-enabled {
          background: inherit !important;
          color: inherit !important;
        }
      `;
    }

    styleElement.textContent = baseStyles + contrastStyles;

    // Применяем/убираем класс с body
    if (state.isEnabled) {
      document.body.classList.add('accessibility-enabled');
    } else {
      document.body.classList.remove('accessibility-enabled');
      document.body.style.fontSize = '';
      document.body.style.letterSpacing = '';
      document.body.style.lineHeight = '';
    }

    return () => {
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [state]);

  // Дополнительный эффект для принудительного обновления футера
  useEffect(() => {
    if (!state.isEnabled) return;

    const updateFooterStyles = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;

      // Удаляем все предыдущие инлайн-стили
      footer.removeAttribute('style');
      
      // Добавляем класс для идентификации
      footer.classList.add('accessibility-footer');

      if (state.contrast === 'high') {
        footer.style.setProperty('background-color', '#000000', 'important');
        footer.style.setProperty('color', '#FFFFFF', 'important');
        
        // Обновляем все внутренние элементы
        const allElements = footer.querySelectorAll('*');
        allElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.setProperty('color', '#FFFFFF', 'important');
            el.style.setProperty('background-color', 'transparent', 'important');
          }
        });
      } else if (state.contrast === 'inverted') {
        footer.style.setProperty('background-color', '#FFFFFF', 'important');
        footer.style.setProperty('color', '#000000', 'important');
        
        const allElements = footer.querySelectorAll('*');
        allElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.setProperty('color', '#000000', 'important');
            el.style.setProperty('background-color', 'transparent', 'important');
          }
        });
      } else if (state.contrast === 'blue') {
        footer.style.setProperty('background-color', '#1E3A8A', 'important');
        footer.style.setProperty('color', '#FFFFFF', 'important');
        
        const allElements = footer.querySelectorAll('*');
        allElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.style.setProperty('color', '#FFFFFF', 'important');
            el.style.setProperty('background-color', 'transparent', 'important');
          }
        });
      } else {
        // Стандартный режим - сбрасываем все стили
        footer.removeAttribute('style');
        const allElements = footer.querySelectorAll('*');
        allElements.forEach(el => {
          if (el instanceof HTMLElement) {
            el.removeAttribute('style');
          }
        });
      }
    };

    // Вызываем с задержкой чтобы DOM успел обновиться
    const timer = setTimeout(updateFooterStyles, 50);
    return () => clearTimeout(timer);
  }, [state.isEnabled, state.contrast]);

  const increaseFontSize = () => {
    setState(prev => ({
      ...prev,
      fontSize: Math.min(prev.fontSize + 2, 24)
    }));
  };

  const decreaseFontSize = () => {
    setState(prev => ({
      ...prev,
      fontSize: Math.max(prev.fontSize - 2, 14)
    }));
  };

  const setContrast = (contrast: AccessibilityState['contrast']) => {
    setState(prev => ({ ...prev, contrast }));
  };

  const toggleImages = () => {
    setState(prev => ({ ...prev, imagesEnabled: !prev.imagesEnabled }));
  };

  const toggleAccessibility = () => {
    setState(prev => ({ 
      ...prev, 
      isEnabled: !prev.isEnabled 
    }));
  };

  const setLetterSpacing = (letterSpacing: AccessibilityState['letterSpacing']) => {
    setState(prev => ({ ...prev, letterSpacing }));
  };

  const setLineHeight = (lineHeight: AccessibilityState['lineHeight']) => {
    setState(prev => ({ ...prev, lineHeight }));
  };

  const resetSettings = () => {
    setState(defaultState);
  };

  const value: AccessibilityContextType = {
    ...state,
    increaseFontSize,
    decreaseFontSize,
    setContrast,
    toggleImages,
    toggleAccessibility,
    setLetterSpacing,
    setLineHeight,
    resetSettings
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}