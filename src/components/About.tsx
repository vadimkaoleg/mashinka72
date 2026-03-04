import { ImageWithFallback } from './figma/ImageWithFallback';
import { Award, Users, Clock, Shield } from 'lucide-react';
import { useBlocks } from '../contexts/BlocksContext';

const statIcons = [Award, Users, Clock, Shield];

export function About() {
  const { getBlock, loading } = useBlocks();
  const aboutBlock = getBlock('about');

  const stats = aboutBlock?.items || [
    { title: 'Лицензия', description: 'Официальная' },
    { title: 'Инструкторы', description: 'Сертифицированные' },
    { title: 'График', description: 'Гибкий' },
    { title: 'Гарантия', description: 'Качества' }
  ];

  // Если блок скрыт - не рендерим компонент
  if (aboutBlock?.is_visible === false) {
    return null;
  }

  if (loading) {
    return (
      <section id="about" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded w-1/3"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl text-primary">
                {aboutBlock?.title || 'О нашей автошколе'}
              </h2>
              <div className="w-20 h-1 bg-accent"></div>
            </div>
            
            <p className="text-lg leading-relaxed text-foreground">
              {aboutBlock?.content || 'Мы гордимся высоким качеством обучения и профессионализмом наших инструкторов.'}
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => {
                const IconComponent = statIcons[index % 4];
                return (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-card rounded-lg shadow-sm">
                    {IconComponent && <IconComponent className="w-8 h-8 text-accent" />}
                    <div>
                      <div className="font-medium">{stat.title}</div>
                      <div className="text-sm text-muted-foreground">{stat.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <ImageWithFallback 
                src={aboutBlock?.image || "/assets/photo_2025-10-29_00-59-02.jpg"}
                alt="Автошкола Машинка"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}