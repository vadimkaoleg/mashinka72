import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function Hero() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight">
              Мы не просто автошкола.  
              <span className="text-accent block">Мы — Академия будущих водителей!</span>
            </h1>
            
            <p className="text-lg md:text-xl opacity-90 leading-relaxed">
              Автошкола "Машинка" предлагает качественное обучение вождению 
              с опытными инструкторами. Получите права быстро и надежно!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => scrollToSection('contact')}
              >
                Записаться сейчас
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => scrollToSection('courses')}
              >
                Узнать о курсах
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl md:text-3xl">500+</div>
                <div className="text-sm opacity-80">Выпускников</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl">80%</div>
                <div className="text-sm opacity-80">Сдают с 1 раза</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1585022523659-8f8feaf2263f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcml2aW5nJTIwaW5zdHJ1Y3RvciUyMGNhciUyMGxlc3NvbnxlbnwxfHx8fDE3NTc5Mzk2OTl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Обучение вождению"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent rounded-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}