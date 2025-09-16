import { ImageWithFallback } from './figma/ImageWithFallback';
import { Award, Users, Clock, Shield } from 'lucide-react';

export function About() {
  return (
    <section id="about" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl text-primary">
                О нашей автошколе
              </h2>
              <div className="w-20 h-1 bg-accent"></div>
            </div>
            
            <p className="text-lg leading-relaxed text-foreground">
              Автошкола "Машинка" работает уже более 15 лет, обучив за это время 
              свыше 500 водителей. Мы гордимся высоким качеством обучения и 
              профессионализмом наших инструкторов.
            </p>
            
            <p className="leading-relaxed text-muted-foreground">
              Наша миссия — не просто научить управлять автомобилем, а воспитать 
              ответственных участников дорожного движения. Мы используем современные 
              методики обучения и поддерживаем автопарк в идеальном состоянии.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-card rounded-lg shadow-sm">
                <Award className="w-8 h-8 text-accent" />
                <div>
                  <div className="font-medium">Лицензия</div>
                  <div className="text-sm text-muted-foreground">Официальная</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-card rounded-lg shadow-sm">
                <Users className="w-8 h-8 text-accent" />
                <div>
                  <div className="font-medium">Инструкторы</div>
                  <div className="text-sm text-muted-foreground">Сертифицированные</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-card rounded-lg shadow-sm">
                <Clock className="w-8 h-8 text-accent" />
                <div>
                  <div className="font-medium">График</div>
                  <div className="text-sm text-muted-foreground">Гибкий</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-card rounded-lg shadow-sm">
                <Shield className="w-8 h-8 text-accent" />
                <div>
                  <div className="font-medium">Гарантия</div>
                  <div className="text-sm text-muted-foreground">Качества</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1751655406956-72da5712926e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBkcml2aW5nJTIwc2Nob29sJTIwZWR1Y2F0aW9ufGVufDF8fHx8MTc1ODAyODE4MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Автошкола Машинка"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent rounded-full flex items-center justify-center shadow-lg">
              <span className="text-accent-foreground text-lg">15+</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}