import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle,
  Send
} from 'lucide-react';
import { Button } from './ui/button';

export function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/assets/logo.png" alt="Mashinka Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold"></span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Мы не просто автошкола. 
              Мы — Академия будущих водителей!
            </p>
            <div className="flex space-x-3">
              <Button 
                size="sm" 
                variant="outline" 
                className="border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground p-2 transition-all duration-200"
                title="ВКонтакте"
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-accent/50 text-accent hover:bg-accent hover:text-accent-foreground p-2 transition-all duration-200"
                title="Telegram"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-accent">Быстрые ссылки</h3>
            <nav className="space-y-2">
              <button 
                onClick={() => scrollToSection('about')}
                className="block text-sm text-primary-foreground/80 hover:text-accent transition-colors"
              >
                О нас
              </button>
              <button 
                onClick={() => scrollToSection('courses')}
                className="block text-sm text-primary-foreground/80 hover:text-accent transition-colors"
              >
                Курсы обучения
              </button>
              <button 
                onClick={() => scrollToSection('advantages')}
                className="block text-sm text-primary-foreground/80 hover:text-accent transition-colors"
              >
                Преимущества
              </button>
              <button 
                onClick={() => scrollToSection('documents')}
                className="block text-sm text-primary-foreground/80 hover:text-accent transition-colors"
              >
                Документы
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="block text-sm text-primary-foreground/80 hover:text-accent transition-colors"
              >
                Контакты
              </button>
            </nav>
          </div>

          {/* Courses */}
          <div className="space-y-4">
            <h3 className="font-semibold text-accent">Общество с ограниченной ответственностью «Автошкола Машинка»</h3>
            <div className="space-y-2">
              <div className="text-sm text-primary-foreground/80">
                ИНН 7203562551
              </div>
              <div className="text-sm text-primary-foreground/80">
                ОГРН 1237200016130
              </div>
              <div className="text-sm text-primary-foreground/80">
                Категория A - Мотоциклы
              </div>
              <div className="text-sm text-primary-foreground/80">
                Повышение квалификации
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-accent">Контакты</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-accent" />
                <span className="text-sm">+7 (952) 688-22-88</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-accent" />
                <span className="text-sm">info@mashinka.ru</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-sm">г. Екатеринбург, ул. Первомайская, д. 77</span>
              </div>
            </div>
            
            <div className="pt-2">
              <Button 
                size="sm"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => scrollToSection('contact')}
              >
                Записаться на обучение
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-primary-foreground/60">
              © 2025 Автошкола "Машинка". Все права защищены.
            </div>
            <div className="flex space-x-6 text-sm">
              <button className="text-primary-foreground/60 hover:text-accent transition-colors">
                Политика конфиденциальности
              </button>
              <button className="text-primary-foreground/60 hover:text-accent transition-colors">
                Пользовательское соглашение
              </button>
              <button 
                onClick={scrollToTop}
                className="text-primary-foreground/60 hover:text-accent transition-colors"
              >
                ↑ Наверх
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}