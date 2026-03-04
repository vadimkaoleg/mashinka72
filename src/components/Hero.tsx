import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useBlocks } from '../contexts/BlocksContext';

export function Hero() {
  const { getBlock, loading } = useBlocks();
  const heroBlock = getBlock('hero');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  // Если блок скрыт - не рендерим компонент
  if (heroBlock?.is_visible === false) {
    return null;
  }

  if (loading) {
    return (
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-white/20 rounded w-3/4"></div>
            <div className="h-8 bg-white/20 rounded w-1/2"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-24 pb-16 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl leading-tight">
              {heroBlock?.title || 'Мы не просто автошкола.'}  
              <span className="text-accent block">{heroBlock?.subtitle || 'Мы — Академия будущих водителей!'}</span>
            </h1>
            
            <p className="text-lg md:text-xl opacity-90 leading-relaxed">
              {heroBlock?.content || 'Автошкола "Машинка" предлагает качественное обучение вождению с опытными инструкторами.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {heroBlock?.button_text && (
                <Button 
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  onClick={() => scrollToSection(heroBlock?.button_link || 'contact')}
                >
                  {heroBlock.button_text}
                </Button>
              )}
              {/* <Button 
                size="lg"
                variant="outline"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => scrollToSection('courses')}
              >
                Узнать о курсах
              </Button> */}
            </div>
          </div>
          
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback 
                src={heroBlock?.image || "/assets/5768230199559392359_121.jpg"}
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