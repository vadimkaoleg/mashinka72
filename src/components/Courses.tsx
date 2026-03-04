import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Car, Truck, Bike, Clock, Users, CheckCircle } from 'lucide-react';
import { useBlocks } from '../contexts/BlocksContext';

const icons = [Car, Truck, Bike];

export function Courses() {
  const { getBlock, loading } = useBlocks();
  const coursesBlock = getBlock('courses');
  
  const courses = (coursesBlock?.items || [])
    .filter((item: any) => item.is_visible !== false)
    .map((item: any, index: number) => ({
      id: index + 1,
      title: item.title || '',
      subtitle: item.description || '',
      price: item.price || '',
      icon: icons[index % icons.length],
      duration: item.duration || "2-3 месяца",
      category: item.category || '',
      features: [
        item.description || 'Теоретический и практический курс обучения'
      ]
    }));

  // Если блок скрыт - не рендерим компонент
  if (coursesBlock?.is_visible === false) {
    return null;
  }

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };


  if (loading) {
    return (
      <section id="courses" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl text-primary">
            {coursesBlock?.title || 'Наши курсы обучения'}
          </h2>
          <div className="w-20 h-1 bg-accent mx-auto"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {coursesBlock?.content || 'Выберите подходящую категорию и начните обучение'}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {courses.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              <p>Курсы скоро появятся</p>
            </div>
          ) : (
            courses.map((course) => {
              const IconComponent = course.icon;
              return (
                <Card 
                  key={course.id} 
                  className="relative transition-all duration-300 hover:shadow-lg hover:-translate-y-2"
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl text-primary">{course.title}</CardTitle>
                    {course.category && (
                      <p className="text-sm text-accent font-medium">{course.category}</p>
                    )}
                    <p className="text-muted-foreground text-sm">{course.subtitle}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {course.price && (
                      <div className="text-center">
                        <div className="text-3xl text-accent mb-2">{course.price}</div>
                        <div className="text-sm text-muted-foreground">за полный курс</div>
                      </div>
                    )}
                    <div className="flex justify-center text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-primary">Описание:</h4>
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
            })
          )}
        </div>
      </div>
    </section>
  );
}