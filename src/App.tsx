/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  ChevronRight, 
  Users, 
  Briefcase, 
  Award, 
  Clock,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  Plus,
  Minus,
  User,
  Sparkles
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from './lib/utils';
import HeroBackground from './components/HeroBackground';
import ThemeToggle from './components/ThemeToggle';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CompetitionRules from './pages/CompetitionRules';

import maiLogo from './static/mai_full.svg';
import faLogo from './static/fa_full.png';
import psbLogo from './static/PSB_logo_original_png.png';
import vitLogo from './static/vkusnoitochka.png';
import t1Logo from './static/T1_Logo.png';
import yandexCloudLogo from './static/yc_logo.png';

// --- Types & Schemas ---

const registrationSchema = z.object({
  lastName: z.string().min(2, 'Минимум 2 символа'),
  firstName: z.string().min(2, 'Минимум 2 символа'),
  middleName: z.string().optional(),
  email: z.string().email('Некорректный email'),
  phone: z.string().regex(/^\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}$/, 'Формат: +7 (999) 999-99-99'),
  telegram: z.string().min(2, 'Минимум 2 символа').regex(/^@?[\w\d_]{5,32}$/, 'Некорректный никнейм'),
  birthDate: z.string().refine((date) => {
    const age = (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return age >= 18;
  }, 'Вам должно быть 18+ лет'),
  university: z.enum(['МАИ', 'Финуниверситет']),
  maiFaculty: z.string().optional(),
  maiGroup: z.string().optional(),
  finGroup: z.string().optional(),
  skills: z.array(z.string()).min(1, 'Выберите хотя бы один навык'),
  motivation: z.string().min(50, 'Напишите подробнее (минимум 50 символов)'),
  consent: z.boolean().refine(val => val === true, 'Необходимо согласие на обработку данных'),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

const PARTNERS = [
    {
    name: 'ИТ-холдинг Т1',
    logo: t1Logo,
    case: 'В разработке',
    description: 'Один из крупнейших российских ИТ-холдингов, специализирующийся на интеграции, разработке программного обеспечения, искусственном интеллекте и инфраструктурных решениях.',
  },
  {
    name: 'Банк ПСБ',
    logo: psbLogo,
    case: 'Разработка системы раннего обнаружения кризисов ликвидности.',
    description: 'Системообразующий российский банк, опорный банк для оборонно-промышленного комплекса России. Лидер в области финтех-инноваций и поддержки госсектора.',
  },
  {
    name: 'Технологии — и точка',
    logo: vitLogo,
    case: 'Прогнозирование продаж новых продуктов сети.',
    description: 'Дочерняя ИТ-компания сети ресторанов «Вкусно — и точка». Создана для разработки цифровых решений, автоматизации процессов и поддержки технологической инфраструктуры сети.',
  }
];

const TIMELINE = [
  { 
    stage: 'Регистрация',
    date: '1 апреля', 
    title: 'Открытие регистрации', 
    desc: 'Начало приема заявок от студентов.',
    details: 'Регистрация проходит через официальный сайт. Вам необходимо заполнить анкету и прикрепить портфолио проектов (если есть).'
  },
  { 
    stage: 'Регистрация',
    date: '20 апреля', 
    title: 'Закрытие регистрации', 
    desc: 'Последний день для подачи заявки.',
    details: 'После 23:59 по московскому времени прием заявок будет автоматически прекращен. Убедитесь, что все поля заполнены корректно.'
  },
  { 
    stage: 'Отбор',
    date: '21–25 апреля', 
    title: 'Отбор', 
    desc: 'Рассмотрение заявок и собеседования.',
    details: 'Экспертная комиссия оценивает мотивацию и технический бэкграунд. В некоторых случаях мы приглашаем на короткое онлайн-интервью.'
  },
  { 
    stage: 'Отбор',
    date: '26 апреля', 
    title: 'Финальные списки', 
    desc: 'Объявление участников.',
    details: 'Списки публикуются на сайте и в Telegram-канале школы. Все участники получат подтверждение на электронную почту.'
  },
  { 
    stage: 'Школа',
    date: '8 мая', 
    title: 'День заезда', 
    desc: 'Открытие, презентация кейсов.',
    details: 'Трансфер из Москвы в УОК «Лесное озеро», расселение, приветственный обед и официальная церемония открытия с участием партнеров.'
  },
  { 
    stage: 'Школа',
    date: '9–11 мая', 
    title: 'Проектная работа', 
    desc: 'Мастер-классы, чек-поинты.',
    details: 'Интенсивная работа в командах. Каждый день — консультации с менторами и образовательные лекции от экспертов индустрии.'
  },
  { 
    stage: 'Школа',
    date: '12 мая', 
    title: 'Финал', 
    desc: 'Защиты проектов и награждение.',
    details: 'Презентация решений перед жюри. Награждение победителей ценными призами и сертификатами.'
  },
  { 
    stage: 'Школа',
    date: '13 мая', 
    title: 'Отъезд', 
    desc: 'Завершение школы.',
    details: 'Завтрак, прощание с командой и организованный трансфер до Москвы.'
  },
];

const EXPERTS = [
  { name: 'Александр Волков', role: 'Lead Data Scientist', company: 'Технологии будущего', img: 'https://picsum.photos/seed/expert1/300/300' },
  { name: 'Екатерина Морозова', role: 'AI Research Director', company: 'Цифровые решения', img: 'https://picsum.photos/seed/expert2/300/300' },
  { name: 'Дмитрий Лебедев', role: 'Senior ML Engineer', company: 'Инновационные системы', img: 'https://picsum.photos/seed/expert3/300/300' },
  { name: 'Анна Григорьева', role: 'Product Manager', company: 'Технологии развития', img: 'https://picsum.photos/seed/expert4/300/300' },
  { name: 'Максим Соколов', role: 'Data Architect', company: 'Аналитические платформы', img: '' },
  { name: 'Ольга Новикова', role: 'UX Research Lead', company: 'Дизайн решений', img: '' },
  { name: 'Игорь Васильев', role: 'CTO', company: 'Технологии связи', img: 'https://picsum.photos/seed/expert7/300/300' },
  { name: 'Татьяна Кузнецова', role: 'AI Ethics Specialist', company: 'Центр искусственного интеллекта', img: '' },
  { name: 'Андрей Павлов', role: 'Backend Architect', company: 'Облачные технологии', img: 'https://picsum.photos/seed/expert9/300/300' },
  { name: 'Мария Степанова', role: 'MLOps Engineer', company: 'Автоматизация процессов', img: '' },
];

const FAQ = [
  { 
    q: 'Требуется ли предварительная подготовка для участия?', 
    a: 'Предварительная подготовка не является обязательной. Для участия необходимо заполнить регистрационную форму. В отдельных случаях может проводиться дополнительное собеседование для оценки навыков и уровня подготовки участника.' 
  },
  { 
    q: 'Кто может участвовать в Школе?', 
    a: 'Участником может стать студент МАИ или Финуниверситета, который на момент проведения Школы достиг 18 лет и имеет базовые знания в области ИТ или ИИ. Мы приветствуем студентов всех курсов и факультетов, заинтересованных в развитии своих навыков и участии в проектной работе.' 
  },
  { q: 'Что с проживанием и питанием?', a: 'Проживание и питание полностью обеспечиваются организаторами на территории УОК «Лесное озеро».' },
  { q: 'Участие платное?', a: 'Участие в Школе бесплатное для прошедших отбор студентов.' },
];

const SKILLS = [
  'Python', 
  'Анализ данных (Data Science)', 
  'Машинное обучение (ML)', 
  'Нейронные сети (DL)',
  'Веб-разработка', 
  'Мобильная разработка',
  'SQL и базы данных',
  'UI/UX Дизайн', 
  'Продуктовая аналитика',
  'Управление проектами', 
  'Публичные выступления',
  'Лидерство'
];
const MAI_FACULTIES = ['Институт №1 «Авиационная техника»', 'Институт №2 «Авиационные, ракетные двигатели и энергетические установки»', 'Институт №3 «Системы управления, информатика и электроэнергетика»', 'Институт №4 «Радиоэлектроника, инфокоммуникации и информационная безопасность»', 'Институт №8 «Информационные технологии и прикладная математика»'];

// --- Components ---

const SectionTitle = ({ children, subtitle }: { children: React.ReactNode, subtitle?: string }) => (
  <div className="mb-12 md:mb-20">
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-4xl md:text-6xl font-serif italic mb-4"
    >
      {children}
    </motion.h2>
    {subtitle && (
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-muted-foreground text-lg max-w-2xl"
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

const Countdown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const target = new Date('2026-05-08T09:00:00');
    const interval = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        "дней": Math.floor(diff / (1000 * 60 * 60 * 24)),
        "часов": Math.floor((diff / (1000 * 60 * 60)) % 24),
        "минут": Math.floor((diff / 1000 / 60) % 60),
        "секунд": Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-4 md:gap-8 font-mono text-sm md:text-base">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} className="flex flex-col items-center">
          <span className="text-2xl md:text-4xl font-bold">{value.toString().padStart(2, '0')}</span>
          <span className="text-[10px] uppercase tracking-widest opacity-50">{label}</span>
        </div>
      ))}
    </div>
  );
};

function LandingPage() {
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      skills: [],
      consent: false,
    }
  });

  const selectedUniversity = watch('university');
  const selectedSkills = watch('skills');

  const onSubmit = (data: RegistrationForm) => {
    console.log('Form submitted:', data);
    alert('Заявка успешно отправлена!');
  };

  const toggleSkill = (skill: string) => {
    const current = selectedSkills || [];
    if (current.includes(skill)) {
      setValue('skills', current.filter(s => s !== skill));
    } else {
      setValue('skills', [...current, skill]);
    }
  };

  return (
    <div className="min-h-screen selection:bg-primary selection:text-white">      
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-primary z-[60] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      <section ref={heroRef} className="relative h-screen flex flex-col justify-center items-center px-6 overflow-hidden">
  <HeroBackground />

  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center max-w-5xl relative z-10"
  >
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      <span className="px-4 py-1 rounded-full border border-border text-xs font-mono uppercase tracking-widest">
        8–13 мая 2026
      </span>
      <span className="px-4 py-1 rounded-full border border-border text-xs font-mono uppercase tracking-widest">
        УОК «Лесное озеро»
      </span>
    </div>

    <div className="relative min-h-[240px] md:min-h-[320px] mb-8">
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ 
          opacity: [1, 1, 0],
          y: [0, 0, -20],
          scale: [1, 1, 0.95]
        }}
        transition={{ 
          duration: 2,
          times: [0, 0.6, 1],
          ease: "easeInOut"
        }}
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-[0.9]">
          Школа <br />
          <span className="sans-serif font-bold">
            ИТ и математического моделирования
          </span>
        </h1>
      </motion.div>

      <motion.div
        initial={{ scaleX: 0, originX: 1 }}
        animate={{ scaleX: [0, 1, 1, 0] }}
        transition={{ 
          duration: 2.5,
          times: [0, 0.4, 0.6, 1],
          delay: 1.2,
          ease: "easeInOut"
        }}
        className="absolute inset-0 bg-gradient-to-r from-background via-background to-transparent z-10"
        style={{ transformOrigin: "right" }}
      />

      <motion.div
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: [0, 1, 1, 0] }}
        transition={{ 
          duration: 2.5,
          times: [0, 0.4, 0.6, 1],
          delay: 2.2,
          ease: "easeInOut"
        }}
        className="absolute inset-0 bg-gradient-to-l from-background via-background to-transparent z-10"
        style={{ transformOrigin: "left" }}
      />

      {/* Эффект молнии/вспышки */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: [0, 1, 0],
          scale: [0.8, 2.5, 2]
        }}
        transition={{ duration: 1, delay: 2.8 }}
        className="absolute inset-0 bg-primary/30 blur-2xl rounded-full z-5"
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 3.2, ease: "easeOut" }}
        className="flex flex-col items-center justify-center relative"
      >
        <motion.span
          initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, delay: 3.8, ease: "easeOut" }}
          className="mb-3 md:absolute md:-top-8 md:-right-20 px-2.5 py-1 md:px-3 md:py-1.5 bg-gradient-to-r from-primary to-primary/80 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-full border border-primary/50 whitespace-nowrap"
        >
          New
        </motion.span>
        <div className="relative inline-block mb-4">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-[0.9]">
            Весенняя школа
          </h1>
        </div>
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-[0.9] text-center">
          <span className="font-serif italic font-normal text-primary">
            ИТ и Искусственный интеллект
          </span>
        </h1>
      </motion.div>
    </div>

    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
      Проектно-образовательный интенсив, объединяющий хакатон, форум и нетворкинг для лучших студентов.
    </p>

    <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-16">
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
        className="px-10 py-4 bg-primary text-white rounded-full font-semibold text-lg shadow-xl shadow-primary/20 cursor-pointer"
      >
        Подать заявку
      </motion.button>
      <Countdown />
    </div>
  </motion.div>

  <motion.div 
    animate={{ y: [0, 10, 0] }}
    transition={{ repeat: Infinity, duration: 2 }}
    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted-foreground"
  >
    <ChevronDown className="w-6 h-6" />
  </motion.div>
</section>

      {/* Organizers */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <p className="text-center text-[16px] uppercase tracking-widest text-muted-foreground mb-20">Организаторы</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-20 md:gap-40">
            <div className="text-center">
              <img 
                src={maiLogo} 
                alt="МАИ" 
                className="h-10 md:h-14" 
              />
            </div>
            <div className="text-center">
              <img 
                src={faLogo} 
                alt="Финансовый университет" 
                className="h-20 md:h-24" 
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-40 container mx-auto px-6">
        <SectionTitle subtitle="Школа ИТ и ИИ — это проектно-образовательный выездной интенсив, объединяющий хакатон, образовательный форум и нетворкинг. В течение нескольких дней студенты работают в командах над задачами от компаний-партнёров.">
          О мероприятии
        </SectionTitle>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-32"
        >
          <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
            <div className="relative aspect-video">
              <iframe 
                src="https://rutube.ru/play/embed/acfcaeba80cb8c68313820078cc8a743"
                className="absolute inset-0 w-full h-full border-none"
                allow="clipboard-write; autoplay"
                allowFullScreen
                title="Event video"
              />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-center m-8">Как это было в 2025</h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { val: '300+', label: 'Студентов прошли через Школу' },
            { val: '70+', label: 'Опытных кураторов и экспертов' },
            { val: '15+', label: 'Компаний поддержали нас' },
            { val: '5 лет', label: 'История проведения Школы' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-muted border border-border"
            >
              <div className="text-4xl font-bold mb-2 text-primary">{stat.val}</div>
              <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 md:py-40 bg-muted/50">
        <div className="container mx-auto px-6">
          <SectionTitle subtitle="Компании, которые поддерживают Школу и предоставляют экспертную поддержку.">
            Наши партнеры
          </SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PARTNERS.map((partner, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-background border border-border hover:shadow-xl transition-all"
              >
                <div className="h-20 mb-8 flex items-center">
                  <img src={partner.logo} alt={partner.name} className="max-h-full max-w-[160px] object-contain" />
                </div>
                <h4 className="text-xl font-bold mb-4">{partner.name}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                  {partner.description}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-20 p-8 rounded-3xl border border-dashed border-border flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Технологический партнер</p>
              <h4 className="text-2xl font-bold mb-4">Yandex Cloud</h4>
              <p className="text-muted-foreground text-sm">Один из лидеров российского рынка облачных технологий. Предоставляет инфраструктурные сервисы, инструменты для разработки, работы с данными и ИИ.</p>
            </div>
            <img src={yandexCloudLogo} alt="Yandex Cloud" className="max-h-full max-w-[160px]  object-contain" />
          </div>
        </div>
      </section>

      <section className="py-24 md:py-40 container mx-auto px-6">
        <SectionTitle subtitle="Реальные задачи от лидеров рынка. Финальные формулировки будут известны участникам только на открытии Школы.">
          Кейсы Школы
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-24">
          {PARTNERS.map((partner, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              {/* <div className="h-16 mb-8 flex items-center">
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  className="max-h-full max-w-[160px] object-contain" 
                />
              </div> */}
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4 group-hover:text-primary transition-colors">
                {partner.name}
              </p>
              <h4 className="text-3xl md:text-4xl font-serif italic leading-[1.1] group-hover:text-primary transition-colors">
                {partner.case}
              </h4>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 md:py-40 bg-background overflow-hidden">
        <div className="container mx-auto px-6">
          <SectionTitle subtitle="Путь участника от регистрации до финала. Интерактивный план мероприятий.">
            Таймлайн Школы
          </SectionTitle>
          
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] bg-border md:-translate-x-1/2" />
            
            <div className="space-y-12 md:space-y-24 relative">
              {TIMELINE.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={cn(
                    "relative flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-0",
                    i % 2 === 0 ? "md:flex-row-reverse" : ""
                  )}
                >
                  <div className="hidden md:flex flex-1 justify-center">
                    <div className={cn(
                      "flex flex-col",
                      i % 2 === 0 ? "items-start pl-12" : "items-end pr-12"
                    )}>
                      <span className="text-4xl font-mono font-bold text-primary/30 group-hover:text-primary transition-colors">
                        {item.date.split(' ')[0]}
                      </span>
                      <span className="text-xs uppercase tracking-[0.3em] font-bold opacity-50">
                        {item.date.split(' ')[1]}
                      </span>
                    </div>
                  </div>

                  <div className="absolute left-4 md:left-1/2 w-8 h-8 -translate-x-1/2 z-10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                    <div className="absolute inset-0 rounded-full border border-primary/20 scale-150" />
                  </div>

                  <div className="flex-1 w-full pl-12 md:pl-0">
                    <motion.div 
                      whileHover={{ scale: 1.02 }}
                      className={cn(
                        "p-6 md:p-8 rounded-3xl bg-muted/50 border border-border hover:border-primary/50 transition-all group cursor-default",
                        i % 2 === 0 ? "md:mr-12" : "md:ml-12"
                      )}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
                          {item.stage}
                        </span>
                        <span className="md:hidden text-xs font-mono font-bold opacity-50">
                          {item.date}
                        </span>
                      </div>
                      <h4 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {item.desc}
                      </p>
                      <div className="pt-4 border-t border-border/50">
                        <p className="text-xs text-muted-foreground/80 leading-relaxed italic">
                          {item.details}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-40 bg-muted/30">
        <div className="container mx-auto px-6">
          <SectionTitle subtitle="Наставники и эксперты, которые помогут вам в работе над проектами.">
            Эксперты
          </SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-12">
            {EXPERTS.map((expert, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden mb-4 bg-muted border border-border flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500 shadow-sm group-hover:shadow-md">
                  {expert.img ? (
                    <img src={expert.img} alt={expert.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-12 h-12 text-muted-foreground/40" />
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold leading-tight group-hover:text-primary transition-colors">{expert.name}</h4>
                  <p className="text-[11px] text-primary font-semibold uppercase tracking-wider">{expert.role}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-mono">{expert.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="register" className="py-24 md:py-40 container mx-auto px-6">
        <div className="max-w-4xl mx-auto p-8 md:p-16 rounded-[40px] bg-background border border-border shadow-2xl">
          <SectionTitle subtitle="Заполни анкету, чтобы стать частью весенней школы. Мы ищем мотивированных студентов, готовых к интенсивной работе.">
            Регистрация
          </SectionTitle>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-50">Фамилия</label>
                <input {...register('lastName')} className="w-full p-4 rounded-xl bg-muted border border-border focus:border-primary outline-none transition-all" />
                {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-50">Имя</label>
                <input {...register('firstName')} className="w-full p-4 rounded-xl bg-muted border border-border focus:border-primary outline-none transition-all" />
                {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-50">Отчество</label>
                <input {...register('middleName')} className="w-full p-4 rounded-xl bg-muted border border-border focus:border-primary outline-none transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-50">Email</label>
                <input type="email" {...register('email')} placeholder="example@mail.ru" className="w-full p-4 rounded-xl bg-muted border border-border focus:border-primary outline-none transition-all" />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-50">Телефон</label>
                <input 
                  type="tel" 
                  {...register('phone')} 
                  placeholder="+7 (999) 999-99-99" 
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.startsWith('7')) value = value.slice(1);
                    if (value.length > 10) value = value.slice(0, 10);
                    
                    let formatted = '+7';
                    if (value.length > 0) formatted += ' (' + value.slice(0, 3);
                    if (value.length > 3) formatted += ') ' + value.slice(3, 6);
                    if (value.length > 6) formatted += '-' + value.slice(6, 8);
                    if (value.length > 8) formatted += '-' + value.slice(8, 10);
                    
                    setValue('phone', formatted);
                  }}
                  className="w-full p-4 rounded-xl bg-muted border border-border focus:border-primary outline-none transition-all" 
                />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-50">Telegram</label>
                <input {...register('telegram')} placeholder="@username" className="w-full p-4 rounded-xl bg-muted border border-border focus:border-primary outline-none transition-all" />
                {errors.telegram && <p className="text-red-500 text-xs">{errors.telegram.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-50">Дата рождения</label>
                <input type="date" {...register('birthDate')} className="w-full p-4 rounded-xl bg-muted border border-border focus:border-primary outline-none transition-all" />
                {errors.birthDate && <p className="text-red-500 text-xs">{errors.birthDate.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-50">ВУЗ</label>
                <select {...register('university')} className="w-full p-4 rounded-xl bg-muted border border-border focus:border-primary outline-none transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] bg-[size:1.5em_1.5em] bg-no-repeat">
                  <option value="МАИ" className="bg-background">МАИ</option>
                  <option value="Финуниверситет" className="bg-background">Финансовый университет</option>
                </select>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {selectedUniversity === 'МАИ' ? (
                <motion.div 
                  key="mai"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-50">Институт / Факультет</label>
                    <select {...register('maiFaculty')} className="w-full p-4 rounded-xl bg-muted border border-border focus:border-primary outline-none transition-all appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_1rem_center] bg-[size:1.5em_1.5em] bg-no-repeat">
                      {MAI_FACULTIES.map(f => <option key={f} value={f} className="bg-background">{f}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-50">Учебная группа</label>
                    <input {...register('maiGroup')} placeholder="М8О-101Б-22" className="w-full p-4 rounded-xl bg-muted border border-border focus:border-primary outline-none transition-all" />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="fin"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold uppercase tracking-wider opacity-50">Учебная группа</label>
                  <input {...register('finGroup')} className="w-full p-4 rounded-xl bg-muted border border-border focus:border-primary outline-none transition-all" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider opacity-50">Ваши навыки</label>
              <div className="flex flex-wrap gap-2">
                {SKILLS.map(skill => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm border transition-all cursor-pointer",
                      selectedSkills?.includes(skill) 
                        ? "bg-primary text-white border-primary" 
                        : "bg-muted border-border hover:border-primary"
                    )}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {errors.skills && <p className="text-red-500 text-xs">{errors.skills.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-50">Почему именно тебя необходимо взять?</label>
              <textarea 
                {...register('motivation')} 
                rows={5}
                className="w-full p-4 rounded-xl bg-muted border border-border focus:border-primary outline-none transition-all resize-none"
                placeholder="Расскажите о своем опыте, проектах и ожиданиях от школы..."
              />
              {errors.motivation && <p className="text-red-500 text-xs">{errors.motivation.message}</p>}
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <input 
                  type="checkbox" 
                  {...register('consent')} 
                  className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer" 
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Я даю согласие на обработку моих персональных данных в соответствии с <Link to="/privacy" className="text-primary hover:underline">Политикой конфиденциальности</Link> и соглашаюсь с <Link to="/rules" className="text-primary hover:underline">Положением о проведении состязания</Link>.
                </p>
              </div>
              {errors.consent && <p className="text-red-500 text-xs">{errors.consent.message}</p>}
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-6 bg-primary text-white rounded-2xl font-bold text-xl shadow-xl shadow-primary/20 cursor-pointer"
            >
              Отправить заявку
            </motion.button>
          </form>
        </div>
      </section>

      <section className="py-24 md:py-40 bg-muted/30">
        <div className="container mx-auto px-6 max-w-4xl">
          <SectionTitle>Частые вопросы</SectionTitle>
          <div className="space-y-4">
            {FAQ.map((item, i) => (
              <div 
                key={i}
                className="rounded-2xl bg-background border border-border overflow-hidden"
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-6 flex items-center justify-between text-left cursor-pointer"
                >
                  <span className="font-bold">{item.q}</span>
                  {activeFaq === i ? <Minus className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5" />}
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-muted-foreground text-sm leading-relaxed"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-20 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
            <div className="max-w-xs">
              <h2 className="text-2xl font-bold mb-4 leading-tight">Весенняя школа <br />ИТ и ИИ 2026</h2>
              <p className="text-sm text-muted-foreground">Проектно-образовательный интенсив для будущих лидеров ИТ-индустрии</p>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-muted-foreground">
            <p>© 2026 Весенняя школа ИТ и ИИ <br/>Возрастное ограничение: 18+<br/></p>
            <div className="flex gap-8">
              <Link to="/privacy" className="hover:text-primary transition-colors">Политика конфиденциальности</Link>
              <Link to="/rules" className="hover:text-primary transition-colors">Положение о состязании</Link>
            </div>
          </div>
          <div className="pt-8 text-center text-[10px] uppercase tracking-widest text-muted-foreground max-w-[1000px] mx-auto">
          <p>Школа проводится с целью развития кадрового потенциала в области информационных технологий, искусственного интеллекта и математического моделирования, привлечения студентов и аспирантов к научно-проектной деятельности, а также организации долгосрочных поездок студентов, обучающихся по образовательным программам топ-уровня, для участия в обучении, исследовательских проектах и  программах с компаниями-партнерами в рамках исполнения обязательств МАИ и Финуниверситета по договорам с АНО "Аналитический центр при Правительстве Российской Федерации"</p>
        </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/rules" element={<CompetitionRules />} />
      </Routes>
    </Router>
  );
}
