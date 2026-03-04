import { Menu, Phone, X, Eye } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { AccessibilityPanel } from "./AccessibilityPanel";
import { useAccessibility } from '../contexts/AccessibilityContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isEnabled, toggleAccessibility } = useAccessibility();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-lg accessibility-high-contrast-exclude accessibility-inverted-exclude accessibility-blue-exclude">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/assets/logo.png" 
              alt="Логотип автошколы Машинка" 
              className="h-10 w-auto"
            />
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection("about")} 
              className="text-primary-foreground hover:text-accent transition-colors"
              aria-label="Перейти к разделу О нас"
            >
              О нас
            </button>
            <button 
              onClick={() => scrollToSection("advantages")} 
              className="text-primary-foreground hover:text-accent transition-colors"
              aria-label="Перейти к разделу Преимущества"
            >
              Преимущества
            </button>
            <button 
              onClick={() => scrollToSection("documents")} 
              className="text-primary-foreground hover:text-accent transition-colors"
              aria-label="Перейти к разделу сведения об образовательной организации"
            >
              Cведения об образовательной организации
            </button>
            <button 
              onClick={() => scrollToSection("contact")} 
              className="text-primary-foreground hover:text-accent transition-colors"
              aria-label="Перейти к разделу Контакты"
            >
              Контакты
            </button>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={toggleAccessibility}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isEnabled 
                  ? 'bg-accent text-accent-foreground' 
                  : 'text-primary-foreground hover:text-accent'
              }`}
              aria-label="Версия для слабовидящих"
            >
              <Eye className="w-4 h-4" />
              <span>Версия для слабовидящих</span>
            </button>

            <Button
              variant="outline"
              size="sm"
              className="bg-accent hover:bg-accent/90 text-accent-foreground border-accent"
              onClick={() => scrollToSection("contact")}
              aria-label="Связаться с нами"
            >
              <Phone className="w-4 h-4 mr-2" />
              Связаться
            </Button>
          </div>

          <button 
            className="md:hidden text-primary-foreground" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-primary-foreground/20 flex flex-col space-y-4 pt-4">
            <button 
              onClick={() => scrollToSection("about")} 
              className="text-primary-foreground hover:text-accent transition-colors text-left py-2"
            >
              О нас
            </button>
            <button 
              onClick={() => scrollToSection("advantages")} 
              className="text-primary-foreground hover:text-accent transition-colors text-left py-2"
            >
              Преимущества
            </button>
            <button 
              onClick={() => scrollToSection("documents")} 
              className="text-primary-foreground hover:text-accent transition-colors text-left py-2"
            >
              Документы
            </button>
            <button 
              onClick={() => scrollToSection("contact")} 
              className="text-primary-foreground hover:text-accent transition-colors text-left py-2"
            >
              Контакты
            </button>
            <button 
              onClick={toggleAccessibility}
              className={`flex items-center space-x-2 text-left py-2 ${
                isEnabled 
                  ? 'text-accent' 
                  : 'text-primary-foreground hover:text-accent'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Версия для слабовидящих</span>
            </button>
          </nav>
        )}
      </div>

      {/* Панель доступности */}
      {isEnabled && <AccessibilityPanel />}
    </header>
  );
}