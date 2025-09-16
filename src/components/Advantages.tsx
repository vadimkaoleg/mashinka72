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

export function Advantages() {
  const advantages = [
    {
      icon: GraduationCap,
      title: "Опытные инструкторы",
      description: "Все наши инструкторы имеют многолетний опыт и сертификаты"
    },
    {
      icon: Calendar,
      title: "Гибкий график",
      description: "Занятия в удобное для вас время, включая выходные дни"
    },
    {
      icon: DollarSign,
      title: "Доступные цены",
      description: "Конкурентные цены и возможность рассрочки платежа"
    },
    {
      icon: Car,
      title: "Современный автопарк",
      description: "Новые учебные автомобили с двойным управлением"
    },
    {
      icon: MapPin,
      title: "Удобное расположение",
      description: "Несколько филиалов по городу для вашего удобства"
    },
    {
      icon: HeadphonesIcon,
      title: "Поддержка 24/7",
      description: "Круглосуточная консультационная поддержка студентов"
    },
    {
      icon: Trophy,
      title: "Высокая сдаваемость",
      description: "98% наших выпускников сдают экзамен с первого раза"
    },
    {
      icon: Shield,
      title: "Гарантия качества",
      description: "Гарантируем качественное обучение или вернем деньги"
    }
  ];

  return (
    <section id="advantages" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl text-primary">
            Почему выбирают нас
          </h2>
          <div className="w-20 h-1 bg-accent mx-auto"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Мы предоставляем лучшие условия для качественного обучения вождению
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((advantage, index) => {
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
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {advantage.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl text-accent mb-2">500+</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Выпускников</div>
          </div>
          <div className="text-center">
            <div className="text-4xl text-accent mb-2">15+</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Лет опыта</div>
          </div>
          <div className="text-center">
            <div className="text-4xl text-accent mb-2">98%</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Сдают с 1 раза</div>
          </div>
          <div className="text-center">
            <div className="text-4xl text-accent mb-2">20+</div>
            <div className="text-sm text-muted-foreground uppercase tracking-wider">Инструкторов</div>
          </div>
        </div>
      </div>
    </section>
  );
}