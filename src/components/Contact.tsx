import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle
} from 'lucide-react';
import { useState } from 'react';
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { useBlocks } from '../contexts/BlocksContext';


export function Contact() {
  const { getBlock, loading } = useBlocks();
  const contactBlock = getBlock('contact');
  
  const contactInfo = contactBlock?.items || [
    { title: 'Телефон', value: '+7 (952) 688-22-88' },
    { title: 'Telegram', value: '+7 (952) 688-22-88' },
    { title: 'Адрес', value: 'ул. Первомайская, стр. 77, г. Екатеринбург' },
    { title: 'Время работы', value: 'Пн-Пт: 9:00-20:00' }
  ];

  const getIcon = (title: string) => {
    const lowerTitle = title?.toLowerCase() || '';
    if (lowerTitle.includes('телефон')) return Phone;
    if (lowerTitle.includes('telegram') || lowerTitle.includes('whatsapp') || lowerTitle.includes('message')) return MessageCircle;
    if (lowerTitle.includes('почта') || lowerTitle.includes('email')) return Mail;
    if (lowerTitle.includes('адрес')) return MapPin;
    if (lowerTitle.includes('время') || lowerTitle.includes('график')) return Clock;
    return Phone;
  };

  const [formData, setFormData] = useState({
    name: '',
    phone: '+7 ',
    message: ''
  });

  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [consentChecked, setConsentChecked] = useState(false);
  const [policyChecked, setPolicyChecked] = useState(false);
  const [errors, setErrors] = useState<{name?: string; phone?: string}>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Очищаем ошибку при изменении поля
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Для телефона - всегда начинается с +7
    if (name === 'phone') {
      // Убираем все не цифры, кроме +
      let filtered = value.replace(/[^\d\+]/g, '');
      
      // Если нет +7 в начале - добавляем
      if (!filtered.startsWith('+7')) {
        filtered = '+7' + filtered.replace(/\+/g, '');
      }
      
      // Форматируем: +7 (XXX) XXX-XX-XX
      const digits = filtered.replace(/\D/g, '');
      const phoneDigits = digits.slice(1); // убираем первую 7
      
      let formatted = '+7';
      if (phoneDigits.length > 0) {
        formatted += ' (' + phoneDigits.slice(0, 3);
      }
      if (phoneDigits.length > 3) {
        formatted += ') ' + phoneDigits.slice(3, 6);
      }
      if (phoneDigits.length > 6) {
        formatted += '-' + phoneDigits.slice(6, 8);
      }
      if (phoneDigits.length > 8) {
        formatted += '-' + phoneDigits.slice(8, 10);
      }
      
      setFormData(prev => ({ ...prev, phone: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors: {name?: string; phone?: string} = {};
    
    // Имя не должно быть пустым
    if (!formData.name.trim()) {
      newErrors.name = 'Введите имя';
    }
    
    // Телефон - минимум 11 цифр (с +7)
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 11) {
      newErrors.phone = 'Введите корректный номер телефона';
    }
    
    // Чекбоксы
    if (!consentChecked) {
      alert('Пожалуйста, согласитесь на обработку персональных данных');
      return false;
    }
    if (!policyChecked) {
      alert('Пожалуйста, ознакомьтесь с политикой обработки персональных данных');
      return false;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setFormStatus('loading');

    try {
      const response = await fetch('https://formspree.io/f/xdalqdwn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          message: formData.message
        })
      });

      if (response.ok) {
        setFormStatus('success');
        setFormData({ name: '', phone: '', message: '' });
      } else {
        setFormStatus('error');
      }
    } catch (error) {
      setFormStatus('error');
    }
  };

  // Если блок скрыт - не рендерим компонент
  if (contactBlock?.is_visible === false) {
    return null;
  }

  // Фильтруем только видимые контакты
  const visibleContactInfo = contactInfo.filter((item: any) => item.is_visible !== false);

  if (loading) {
    return (
      <section id="contact" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded w-1/3 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl text-primary">
            {contactBlock?.title || 'Связаться с нами'}
          </h2>
          <div className="w-20 h-1 bg-accent mx-auto"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto whitespace-pre-wrap">
            {contactBlock?.content || 'Остались вопросы? Свяжитесь с нами любым удобным способом'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl text-primary">Контактная информация</h3>
              
              <div className="space-y-4">
                {visibleContactInfo.map((item, index) => {
                  const IconComponent = getIcon(item.title);
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">{item.value}</p>
                        <p className="text-sm text-muted-foreground">{item.title}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="w-5 h-5 text-accent" />
                <span>Отправить сообщение</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Имя *</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Ваше имя"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+7 (___) ___-__-__"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">Сообщение</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Опишите ваш вопрос или пожелания..."
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
                 
                {/* Чекбоксы с модальными окнами */}
                <div className="space-y-3">
            {/* Согласие */}
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="consent" 
                checked={consentChecked}
                onCheckedChange={(checked) => setConsentChecked(checked === true)}
              />
              <Label
                htmlFor="consent"
                className="text-sm font-normal leading-snug text-gray-500"
              >
                Я согласен/на{" "}
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="underline text-gray-500 hover:text-accent"
                    >
                      на обработку персональных данных
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Обработка персональных данных</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 text-sm text-gray-700 max-h-[300px] overflow-y-auto">
                      <p>
                        Я, заполняя форму на сайте ООО «Автошкола Машинка», в соответствии с требованиями Федерального закона РФ от 27.07.2006 № 152-ФЗ «О персональных данных», подтверждаю своё согласие на обработку моих персональных данных.
Под персональными данными понимаются сведения, которые я добровольно указываю в форме:
фамилия, имя, отчество;
адрес электронной почты;
номер телефона;
иные сведения, введённые мною в форму.
Цель обработки персональных данных:
обеспечение обратной связи со мной;
предоставление информации о товарах, услугах и акциях компании;
выполнение обязательств по заключённым договорам.
Я подтверждаю, что указанные мной персональные данные являются достоверными и могут использоваться компанией ООО «Автошкола Машинка» для достижения вышеуказанных целей.
Настоящее согласие действует с момента его предоставления и до достижения целей обработки, либо до момента его отзыва мною
Я уведомлён(а), что согласие может быть отозвано в любой момент путём направления письменного уведомления на электронный адрес: ....
                      </p>
                    </div>
                  </DialogContent>
                </Dialog>
              </Label>
            </div>

            {/* Политика */}
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="policy" 
                checked={policyChecked}
                onCheckedChange={(checked) => setPolicyChecked(checked === true)}
              />
              <Label
                htmlFor="policy"
                className="text-sm font-normal leading-snug text-gray-500"
              >
                Я ознакомлен/а с{" "}
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="underline text-gray-500 hover:text-accent"
                    >
                      политикой об обработке персональных данных
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        Политика обработки персональных данных
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-2 text-sm text-gray-700 max-h-[300px] overflow-y-auto">
                      <p>
                        Политика обработки персональных данных
(для сайта ООО «Автошкола Машинка»)
Общие положения
Настоящая Политика определяет порядок обработки персональных данных пользователей сайта avmashinka.ru (далее — «Сайт») и направлена на защиту прав и свобод человека при обработке его персональных данных, включая защиту прав на неприкосновенность частной жизни, личную и семейную тайну.
Персональные данные
Под персональными данными понимаются любые сведения, относящиеся к пользователю, включая, но не ограничиваясь:
ФИО;
контактный телефон;
адрес электронной почты;
адрес проживания (если предоставлен);
иные сведения, которые пользователь добровольно предоставляет через формы на сайте.
Цели обработки персональных данных
Персональные данные обрабатываются для следующих целей:
предоставление услуг и информации пользователю;
обратная связь с пользователем;
выполнение договорных обязательств;
уведомление о новых продуктах, услугах, акциях, если пользователь дал согласие;
улучшение качества обслуживания и работы сайта.
Правовые основания обработки
Обработка персональных данных осуществляется только при наличии согласия пользователя на обработку его персональных данных, либо на основании других норм действующего законодательства.
Порядок обработки
Сбор и хранение персональных данных осуществляется законным и справедливым способом. Персональные данные:
не передаются третьим лицам без согласия пользователя, за исключением случаев, предусмотренных законом;
хранятся только в течение срока, необходимого для достижения целей обработки;
защищаются с использованием организационных и технических мер безопасности.
Права пользователя
Пользователь имеет право:
получать информацию об обработке своих персональных данных;
требовать уточнения, блокировки или удаления персональных данных;
отозвать согласие на обработку персональных данных в любое время.
Контактные данные
По всем вопросам, связанным с обработкой персональных данных, можно обращаться:
электронная почта: ...;
телефон: +7 (952) 688-22-88;
адрес компании: Г. Екатеринбург, ул. Первомайская, стр. 77, пом.2
Изменения в Политике
Компания оставляет за собой право вносить изменения в данную Политику. Новая версия вступает в силу с момента публикации на сайте.
                      </p>

                    </div>
                  </DialogContent>
                </Dialog>
              </Label>
            </div>
          </div>

          {/* Статус формы */}
          {formStatus === 'success' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              ✅ Спасибо! Ваше сообщение отправлено. Мы свяжемся с вами в ближайшее время.
            </div>
          )}

          {formStatus === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              ❌ Что-то пошло не так. Попробуйте позже или свяжитесь с нами по телефону.
            </div>
          )}

                {/* Кнопка отправки */}
                <Button
                  type="submit"
                  className="w-full bg-accent hover:bg-accent/90"
                  disabled={formStatus === 'loading'}
                >
                  {formStatus === 'loading' ? (
                    <>
                      <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      {contactBlock?.button_text || 'Отправить сообщение'}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Map Section */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-accent" />
                <span>Наше расположение</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="w-full h-64 md:h-80 bg-muted rounded-b-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <MapPin className="w-12 h-12 text-accent mx-auto" />
                  <p className="text-lg font-medium text-primary">Автошкола "Машинка"</p>
                  <p className="text-muted-foreground">{contactBlock?.map_address || 'г. Екатеринбург, ул. Первомайская, стр. 77, пом. 2'}</p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const address = contactBlock?.map_address || 'г. Екатеринбург, ул. Первомайская, стр. 77, пом. 2';
                      const encodedAddress = encodeURIComponent(address);
                      window.open(`https://yandex.ru/maps/?text=${encodedAddress}`, '_blank');
                    }}
                  >
                    Открыть в Яндекс.Карты
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}