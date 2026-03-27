import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Gallery = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  
  const slides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1600&h=900&fit=crop',
      title: 'Момент творчества',
      description: 'Студенты работают над инновационным проектом',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&h=900&fit=crop',
      title: 'Вдохновение',
      description: 'Каждый студент находит свой путь',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&h=900&fit=crop',
      title: 'Достижение',
      description: 'Торжественный момент выпуска',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&h=900&fit=crop',
      title: 'Наш дом',
      description: 'Кампус, где рождаются идеи',
    },
  ];

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0
    })
  };

  return (
    <div className="mb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.h3 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 md:mb-12"
      >
        Как это было?
      </motion.h3>

      {/* Main Cinematic Slider - Better proportions */}
      <div className="relative h-[50vh] sm:h-[60vh] lg:h-[65vh] max-h-[600px] rounded-2xl overflow-hidden shadow-2xl">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
            <img 
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />
            
            {/* Content overlay - always visible, not just on hover */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 bg-gradient-to-t from-black/80 to-transparent z-20">
              <motion.h4 
                key={currentSlide}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2"
              >
                {slides[currentSlide].title}
              </motion.h4>
              <motion.p
                key={`desc-${currentSlide}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-white/80 text-sm sm:text-base md:text-lg max-w-2xl"
              >
                {slides[currentSlide].description}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation buttons - smaller on mobile */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-all backdrop-blur-sm"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-all backdrop-blur-sm"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        {/* Progress indicator */}
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 sm:gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentSlide ? 1 : -1);
                setCurrentSlide(idx);
              }}
              className={`h-1 rounded-full transition-all ${
                idx === currentSlide ? 'w-6 sm:w-8 bg-white' : 'w-3 sm:w-4 bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnail strip - more compact */}
      <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 mt-6 sm:mt-8 overflow-x-auto pb-2 sm:pb-4 px-4">
        {slides.map((slide, idx) => (
          <motion.button
            key={slide.id}
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              setDirection(idx > currentSlide ? 1 : -1);
              setCurrentSlide(idx);
            }}
            className={`relative flex-shrink-0 w-16 sm:w-20 md:w-24 h-12 sm:h-14 md:h-16 rounded-lg overflow-hidden transition-all ${
              idx === currentSlide ? 'ring-2 ring-primary scale-105' : 'opacity-60 hover:opacity-100'
            }`}
          >
            <img src={slide.image} alt="" className="w-full h-full object-cover" />
          </motion.button>
        ))}
      </div>

      {/* Video Section - Better proportions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-12 sm:mt-16"
      >
        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-xl group max-w-5xl mx-auto">
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
      </motion.div>
    </div>
  );
};

export default Gallery;