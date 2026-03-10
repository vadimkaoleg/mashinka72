import { 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  Car, 
  MapPin, 
  HeadphonesIcon,
  Trophy,
  Shield
} from 'lucide-react';
import { useBlocks } from '../contexts/BlocksContext';

const icons = [GraduationCap, Calendar, DollarSign, Car, MapPin, HeadphonesIcon, Shield, Trophy];

export function Advantages() {
  const { getBlock, loading } = useBlocks();
  const advantagesBlock = getBlock('advantages');
  
  const advantages = (advantagesBlock?.items || [])
    .filter((item: any) => item.is_visible !== false)
    .map((item, index) => ({
    icon: icons[index % icons.length],
    title: item.title || '',
    description: item.description || ''
  })) || [
    { icon: GraduationCap, title: "Опытные инструкторы", description: "Все наши инструкторы имеют многолетний опыт" },
    { icon: Calendar, title: "Гибкий график", description: "Занятия в удобное для вас время" },
    { icon: DollarSign, title: "Доступные цены", description: "Конкурентные цены и рассрочка" },
    { icon: Car, title: "Современный автопарк", description: "Новые учебные автомобили" }
  ];

  if (loading) {
    return (
      <section id="advantages" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="advantages" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl text-primary">
            {advantagesBlock?.title || 'Почему выбирают нас'}
          </h2>
          <div className="w-20 h-1 bg-accent mx-auto"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto whitespace-pre-wrap">
            {advantagesBlock?.content || 'Мы предоставляем лучшие условия для качественного обучения вождению'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Если нет видимых преимуществ - не рендерим секцию */}
          {advantages.length === 0 ? null : (
            advantages.map((advantage, index) => {
              const IconComponent = advantage.icon;
              return (
                <div 
                  key={index}
                  className="group p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <IconComponent className="w-6 h-6 text-accent" />
                  </div>
                  
                  <h3 className="text-lg mb-2 text-primary group-hover:text-accent transition-colors">
                    {advantage.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {advantage.description}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}