/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence, useScroll } from 'motion/react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  ChevronRight,
  Users,
  Briefcase,
  Award,
  Clock,
  Plus,
  Minus,
  User,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from './lib/utils';
import HeroBackground from './components/HeroBackground';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CompetitionRules from './pages/CompetitionRules';

import maiLogo from './static/mai_full.svg';
import faLogo from './static/fa_full.png';
import psbLogo from './static/PSB_logo_original_png.png';
import vitLogo from './static/vkusnoitochka.png';
import t1Logo from './static/T1_Logo.png';
import yandexCloudLogo from './static/yc_logo.png';

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
  consent: z.boolean().refine((val) => val === true, 'Необходимо согласие на обработку данных'),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

const PARTNERS = [
  {
    name: 'ИТ-холдинг Т1',
    logo: t1Logo,
    case: 'В разработке',
    description:
      'Один из крупнейших российских ИТ-холдингов, специализирующийся на интеграции, разработке программного обеспечения, искусственном интеллекте и инфраструктурных решениях.',
    tone: 'blue',
  },
  {
    name: 'Банк ПСБ',
    logo: psbLogo,
    case: 'Разработка системы раннего обнаружения кризисов ликвидности.',
    description:
      'Системообразующий российский банк, опорный банк для оборонно-промышленного комплекса России. Лидер в области финтех-инноваций и поддержки госсектора.',
    tone: 'pink',
  },
  {
    name: 'Технологии - и точка',
    logo: vitLogo,
    case: 'Прогнозирование продаж новых продуктов сети.',
    description:
      'Дочерняя ИТ-компания сети "Вкусно - и точка". Создана для разработки цифровых решений, автоматизации процессов и поддержки технологической инфраструктуры сети.',
    tone: 'green',
  },
];

const TIMELINE = [
  {
    stage: 'Регистрация',
    date: '1 апреля',
    title: 'Открытие регистрации',
    desc: 'Начало приема заявок от студентов.',
    details:
      'Регистрация проходит через официальный сайт. Вам необходимо заполнить анкету и прикрепить портфолио проектов (если есть).',
  },
  {
    stage: 'Регистрация',
    date: '20 апреля',
    title: 'Закрытие регистрации',
    desc: 'Последний день для подачи заявки.',
    details:
      'После 23:59 по московскому времени прием заявок будет автоматически прекращен. Убедитесь, что все поля заполнены корректно.',
  },
  {
    stage: 'Отбор',
    date: '21-25 апреля',
    title: 'Отбор',
    desc: 'Рассмотрение заявок и собеседования.',
    details:
      'Экспертная комиссия оценивает мотивацию и технический бэкграунд. В некоторых случаях мы приглашаем на короткое онлайн-интервью.',
  },
  {
    stage: 'Отбор',
    date: '26 апреля',
    title: 'Финальные списки',
    desc: 'Объявление участников.',
    details:
      'Списки публикуются на сайте и в Telegram-канале школы. Все участники получат подтверждение на электронную почту.',
  },
  {
    stage: 'Школа',
    date: '8 мая',
    title: 'День заезда',
    desc: 'Открытие, презентация кейсов.',
    details:
      'Трансфер из Москвы в УОК "Лесное озеро", расселение, приветственный обед и официальная церемония открытия с участием партнеров.',
  },
  {
    stage: 'Школа',
    date: '9-11 мая',
    title: 'Проектная работа',
    desc: 'Мастер-классы, чек-поинты.',
    details:
      'Интенсивная работа в командах. Каждый день - консультации с менторами и образовательные лекции от экспертов индустрии.',
  },
  {
    stage: 'Школа',
    date: '12 мая',
    title: 'Финал',
    desc: 'Защиты проектов и награждение.',
    details:
      'Презентация решений перед жюри. Награждение победителей ценными призами и сертификатами.',
  },
  {
    stage: 'Школа',
    date: '13 мая',
    title: 'Отъезд',
    desc: 'Завершение школы.',
    details: 'Завтрак, прощание с командой и организованный трансфер до Москвы.',
  },
];

const TIMELINE_GROUPS = [
  {
    stage: 'Регистрация',
    tone: 'bg-blue-500 text-white',
    items: TIMELINE.filter((item) => item.stage === 'Регистрация'),
  },
  {
    stage: 'Отбор',
    tone: 'bg-pink-500 text-white',
    items: TIMELINE.filter((item) => item.stage === 'Отбор'),
  },
  {
    stage: 'Школа',
    tone: 'bg-yellow-300 text-slate-950',
    items: TIMELINE.filter((item) => item.stage === 'Школа'),
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
    a: 'Предварительная подготовка не является обязательной. Для участия необходимо заполнить регистрационную форму. В отдельных случаях может проводиться дополнительное собеседование для оценки навыков и уровня подготовки участника.',
  },
  {
    q: 'Кто может участвовать в Школе?',
    a: 'Участником может стать студент МАИ или Финуниверситета, который на момент проведения Школы достиг 18 лет и имеет базовые знания в области ИТ или ИИ. Мы приветствуем студентов всех курсов и факультетов, заинтересованных в развитии своих навыков и участии в проектной работе.',
  },
  { q: 'Что с проживанием и питанием?', a: 'Проживание и питание полностью обеспечиваются организаторами на территории УОК "Лесное озеро".' },
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
  'Лидерство',
];

const MAI_FACULTIES = [
  'Институт №1 "Авиационная техника"',
  'Институт №2 "Авиационные, ракетные двигатели и энергетические установки"',
  'Институт №3 "Системы управления, информатика и электроэнергетика"',
  'Институт №4 "Радиоэлектроника, инфокоммуникации и информационная безопасность"',
  'Институт №8 "Информационные технологии и прикладная математика"',
];

const STATS = [
  { value: '300+', label: 'Студентов прошли через Школу', color: 'bg-blue-500 text-white' },
  { value: '70+', label: 'Опытных кураторов и экспертов', color: 'bg-pink-500 text-white' },
  { value: '15+', label: 'Компаний поддержали нас', color: 'bg-green-500 text-slate-950' },
  { value: '5 лет', label: 'История проведения Школы', color: 'bg-yellow-300 text-slate-950' },
];

const featureTiles = [
  { icon: Calendar, title: '5 дней', text: 'Интенсивная программа с проектной работой.', tone: 'bg-blue-500 text-white' },
  { icon: Briefcase, title: 'Кейсы', text: 'Реальные задачи от компаний-партнеров.', tone: 'bg-pink-500 text-white' },
  { icon: Users, title: 'Команды', text: 'Участники из МАИ и Финуниверситета.', tone: 'bg-yellow-300 text-slate-950' },
  { icon: Award, title: 'Финал', text: 'Защита проектов перед жюри.', tone: 'bg-green-500 text-slate-950' },
];

const sectionClass = 'rounded-[32px] border border-slate-200 bg-white p-6 md:p-8';
const fieldClass =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-colors duration-200 placeholder:text-slate-400 focus:border-primary';

function SectionTitle({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-10 md:mb-14">
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.45 }}
        className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500"
      >
        {label}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.06em] md:text-6xl"
      >
        {title}
      </motion.h2>
      {subtitle ? (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.04 }}
          className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-600"
        >
          {subtitle}
        </motion.p>
      ) : null}
    </div>
  );
}

function LandingPage() {
  const { scrollYProgress } = useScroll();
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      university: 'МАИ',
      skills: [],
      consent: false,
    },
  });

  const selectedUniversity = watch('university');
  const selectedSkills = watch('skills');

  const onSubmit = (data: RegistrationForm) => {
    console.log('Form submitted:', data);
    alert('Заявка успешно отправлена!');
  };

  const toggleSkill = (skill: string) => {
    const current = selectedSkills || [];
    setValue(
      'skills',
      current.includes(skill) ? current.filter((item) => item !== skill) : [...current, skill],
      { shouldValidate: true },
    );
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <motion.div
        className="fixed inset-x-0 top-0 z-[70] h-1 origin-left bg-primary"
        style={{ scaleX: scrollYProgress }}
      />

      <section className="hero-screen relative flex items-center overflow-hidden border-b border-slate-200 bg-white">
        <HeroBackground />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 md:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[0.88] tracking-[-0.08em] sm:text-6xl md:text-7xl lg:text-[6.3rem]">
              Весенняя школа
              <span className="block text-primary">ИТ и ИИ</span>
              <span className="block">2026</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
              Проектно-образовательный интенсив, объединяющий хакатон, форум и нетворкинг для лучших студентов.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-semibold text-white"
              >
                Подать заявку
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-8 py-4 text-base font-semibold"
              >
                О мероприятии
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="grid gap-4"
          >
            <div className="rounded-[32px] bg-blue-500 p-6 text-white">
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/70">
                Даты проведения
              </p>
              <h2 className="mt-3 text-5xl font-semibold tracking-[-0.08em]">
                8-13 мая
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/78">
                Выездная школа пройдет в течение шести дней с проектной работой,
                лекциями, мастер-классами и финальной защитой.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {featureTiles.map(({ icon: Icon, title, text, tone }) => (
                <div key={title} className={cn('rounded-[28px] p-5', tone)}>
                  <Icon className="h-6 w-6" />
                  <h3 className="mt-5 text-2xl font-semibold tracking-[-0.05em]">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed opacity-85">{text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <main className="pb-12">
        <section className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <div className="grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-[32px] p-8 text-black">
              <p className="text-[11px] uppercase tracking-[0.28em] text-black/75">Организаторы</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.06em] md:text-4xl">
                МАИ и Финансовый университет
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className={cn(sectionClass, 'flex min-h-[170px] items-center justify-center')}>
                <img src={maiLogo} alt="МАИ" className="max-h-14 w-auto" />
              </div>
              <div className={cn(sectionClass, 'flex min-h-[170px] items-center justify-center')}>
                <img src={faLogo} alt="Финансовый университет" className="max-h-24 w-auto" />
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <SectionTitle
            label="О школе"
            title="Выездной интенсив, в котором важны и идеи, и темп работы"
            subtitle="Школа ИТ и ИИ - это проектно-образовательный выездной интенсив, объединяющий хакатон, образовательный форум и нетворкинг. В течение нескольких дней студенты работают в командах над задачами от компаний-партнеров."
          />

          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
              className="rounded-[32px] border border-slate-200 bg-white p-4"
            >
              <div className="aspect-video overflow-hidden rounded-[26px]">
                <iframe
                  src="https://rutube.ru/play/embed/acfcaeba80cb8c68313820078cc8a743"
                  className="h-full w-full border-none"
                  allow="clipboard-write; autoplay"
                  allowFullScreen
                  title="Event video"
                />
              </div>
              <div className="mt-4 flex items-center justify-between gap-4 px-2 text-slate-950">
                <div>
                  <p className="text-sm text-slate-500">Как это было в 2025</p>
                  <h3 className="text-xl font-semibold tracking-[-0.04em]">Весенняя школа ИТ и ИИ</h3>
                </div>
                <div className="rounded-full bg-yellow-300 px-4 py-2 text-sm font-semibold text-slate-950">Видео</div>
              </div>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              {STATS.map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5 }}
                  className={cn('rounded-[32px] p-6 md:p-7', stat.color)}
                >
                  <p className="text-5xl font-semibold tracking-[-0.08em]">{stat.value}</p>
                  <p className="mt-3 text-sm leading-relaxed opacity-85">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="partners" className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <SectionTitle
            label="Партнеры"
            title="Компании, которые помогают школе содержанием и задачами"
            subtitle="Компании, которые поддерживают Школу и предоставляют экспертную поддержку."
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {PARTNERS.map((partner) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5 }}
                className={cn(
                  'rounded-[32px] p-7',
                  partner.tone === 'blue'
                    ? 'bg-blue-500 text-white'
                    : partner.tone === 'pink'
                      ? 'bg-pink-500 text-white'
                      : 'bg-green-500 text-slate-950',
                )}
              >
                <div className="flex min-h-20 items-center">
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className={cn(
                      'max-h-12 max-w-[160px] object-contain',
                      partner.tone === 'green' ? '' : 'brightness-0 invert',
                    )}
                  />
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-[-0.05em]">{partner.name}</h3>
                <p className="mt-4 text-sm leading-relaxed opacity-90">{partner.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="mt-4 rounded-[32px] border border-slate-200 bg-white p-8 text-slate-950"
          >
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Технологический партнер</p>
                <h3 className="mt-4 text-3xl font-semibold tracking-[-0.06em]">Yandex Cloud</h3>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  Один из лидеров российского рынка облачных технологий. Предоставляет инфраструктурные сервисы, инструменты для разработки, работы с данными и ИИ.
                </p>
              </div>
              <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-6">
                <img src={yandexCloudLogo} alt="Yandex Cloud" className="max-h-14 w-auto object-contain" />
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <SectionTitle
            label="Кейсы"
            title="Реальные задачи от лидеров рынка"
            subtitle="Финальные формулировки будут известны участникам только на открытии Школы."
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {PARTNERS.map((partner, index) => (
              <motion.div
                key={partner.name}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5 }}
                className={cn(
                  sectionClass,
                  index === 0
                    ? 'border-l-[10px] border-l-blue-500'
                    : index === 1
                      ? 'border-l-[10px] border-l-pink-500'
                      : 'border-l-[10px] border-l-green-500',
                )}
              >
                <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">{partner.name}</p>
                <h3 className="mt-6 text-3xl font-semibold leading-[1.02] tracking-[-0.05em]">{partner.case}</h3>
                <div className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Задача партнера
                  <ChevronRight className="h-4 w-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="timeline" className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <SectionTitle
            label="Таймлайн"
            title="Путь участника от регистрации до финала"
            subtitle="Программа разбита на этапы: регистрация, отбор и выездная школа."
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {TIMELINE_GROUPS.map((group) => (
              <motion.div
                key={group.stage}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.5 }}
                className="overflow-hidden rounded-[32px] border border-slate-200 bg-white"
              >
                <div className={cn('px-6 py-5 md:px-7', group.tone)}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] opacity-80">
                    Этап
                  </p>
                  <h3 className="mt-3 text-3xl font-semibold tracking-[-0.06em]">
                    {group.stage}
                  </h3>
                </div>

                <div className="space-y-4 p-6 md:p-7">
                  {group.items.map((item) => (
                    <div key={`${item.title}-${item.date}`} className="border-l-4 border-slate-900 pl-4">
                      <p className="text-sm font-semibold text-slate-500">{item.date}</p>
                      <h4 className="mt-2 text-xl font-semibold tracking-[-0.04em]">{item.title}</h4>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                      <p className="mt-3 text-sm leading-relaxed text-slate-500">{item.details}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24">
          <SectionTitle
            label="Эксперты"
            title="Эксперты, с которыми вы будете работать во время школы"
            subtitle="Эксперты школы сопровождают участников в проектной работе."
          />

          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45 }}
              className="rounded-[32px] border border-slate-200 bg-white p-8"
            >
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Экспертный трек</p>
              <h3 className="mt-4 text-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-slate-950">
                Люди, которые помогают командам дойти до финала
              </h3>
              <p className="mt-5 text-sm leading-relaxed text-slate-600">
                В течение всей школы участники работают рядом с людьми из data science, ML, продуктовой разработки, архитектуры и UX.
              </p>
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] bg-slate-50 px-4 py-4">
                  <p className="text-3xl font-semibold tracking-[-0.06em] text-slate-950">10+</p>
                  <p className="mt-1 text-sm text-slate-500">экспертов</p>
                </div>
                <div className="rounded-[24px] bg-slate-50 px-4 py-4">
                  <p className="text-3xl font-semibold tracking-[-0.06em] text-slate-950">3</p>
                  <p className="mt-1 text-sm text-slate-500">ключевых направления</p>
                </div>
              </div>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-2">
              {EXPERTS.map((expert, index) => (
                <motion.article
                  key={expert.name}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45 }}
                  className={cn(
                    'rounded-[32px] border border-slate-200 bg-white p-6',
                    index % 5 === 0 ? 'md:col-span-2' : '',
                  )}
                >
                  <div className={cn('flex gap-5', index % 5 === 0 ? 'flex-col sm:flex-row sm:items-center' : 'items-start')}>
                    <div className={cn(
                      'flex shrink-0 items-center justify-center overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50',
                      index % 5 === 0 ? 'h-24 w-24' : 'h-18 w-18',
                    )}>
                      {expert.img ? (
                        <img
                          src={expert.img}
                          alt={expert.name}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <User className="h-8 w-8 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className={cn('flex flex-col gap-3', index % 5 === 0 ? 'sm:flex-row sm:items-start sm:justify-between' : '')}>
                        <div>
                          <h3 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                            {expert.name}
                          </h3>
                          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                            {expert.role}
                          </p>
                        </div>
                        <div className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                          {expert.company}
                        </div>
                      </div>

                      <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
                        Эксперт сопровождает команды в работе над проектами, помогает с проверкой гипотез, выбором решений и подготовкой к финальной защите.
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="register" className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-24">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 md:p-10 lg:p-14">
            <SectionTitle
              label="Регистрация"
              title="Заполни анкету и стань частью весенней школы"
              subtitle="Заполни анкету, чтобы стать частью весенней школы. Мы ищем мотивированных студентов, готовых к интенсивной работе."
            />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Фамилия</label>
                  <input {...register('lastName')} className={fieldClass} />
                  {errors.lastName ? <p className="text-xs text-red-400">{errors.lastName.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Имя</label>
                  <input {...register('firstName')} className={fieldClass} />
                  {errors.firstName ? <p className="text-xs text-red-400">{errors.firstName.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Отчество</label>
                  <input {...register('middleName')} className={fieldClass} />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Email</label>
                  <input type="email" {...register('email')} placeholder="example@mail.ru" className={fieldClass} />
                  {errors.email ? <p className="text-xs text-red-400">{errors.email.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Телефон</label>
                  <input
                    type="tel"
                    {...register('phone')}
                    placeholder="+7 (999) 999-99-99"
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.startsWith('7')) value = value.slice(1);
                      if (value.length > 10) value = value.slice(0, 10);

                      let formatted = '+7';
                      if (value.length > 0) formatted += ` (${value.slice(0, 3)}`;
                      if (value.length > 3) formatted += `) ${value.slice(3, 6)}`;
                      if (value.length > 6) formatted += `-${value.slice(6, 8)}`;
                      if (value.length > 8) formatted += `-${value.slice(8, 10)}`;

                      setValue('phone', formatted, { shouldValidate: true });
                    }}
                    className={fieldClass}
                  />
                  {errors.phone ? <p className="text-xs text-red-400">{errors.phone.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Telegram</label>
                  <input {...register('telegram')} placeholder="@username" className={fieldClass} />
                  {errors.telegram ? <p className="text-xs text-red-400">{errors.telegram.message}</p> : null}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Дата рождения</label>
                  <input type="date" {...register('birthDate')} className={fieldClass} />
                  {errors.birthDate ? <p className="text-xs text-red-400">{errors.birthDate.message}</p> : null}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">ВУЗ</label>
                  <select {...register('university')} className={fieldClass}>
                    <option value="МАИ">МАИ</option>
                    <option value="Финуниверситет">Финансовый университет</option>
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
                    transition={{ duration: 0.25 }}
                    className="grid gap-5 md:grid-cols-2"
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Институт / Факультет</label>
                      <select {...register('maiFaculty')} className={fieldClass}>
                        {MAI_FACULTIES.map((faculty) => (
                          <option key={faculty} value={faculty}>
                            {faculty}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Учебная группа</label>
                      <input {...register('maiGroup')} placeholder="М8О-101Б-22" className={fieldClass} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="fin"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-2"
                  >
                    <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Учебная группа</label>
                    <input {...register('finGroup')} className={fieldClass} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Ваши навыки</label>
                <div className="flex flex-wrap gap-3">
                  {SKILLS.map((skill, index) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150',
                        selectedSkills?.includes(skill)
                          ? index % 4 === 0
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : index % 4 === 1
                              ? 'border-pink-500 bg-pink-500 text-white'
                              : index % 4 === 2
                                ? 'border-green-500 bg-green-500 text-slate-950'
                                : 'border-yellow-300 bg-yellow-300 text-slate-950'
                          : 'border-slate-200 bg-slate-50 text-slate-700',
                      )}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
                {errors.skills ? <p className="text-xs text-red-400">{errors.skills.message}</p> : null}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Почему именно тебя необходимо взять?</label>
                <textarea
                  {...register('motivation')}
                  rows={5}
                  className={cn(fieldClass, 'resize-none')}
                  placeholder="Расскажите о своем опыте, проектах и ожиданиях от школы..."
                />
                {errors.motivation ? <p className="text-xs text-red-400">{errors.motivation.message}</p> : null}
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <label className="flex items-start gap-4">
                  <input type="checkbox" {...register('consent')} className="mt-1 h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary" />
                  <span className="text-sm leading-relaxed text-slate-600">
                    Я даю согласие на обработку моих персональных данных в соответствии с{' '}
                    <Link to="/privacy" className="text-blue-400 hover:underline">
                      Политикой конфиденциальности
                    </Link>{' '}
                    и соглашаюсь с{' '}
                    <Link to="/rules" className="text-blue-400 hover:underline">
                      Положением о проведении состязания
                    </Link>
                    .
                  </span>
                </label>
                {errors.consent ? <p className="mt-3 text-xs text-red-400">{errors.consent.message}</p> : null}
              </div>

              <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-5 text-lg font-semibold text-slate-950">
                Отправить заявку
                <ChevronRight className="h-5 w-5" />
              </button>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16 md:px-8 md:py-24">
          <SectionTitle label="FAQ" title="Частые вопросы" />
          <div className="space-y-4">
            {FAQ.map((item, index) => (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.45 }}
                className={sectionClass}
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="text-lg font-semibold tracking-[-0.03em]">{item.q}</span>
                  {activeFaq === index ? <Minus className="h-5 w-5 text-primary" /> : <Plus className="h-5 w-5 text-slate-500" />}
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === index ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden pt-4 text-sm leading-relaxed text-slate-600"
                    >
                      {item.a}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-10 text-slate-950 md:px-8 md:py-14">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">Весенняя школа 2026</p>
              <h2 className="mt-4 text-4xl font-semibold leading-[0.95] tracking-[-0.06em]">
                Весенняя школа
                <br />
                ИТ и ИИ 2026
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">
                Проектно-образовательный интенсив для будущих лидеров ИТ-индустрии
              </p>
            </div>
            <div className="flex flex-col gap-3 text-sm text-slate-600">
              <Link to="/privacy" className="hover:text-slate-950">Политика конфиденциальности</Link>
              <Link to="/rules" className="hover:text-slate-950">Положение о состязании</Link>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6 text-xs leading-relaxed text-slate-500">
            <p>© 2026 Весенняя школа ИТ и ИИ. Возрастное ограничение: 18+.</p>
            <p className="mt-3 max-w-5xl">
              Школа проводится с целью развития кадрового потенциала в области информационных технологий, искусственного интеллекта и математического моделирования, привлечения студентов и аспирантов к научно-проектной деятельности, а также организации долгосрочных поездок студентов, обучающихся по образовательным программам топ-уровня, для участия в обучении, исследовательских проектах и программах с компаниями-партнерами в рамках исполнения обязательств МАИ и Финуниверситета по договорам с АНО "Аналитический центр при Правительстве Российской Федерации".
            </p>
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
