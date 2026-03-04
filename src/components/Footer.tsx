import { 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle,
  Send
} from 'lucide-react';
import { Button } from './ui/button';
import { useBlocks } from '../contexts/BlocksContext';

export function Footer() {
  const { getBlock, loading } = useBlocks();
  const footerBlock = getBlock('footer');
  
  // Если блок скрыт - не рендерим компонент
  if (footerBlock?.is_visible === false) {
    return null;
  }

  // Фильтруем только видимые элементы
  const items = (footerBlock?.items || []).filter((item: any) => item.is_visible !== false);
  
  // Контакты (элементы из админки или значения по умолчанию)
  const contactInfo = items.length > 0 ? items : [
    { title: 'Телефон', value: '+7 (952) 688-22-88', icon: 'phone' },
    { title: 'Email', value: 'info@mashinka.ru', icon: 'email' },
    { title: 'Адрес', value: 'г. Екатеринбург, ул. Первомайская, стр. 77', icon: 'address' }
  ];

  const privacyLink = footerBlock?.privacy_link || '/privacy';
  const termsLink = footerBlock?.terms_link || '/terms';

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getIcon = (title: string) => {
    const lowerTitle = title?.toLowerCase() || '';
    if (lowerTitle.includes('телефон')) return Phone;
    if (lowerTitle.includes('email') || lowerTitle.includes('почта')) return Mail;
    if (lowerTitle.includes('адрес')) return MapPin;
    return Phone;
  };

  // Юридическая информация из поля content
  const legalInfo = footerBlock?.content || '';

  return (
    <footer className="bg-primary text-primary-foreground accessibility-high-contrast-exclude accessibility-inverted-exclude accessibility-blue-exclude">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img src="/assets/logo.png" alt="Mashinka Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold"></span>
            </div>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
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
                Cведения об образовательной организации
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="block text-sm text-primary-foreground/80 hover:text-accent transition-colors"
              >
                Контакты
              </button>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-accent">Контакты</h3>
            <div className="space-y-3">
              {contactInfo.map((item, index) => {
                const IconComponent = getIcon(item.title);
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <IconComponent className="w-4 h-4 text-accent" />
                    <span className="text-sm">{item.value}</span>
                  </div>
                );
              })}
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
              {footerBlock?.subtitle || '© 2025 Автошкола "Машинка". Все права защищены.'}
            </div>
            <div className="flex space-x-6 text-sm">
              <a href={privacyLink} className="text-primary-foreground/60 hover:text-accent transition-colors">
                Политика конфиденциальности
              </a>
              <a href={termsLink} className="text-primary-foreground/60 hover:text-accent transition-colors">
                Пользовательское соглашение
              </a>
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