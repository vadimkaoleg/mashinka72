import { 
  ZoomIn, 
  ZoomOut, 
  Contrast, 
  Image, 
  ImageOff,
  Type, 
  RotateCcw,
  Eye,
  X,
  Minus,
  Plus,
  Baseline
} from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';

export function AccessibilityPanel() {
  const {
    fontSize,
    contrast,
    imagesEnabled,
    letterSpacing,
    lineHeight,
    isEnabled,
    increaseFontSize,
    decreaseFontSize,
    setContrast,
    toggleImages,
    setLetterSpacing,
    setLineHeight,
    resetSettings,
    toggleAccessibility
  } = useAccessibility();

  if (!isEnabled) return null;

  return (
    <div 
      className="accessibility-panel fixed top-20 right-4 z-50 bg-white text-black border-2 border-black rounded-lg shadow-2xl p-4 min-w-80"
      role="toolbar" 
      aria-label="Панель настроек доступности"
      style={{
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-black">
        <h3 className="text-lg font-bold flex items-center space-x-2">
          <Eye className="w-5 h-5" />
          <span>Версия для слабовидящих</span>
        </h3>
        <button 
          onClick={toggleAccessibility}
          className="p-1 rounded hover:bg-gray-200 transition-colors border border-black"
          aria-label="Закрыть панель доступности"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Размер шрифта */}
        <div>
          <label className="block text-sm font-bold mb-3 flex items-center space-x-2">
            <Type className="w-4 h-4" />
            <span>Размер текста: {fontSize}px</span>
          </label>
          <div className="flex items-center space-x-3">
            <button
              onClick={decreaseFontSize}
              disabled={fontSize <= 14}
              className="flex items-center justify-center w-10 h-10 rounded disabled:opacity-40 transition-all border-2 border-black bg-black text-white hover:bg-gray-800"
              aria-label="Уменьшить размер текста"
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <div className="flex-1 relative">
              <div className="h-3 rounded-full bg-gray-300" />
              <div 
                className="absolute top-0 left-0 h-3 rounded-full bg-black"
                style={{ width: `${((fontSize - 14) / 10) * 100}%` }}
              />
            </div>
            
            <button
              onClick={increaseFontSize}
              disabled={fontSize >= 24}
              className="flex items-center justify-center w-10 h-10 rounded disabled:opacity-40 transition-all border-2 border-black bg-black text-white hover:bg-gray-800"
              aria-label="Увеличить размер текста"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Цветовая схема */}
        <div>
          <label className="block text-sm font-bold mb-3 flex items-center space-x-2">
            <Contrast className="w-4 h-4" />
            <span>Цветовая схема</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setContrast('normal')}
              className={`py-2 px-3 rounded text-sm font-medium transition-all border-2 ${
                contrast === 'normal' 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-black hover:bg-gray-100'
              }`}
            >
              Стандарт
            </button>
            <button
              onClick={() => setContrast('high')}
              className={`py-2 px-3 rounded text-sm font-medium transition-all border-2 ${
                contrast === 'high' 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-black hover:bg-gray-100'
              }`}
            >
              Контраст
            </button>
            <button
              onClick={() => setContrast('inverted')}
              className={`py-2 px-3 rounded text-sm font-medium transition-all border-2 ${
                contrast === 'inverted' 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-black hover:bg-gray-100'
              }`}
            >
              Инвертир.
            </button>
            <button
              onClick={() => setContrast('blue')}
              className={`py-2 px-3 rounded text-sm font-medium transition-all border-2 ${
                contrast === 'blue' 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-black hover:bg-gray-100'
              }`}
            >
              Синяя
            </button>
          </div>
        </div>

        {/* Межбуквенное расстояние */}
        <div>
          <label className="block text-sm font-bold mb-3">
            Межбуквенное расстояние
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => setLetterSpacing('normal')}
              className={`flex-1 py-2 rounded text-sm font-medium transition-all border-2 ${
                letterSpacing === 'normal' 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-black hover:bg-gray-100'
              }`}
            >
              Обычное
            </button>
            <button
              onClick={() => setLetterSpacing('medium')}
              className={`flex-1 py-2 rounded text-sm font-medium transition-all border-2 ${
                letterSpacing === 'medium' 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-black hover:bg-gray-100'
              }`}
            >
              Среднее
            </button>
            <button
              onClick={() => setLetterSpacing('large')}
              className={`flex-1 py-2 rounded text-sm font-medium transition-all border-2 ${
                letterSpacing === 'large' 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-black hover:bg-gray-100'
              }`}
            >
              Большое
            </button>
          </div>
        </div>

        {/* Межстрочный интервал */}
        <div>
          <label className="block text-sm font-bold mb-3 flex items-center space-x-2">
            <Baseline className="w-4 h-4" />
            <span>Межстрочный интервал</span>
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => setLineHeight('normal')}
              className={`flex-1 py-2 rounded text-sm font-medium transition-all border-2 ${
                lineHeight === 'normal' 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-black hover:bg-gray-100'
              }`}
            >
              Обычный
            </button>
            <button
              onClick={() => setLineHeight('medium')}
              className={`flex-1 py-2 rounded text-sm font-medium transition-all border-2 ${
                lineHeight === 'medium' 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-black hover:bg-gray-100'
              }`}
            >
              Средний
            </button>
            <button
              onClick={() => setLineHeight('large')}
              className={`flex-1 py-2 rounded text-sm font-medium transition-all border-2 ${
                lineHeight === 'large' 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white text-black border-black hover:bg-gray-100'
              }`}
            >
              Большой
            </button>
          </div>
        </div>

        {/* Изображения */}
        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center space-x-2 text-sm font-bold">
            {imagesEnabled ? (
              <Image className="w-4 h-4" />
            ) : (
              <ImageOff className="w-4 h-4" />
            )}
            <span>Изображения</span>
          </label>
          <button
            onClick={toggleImages}
            className={`py-2 px-4 rounded text-sm font-medium transition-all border-2 ${
              imagesEnabled 
                ? 'bg-black text-white border-black' 
                : 'bg-white text-black border-black hover:bg-gray-100'
            }`}
          >
            {imagesEnabled ? 'Вкл' : 'Выкл'}
          </button>
        </div>

        {/* Кнопки управления */}
        <div className="flex space-x-2 pt-4 border-t border-black">
          <button
            onClick={resetSettings}
            className="flex-1 py-2 px-4 rounded font-medium flex items-center justify-center space-x-2 transition-all border-2 border-black bg-black text-white hover:bg-gray-800"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Сбросить настройки</span>
          </button>
        </div>

        {/* Информация о текущих настройках */}
        <div className="text-xs p-2 rounded border border-black bg-gray-50">
          <div className="font-bold mb-1">Текущие настройки:</div>
          <div>Размер: {fontSize}px</div>
          <div>Схема: {contrast === 'normal' ? 'Стандарт' : contrast === 'high' ? 'Контраст' : contrast === 'inverted' ? 'Инвертир.' : 'Синяя'}</div>
          <div>Изображения: {imagesEnabled ? 'Вкл' : 'Выкл'}</div>
        </div>
      </div>
    </div>
  );
}