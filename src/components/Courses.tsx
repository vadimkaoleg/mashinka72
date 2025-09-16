import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Car, Truck, Bike, Clock, Users, CheckCircle } from 'lucide-react';

export function Courses() {
  const courses = [
    {
      id: 1,
      title: "Категория B",
      subtitle: "Легковые автомобили",
      icon: Car,
      duration: "2-3 месяца",
      price: "25 000 ₽",
      students: "12 человек",
      features: [
        "Теоретический курс 130 часов",
        "Практические занятия 56 часов",
        "Подготовка к экзамену в ГИБДД",
        "Современные учебные автомобили"
      ],
      popular: true
    },
    {
      id: 2,
      title: "Категория C",
      subtitle: "Грузовые автомобили",
      icon: Truck,
      duration: "3-4 месяца",
      price: "35 000 ₽",
      students: "8 человек",
      features: [
        "Расширенный теоретический курс",
        "Практика на грузовых автомобилях",
        "Особенности грузоперевозок",
        "Техническое обслуживание"
      ],
      popular: false
    },
    {
      id: 3,
      title: "Категория A",
      subtitle: "Мотоциклы",
      icon: Bike,
      duration: "1-2 месяца",
      price: "20 000 ₽",
      students: "6 человек",
      features: [
        "Теория управления мотоциклом",
        "Практика на закрытой площадке",
        "Безопасность дорожного движения",
        "Экипировка и защита"
      ],
      popular: false
    }
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="courses" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl text-primary">
            Наши курсы обучения
          </h2>
          <div className="w-20 h-1 bg-accent mx-auto"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Выберите подходящую категорию и начните обучение с профессиональными инструкторами
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {courses.map((course) => {
            const IconComponent = course.icon;
            return (
              <Card 
                key={course.id} 
                className={`relative transition-all duration-300 hover:shadow-lg hover:-translate-y-2 ${
                  course.popular ? 'ring-2 ring-accent' : ''
                }`}
              >
                {course.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm">
                      Популярный
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-primary">{course.title}</CardTitle>
                  <p className="text-muted-foreground">{course.subtitle}</p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl text-accent mb-2">{course.price}</div>
                    <div className="text-sm text-muted-foreground">за полный курс</div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{course.students}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-primary">Что включено:</h4>
                    <ul className="space-y-2">
                      {course.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={() => scrollToSection('contact')}
                  >
                    Записаться на курс
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}