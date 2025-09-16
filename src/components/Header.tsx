import { Menu, Phone, X } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img src="/assets/logo.png" alt="Mashinka Logo" className="h-10 w-auto" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('about')}
              className="text-primary-foreground hover:text-accent transition-colors"
            >
              О нас
            </button>
            <button 
              onClick={() => scrollToSection('courses')}
              className="text-primary-foreground hover:text-accent transition-colors"
            >
              Курсы
            </button>
            <button 
              onClick={() => scrollToSection('advantages')}
              className="text-primary-foreground hover:text-accent transition-colors"
            >
              Преимущества
            </button>
            <button 
              onClick={() => scrollToSection('documents')}
              className="text-primary-foreground hover:text-accent transition-colors"
            >
              Документы
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-primary-foreground hover:text-accent transition-colors"
            >
              Контакты
            </button>
          </nav>

          {/* Contact Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-accent hover:bg-accent/90 text-accent-foreground border-accent"
              onClick={() => scrollToSection('contact')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Связаться
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-primary-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-primary-foreground/20">
            <div className="flex flex-col space-y-4 pt-4">
              <button 
                onClick={() => scrollToSection('about')}
                className="text-primary-foreground hover:text-accent transition-colors text-left"
              >
                О нас
              </button>
              <button 
                onClick={() => scrollToSection('courses')}
                className="text-primary-foreground hover:text-accent transition-colors text-left"
              >
                Курсы
              </button>
              <button 
                onClick={() => scrollToSection('advantages')}
                className="text-primary-foreground hover:text-accent transition-colors text-left"
              >
                Преимущества
              </button>
              <button 
                onClick={() => scrollToSection('documents')}
                className="text-primary-foreground hover:text-accent transition-colors text-left"
              >
                Документы
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className="text-primary-foreground hover:text-accent transition-colors text-left"
              >
                Контакты
              </button>
              <Button 
                variant="outline" 
                size="sm"
                className="bg-accent hover:bg-accent/90 text-accent-foreground border-accent w-fit"
                onClick={() => scrollToSection('contact')}
              >
                <Phone className="w-4 h-4 mr-2" />
                Связаться
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}