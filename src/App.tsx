import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, animate, motion, useInView, useScroll, useSpring, useTransform } from 'motion/react';
import Lenis from 'lenis';

type IconName =
  | 'arrow'
  | 'arrowUp'
  | 'calendar'
  | 'check'
  | 'close'
  | 'compass'
  | 'menu'
  | 'phone'
  | 'search';

type Frame = {
  src: string;
  eyebrow: string;
  title: string;
  detail: string;
  location: string;
  model: string;
};

type Car = {
  name: string;
  arabicName: string;
  type: string;
  price: string;
  year: string;
  image: string;
  tag?: string;
  engine: string;
  power: string;
  exterior: string[];
  interior: string[];
};

const frames: Frame[] = [
  {
    src: '/assets/babylon-hero.png',
    eyebrow: '01 / بوابة عشتار',
    title: 'من بوابة عشتار،\nيبدأ الطريق.',
    detail: 'إرث سبعة آلاف عام، بمحرّك اليوم.',
    location: 'بوابة عشتار — بابل',
    model: 'AURUM ISHTAR',
  },
  {
    src: '/assets/babylon-showroom.png',
    eyebrow: '02 / بلاط الملوك',
    title: 'فخامة تليق\nبورثة بابل.',
    detail: 'كل تفصيلة منحوتة، كما نُحتت الأسود على الآجر المزجّج.',
    location: 'صالة أوروم — بغداد',
    model: 'AURUM BABEL',
  },
  {
    src: '/assets/babylon-ziggurat.png',
    eyebrow: '03 / زقّورة أور',
    title: 'صُمّمت لتصعد\nأعلى.',
    detail: 'من سهول الرافدين، إلى أي أفقٍ تختاره.',
    location: 'زقّورة أور — ذي قار',
    model: 'AURUM ZIQQURA GT',
  },
];

const cars: Car[] = [
  { name: 'AURUM ISHTAR', arabicName: 'عشتار', type: 'سيدان ملكية', price: '78,500,000', year: '2025', image: '/assets/babylon-hero.png', tag: 'الأكثر طلباً', engine: 'V6 / 3.0L توربو', power: '470 حصان', exterior: ['إضاءة LED Matrix', 'جنوط ألماسية 21 بوصة', 'طلاء أزرق لازوردي لامع'], interior: ['جلد نابا بلون الرمل', 'شاشة قيادة 14.5 بوصة', 'نظام صوت محيطي فاخر'] },
  { name: 'AURUM BABEL', arabicName: 'بابل', type: 'إصدار خاص', price: '86,900,000', year: '2025', image: '/assets/babylon-showroom.png', tag: 'حصري', engine: 'V8 / 4.0L توين توربو', power: '550 حصان', exterior: ['حزمة Black Chrome', 'سقف بانورامي ذكي', 'أبواب إغلاق كهربائي'], interior: ['مقاعد جلدية بتطريز عشتار', 'تبريد وتسخين وتدليك', 'كونسول خلفي تنفيذي'] },
  { name: 'AURUM ZIQQURA GT', arabicName: 'زقّورة', type: 'جراند تورر', price: '94,200,000', year: '2024', image: '/assets/babylon-ziggurat.png', engine: 'V8 / 4.4L', power: '610 حصان', exterior: ['كربون فايبر رياضي', 'فرامل خزفية', 'عادم رياضي مزدوج'], interior: ['مقصورة Alcantara', 'مقاعد رياضية مريحة', 'شحن لاسلكي ومساعد قيادة'] },
];

const filters = ['الكل', 'سيدان', 'إصدار خاص', 'جراند تورر'];

const marqueeItems = ['𒀭', 'بــابــل', '𒆠', 'عشــتار', '𒈗', 'حمّورابي', '𒌓', 'دجلة والفرات', '𒐕', 'زقّورة أور', '𒄑', 'بوابة عشتار'];

const easing = [0.22, 1, 0.36, 1] as const;

/* ---------- icons ---------- */

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'arrow':
      return <svg {...common}><path d="M5 12h13M13 6l6 6-6 6" /></svg>;
    case 'arrowUp':
      return <svg {...common}><path d="M12 19V5M6 11l6-6 6 6" /></svg>;
    case 'calendar':
      return <svg {...common}><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M16 3v4M8 3v4M3.5 10h17" /></svg>;
    case 'check':
      return <svg {...common}><path d="m5 12 4.3 4L19 7" /></svg>;
    case 'close':
      return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
    case 'compass':
      return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="m14.8 9.2-1.9 3.7-3.7 1.9 1.9-3.7 3.7-1.9Z" /></svg>;
    case 'menu':
      return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    case 'phone':
      return <svg {...common}><path d="M6.5 4.5 9 4l1.7 4-1.8 1.6a14.7 14.7 0 0 0 5.5 5.5l1.6-1.8 4 1.7-.5 2.5c-.2 1.1-1.2 1.8-2.3 1.7C10.3 18.4 5.6 13.7 4.8 6.8c-.1-1.1.6-2.1 1.7-2.3Z" /></svg>;
    case 'search':
      return <svg {...common}><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.2 4.2" /></svg>;
  }
}

/* ---------- babylonian ornaments ---------- */

function ZigguratGlyph({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <rect x="13" y="5" width="6" height="5" />
      <rect x="10" y="11.5" width="12" height="5" />
      <rect x="7" y="18" width="18" height="5" />
      <rect x="4" y="24.5" width="24" height="4" />
    </svg>
  );
}

function IshtarStar({ size = 120, className = '' }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
      <path d="M50 0 57 43 100 50 57 57 50 100 43 57 0 50 43 43Z" />
      <path d="M50 0 57 43 100 50 57 57 50 100 43 57 0 50 43 43Z" transform="rotate(45 50 50)" opacity="0.5" />
      <circle cx="50" cy="50" r="6.5" />
    </svg>
  );
}

function Rosette({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse key={i} cx="20" cy="11" rx="4.2" ry="7.4" transform={`rotate(${i * 45} 20 20)`} />
        ))}
      </g>
      <circle cx="20" cy="20" r="3.2" fill="currentColor" />
    </svg>
  );
}

function ZigguratDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`zg-divider ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1440 96" preserveAspectRatio="none">
        <path d="M0 0h1440v30H872v16h-26v16h-26v16h-26v18H646v-18h-26v-16h-26v-16h-26V30H0Z" />
      </svg>
      <span className="zg-divider__star"><IshtarStar size={26} /></span>
    </div>
  );
}

function BabylonMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className={`brand-mark ${inverse ? 'brand-mark--inverse' : ''}`} aria-label="Aurum Motors — بابل">
      <span className="brand-mark__glyph"><ZigguratGlyph size={26} /></span>
      <span className="brand-mark__word">AURUM<small>بــابــل · العــراق</small></span>
    </div>
  );
}

/* ---------- motion helpers ---------- */

function Reveal({ children, delay = 0, y = 36, className = '' }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.9, delay, ease: easing }}
    >
      {children}
    </motion.div>
  );
}

function CountUp({ value, suffix }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const controls = animate(0, value, {
      duration: 2,
      ease: easing,
      onUpdate: (latest) => { if (ref.current) ref.current.textContent = String(Math.round(latest)); },
    });
    return () => controls.stop();
  }, [inView, value]);
  return (
    <strong className="count-figure">
      <span ref={ref}>0</span>
      {suffix && <span className="count-suffix">{suffix}</span>}
    </strong>
  );
}

function CuneiformMarquee() {
  const row = (key: string) => (
    <div className="marquee__row" key={key} aria-hidden={key === 'b'}>
      {marqueeItems.map((item, index) => (
        <span className="marquee__item" key={`${key}-${index}`}>
          <span className={/[\u{12000}-\u{123FF}\u{12400}-\u{1247F}]/u.test(item) ? 'marquee__cuneiform' : 'marquee__word'}>{item}</span>
          <span className="marquee__rosette"><Rosette size={16} /></span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee" dir="ltr">
      <motion.div
        className="marquee__track"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 38, ease: 'linear', repeat: Infinity }}
      >
        {row('a')}
        {row('b')}
      </motion.div>
    </div>
  );
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

/* ---------- app ---------- */

function App() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heritageRef = useRef<HTMLElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const scrollProgressRef = useRef(0);
  const renderRef = useRef<(progress: number) => void>(() => undefined);
  const lenisRef = useRef<Lenis | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'staff' | 'manager'>('staff');
  const [signedIn, setSignedIn] = useState<string | null>(() => localStorage.getItem('aurum-role'));
  const [authError, setAuthError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeFilter, setActiveFilter] = useState('الكل');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollYProgress } = useScroll();
  const pageProgress = useSpring(scrollYProgress, { stiffness: 130, damping: 28, mass: 0.4 });

  const { scrollYProgress: heritageProgress } = useScroll({ target: heritageRef, offset: ['start end', 'end start'] });
  const heritageY = useTransform(heritageProgress, [0, 1], ['-14%', '14%']);

  const dust = useMemo(
    () =>
      Array.from({ length: 20 }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        size: 2 + Math.random() * 3.2,
        delay: Math.random() * 14,
        duration: 12 + Math.random() * 16,
        opacity: 0.2 + Math.random() * 0.55,
      })),
    [],
  );

  const scrollTo = useCallback((id: string) => {
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(`#${id}`, { duration: 1.6 });
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
    setSearchOpen(false);
  }, []);

  /* smooth scrolling */
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenisRef.current = lenis;
    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  /* preload cinematic frames */
  useEffect(() => {
    const advance = (index: number) => {
      setLoadedCount((current) => Math.max(current, index + 1));
      renderRef.current(scrollProgressRef.current);
    };
    const nextImages = frames.map((frame, index) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = frame.src;
      image.onload = () => advance(index);
      image.onerror = () => advance(index);
      return image;
    });
    imagesRef.current = nextImages;
    return () => {
      nextImages.forEach((image) => { image.onload = null; image.onerror = null; });
    };
  }, []);

  /* hero canvas scroll-sequence */
  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = heroRef.current;
    if (!canvas || !hero) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    let animationFrame = 0;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * ratio);
      canvas.height = Math.round(window.innerHeight * ratio);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      renderRef.current(scrollProgressRef.current);
    };

    const drawCover = (image: HTMLImageElement, alpha: number, slide: number, zoom: number) => {
      if (!image || !image.complete || !image.naturalWidth) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * zoom;
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const x = (width - drawWidth) / 2 + slide;
      const y = (height - drawHeight) / 2;
      context.globalAlpha = alpha;
      context.drawImage(image, x, y, drawWidth, drawHeight);
    };

    renderRef.current = (value: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#050d1f';
      context.fillRect(0, 0, width, height);

      const stage = value * (frames.length - 1);
      const index = Math.min(frames.length - 1, Math.floor(stage));
      const transition = stage - index;
      const current = imagesRef.current[index];
      const next = imagesRef.current[index + 1];
      const pan = Math.sin(value * Math.PI) * -20;
      drawCover(current, 1, pan, 1.08 + value * 0.045);
      if (next && transition > 0) {
        drawCover(next, transition, pan + 12 * transition, 1.08 + value * 0.045);
      }
      context.globalAlpha = 1;
    };

    const onScroll = () => {
      const bounds = hero.getBoundingClientRect();
      const range = Math.max(1, hero.offsetHeight - window.innerHeight);
      const value = clamp(-bounds.top / range);
      scrollProgressRef.current = value;
      setProgress(value);
      setScrolled(window.scrollY > 24);
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => renderRef.current(value));
    };

    resize();
    onScroll();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  /* lock body scroll while the modal is open */
  useEffect(() => {
    if (!modalOpen) return;
    lenisRef.current?.stop();
    document.body.style.overflow = 'hidden';
    return () => {
      lenisRef.current?.start();
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  const stage = progress * (frames.length - 1);
  const activeFrame = Math.min(frames.length - 1, Math.round(stage));
  const filteredCars = cars.filter((car) => {
    if (activeFilter === 'الكل') return true;
    if (activeFilter === 'سيدان') return car.type === 'سيدان ملكية';
    if (activeFilter === 'إصدار خاص') return car.type === 'إصدار خاص';
    return car.type === 'جراند تورر';
  });

  const onBookingSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSubmitted(false);
  };

  const onAuthSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get('email') || '');
    const password = String(data.get('password') || '');
    const valid = authRole === 'manager' ? email === 'manager@aurum.iq' && password === 'babil2025' : email === 'staff@aurum.iq' && password === 'aurum123';
    if (!valid) { setAuthError('بيانات الدخول غير صحيحة. جرّب الحساب التجريبي أدناه.'); return; }
    const role = authRole === 'manager' ? 'manager' : 'staff';
    localStorage.setItem('aurum-role', role);
    setSignedIn(role);
    setAuthOpen(false);
  };

  const signOut = () => { localStorage.removeItem('aurum-role'); setSignedIn(null); setAuthOpen(false); };

  return (
    <main className="site-shell">
      <motion.div className="page-progress" style={{ scaleX: pageProgress }} aria-hidden="true" />

      {/* ======= hero ======= */}
      <section ref={heroRef} id="experience" className="hero-scroll" aria-label="تجربة أوروم البابلية">
        <div className="hero-sticky">
          <canvas ref={canvasRef} className="hero-canvas" aria-label="مشاهد سينمائية لسيارات أوروم أمام معالم بابل" />
          <div className="hero-overlay" />
          <div className="hero-grain" />
          <div className="hero-dust" aria-hidden="true">
            {dust.map((particle) => (
              <span
                key={particle.id}
                style={{
                  left: `${particle.left}%`,
                  width: particle.size,
                  height: particle.size,
                  animationDelay: `${particle.delay}s`,
                  animationDuration: `${particle.duration}s`,
                  opacity: particle.opacity,
                }}
              />
            ))}
          </div>
          <div className="hero-frame" aria-hidden="true">
            <span className="hero-frame__corner hero-frame__corner--tl"><Rosette size={20} /></span>
            <span className="hero-frame__corner hero-frame__corner--tr"><Rosette size={20} /></span>
            <span className="hero-frame__corner hero-frame__corner--bl"><Rosette size={20} /></span>
            <span className="hero-frame__corner hero-frame__corner--br"><Rosette size={20} /></span>
          </div>

          <header className={`topbar content-width ${scrolled ? 'topbar--scrolled' : ''}`}>
            <button className="mobile-menu-button" aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'} onClick={() => setMenuOpen((value) => !value)}>
              <Icon name={menuOpen ? 'close' : 'menu'} size={21} />
            </button>
            <button className="topbar-logo" onClick={() => scrollTo('experience')}><BabylonMark inverse /></button>
            <nav className={`main-nav ${menuOpen ? 'main-nav--open' : ''}`}>
              <button onClick={() => scrollTo('collection')}>المجموعة</button>
              <button onClick={() => scrollTo('philosophy')}>فلسفتنا</button>
              <button onClick={() => scrollTo('heritage')}>الإرث</button>
              <button onClick={() => scrollTo('visit')}>صالة العرض</button>
              <span className="nav-divider" />
              <button className="language-button">EN <span>العربية</span></button>
            </nav>
            <div className="topbar-actions">
              <button className={`search-button ${searchOpen ? 'search-button--active' : ''}`} aria-label="البحث" onClick={() => setSearchOpen((value) => !value)}>
                <Icon name="search" size={19} />
              </button>
              <button className="staff-login-button" onClick={() => { setAuthError(''); setAuthOpen(true); }}>{signedIn ? `لوحة ${signedIn === 'manager' ? 'المدير' : 'الموظف'}` : 'دخول الموظفين'}</button>
              <button className="topbar-cta" onClick={() => setModalOpen(true)}>احجز تجربة قيادة <Icon name="arrow" size={15} /></button>
            </div>
            <AnimatePresence>
              {searchOpen && (
                <motion.div
                  className="search-popover"
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: easing }}
                >
                  <div className="search-field">
                    <Icon name="search" size={16} />
                    <input
                      autoFocus
                      placeholder="ابحث عن طرازك…"
                      onKeyDown={(event) => { if (event.key === 'Enter') scrollTo('collection'); }}
                    />
                  </div>
                  <div className="search-suggestions">
                    {cars.map((car) => (
                      <button key={car.name} onClick={() => scrollTo('collection')}>
                        <span>{car.name}</span><small>{car.type}</small>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          <div className="hero-stage content-width">
            <div className="hero-copy-stack">
              {frames.map((frame, index) => {
                const distance = stage - index;
                const opacity = clamp(1 - Math.abs(distance) * 1.7);
                const translate = distance * -42;
                return (
                  <div
                    key={frame.eyebrow}
                    className="hero-copy"
                    style={{ opacity, transform: `translateY(${translate}px)`, pointerEvents: opacity > 0.5 ? 'auto' : 'none' }}
                  >
                    <div className="eyebrow"><span className="eyebrow-line" />{frame.eyebrow}<span className="eyebrow-en">BABYLON / IRAQ</span></div>
                    <h1>{frame.title.split('\n').map((line) => <span key={line}>{line}</span>)}</h1>
                    <p>{frame.detail}</p>
                    <button className="hero-button" onClick={() => scrollTo('collection')}>
                      <span>اكتشف المجموعة</span><span className="button-circle"><Icon name="arrow" size={17} /></span>
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="hero-side-note">
              <motion.span
                className="side-note-star"
                animate={{ rotate: 360 }}
                transition={{ duration: 46, ease: 'linear', repeat: Infinity }}
              >
                <IshtarStar size={38} />
              </motion.span>
              <span className="side-note-rule" />
              <span className="side-note-text">حكاية تُروى منذ بابل</span>
            </div>
          </div>

          <div className="hero-bottom content-width">
            <div className="hero-location"><Icon name="compass" size={16} /><span>{frames[activeFrame].location}</span></div>
            <div className="scroll-prompt"><span>مرّر لاكتشاف القصة</span><span className="scroll-line"><i style={{ height: `${Math.max(12, progress * 100)}%` }} /></span></div>
            <div className="hero-sequence" aria-label={`اللوح ${activeFrame + 1} من 3`}>
              <span>لوح</span>
              <strong>0{activeFrame + 1}</strong>
              <span className="sequence-slash">/</span>
              <span>03</span>
              <div className="sequence-dashes">{frames.map((frame, index) => <i key={frame.eyebrow} className={index <= activeFrame ? 'is-active' : ''} />)}</div>
            </div>
          </div>

          <div className="floating-spec-card">
            <div className="spec-card-top"><span>الطراز الظاهر</span><span className="live-dot">LIVE</span></div>
            <strong>{frames[activeFrame].model}</strong>
            <div className="spec-card-meta"><span>V6 / 3.0L</span><span>× 470 حصان</span><span>AWD</span></div>
            <div className="spec-card-cuneiform" aria-hidden="true">𒀭 𒈗 𒆠 𒌓</div>
          </div>
        </div>
      </section>

      {/* ======= cuneiform marquee ======= */}
      <div className="marquee-band">
        <CuneiformMarquee />
      </div>

      {/* ======= philosophy ======= */}
      <section className="manifesto-section section-dark" id="philosophy">
        <div className="brick-glow" aria-hidden="true" />
        <motion.div
          className="manifesto-star"
          aria-hidden="true"
          animate={{ rotate: 360 }}
          transition={{ duration: 90, ease: 'linear', repeat: Infinity }}
        >
          <IshtarStar size={430} />
        </motion.div>
        <div className="content-width manifesto-grid">
          <Reveal className="section-kicker"><span className="kicker-number">01</span><span className="kicker-line" /><span>الفلسفة</span></Reveal>
          <div className="manifesto-copy">
            <Reveal><p className="display-intro">في أوروم، لا نبيع<br /><em>سيارة.</em> نصنع إرثاً.</p></Reveal>
            <Reveal delay={0.15}>
              <p className="body-copy">
                من الأرض التي علّمت العالم الكتابة والقانون والعجلة، نختار سياراتنا كما اختار ملوك بابل
                آجرّ بوابة عشتار: قطعةً قطعة، بعينٍ لا تساوم على التفاصيل. سيارات تصل إلى العراق
                لتليق بأرضٍ صنعت الحضارة.
              </p>
            </Reveal>
            <Reveal delay={0.28}>
              <button className="text-link" onClick={() => scrollTo('visit')}>تعرّف على أوروم <Icon name="arrow" size={16} /></button>
            </Reveal>
          </div>
          <Reveal delay={0.2} className="manifesto-stamp-wrap">
            <div className="manifesto-stamp">
              <span className="stamp-cuneiform" aria-hidden="true">𒆍𒀭𒊏𒆠</span>
              <span>EST.</span><strong>2014</strong><span>BABYLON · IRAQ</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======= collection ======= */}
      <section className="collection-section section-cream" id="collection">
        <ZigguratDivider className="zg-divider--dark-to-cream" />
        <div className="content-width">
          <div className="section-heading-row">
            <Reveal>
              <div className="section-kicker section-kicker--dark"><span className="kicker-number">02</span><span className="kicker-line" /><span>المجموعة</span></div>
              <h2 className="section-title">اختيارات تليق<br /><em>بالملوك.</em></h2>
            </Reveal>
            <Reveal delay={0.15} className="heading-aside">
              <span>كل سيارة في مجموعتنا<br />مختارة كقطعة متحف.</span>
              <button className="round-arrow" onClick={() => scrollTo('visit')} aria-label="إلى صالة العرض"><Icon name="arrow" size={18} /></button>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div className="filter-bar">
              <div className="filter-tabs">
                {filters.map((filter) => (
                  <button key={filter} className={activeFilter === filter ? 'is-active' : ''} onClick={() => setActiveFilter(filter)}>
                    {filter}
                    {activeFilter === filter && <motion.span layoutId="filter-pill" className="filter-pill" transition={{ duration: 0.45, ease: easing }} />}
                  </button>
                ))}
              </div>
              <span className="filter-count">{String(filteredCars.length).padStart(2, '0')} سيارات</span>
            </div>
          </Reveal>
          <motion.div className="car-grid" layout>
            <AnimatePresence mode="popLayout">
              {filteredCars.map((car, index) => (
                <motion.article
                  layout
                  className="car-card"
                  key={car.name}
                  initial={{ opacity: 0, y: 44 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.75, delay: index * 0.12, ease: easing }}
                >
                  <div className="car-frame-band" aria-hidden="true" />
                  <div className="car-image-wrap">
                    <motion.img src={car.image} alt={car.name} whileHover={{ scale: 1.06 }} transition={{ duration: 0.9, ease: easing }} />
                    <div className="car-image-shade" />
                    {car.tag && <span className="car-tag">{car.tag}</span>}
                    <span className="car-number">0{index + 1}</span>
                    <span className="car-rosette" aria-hidden="true"><Rosette size={22} /></span>
                    <button className="card-arrow" aria-label={`تفاصيل ${car.name}`} onClick={() => setSelectedCar(car)}><Icon name="arrow" size={17} /></button>
                  </div>
                  <div className="car-info">
                    <div>
                      <h3>{car.name} <em className="car-arabic">«{car.arabicName}»</em></h3>
                      <span>{car.type} · {car.year}</span>
                    </div>
                    <div className="car-price"><span>ابتداءً من</span><strong>{car.price} <small>د.ع</small></strong></div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
          <Reveal delay={0.1}>
            <div className="collection-footer"><span>01 — 0{filteredCars.length}</span><div className="collection-rule" /><span>معرض أوروم، بابل</span></div>
          </Reveal>
        </div>
      </section>

      {/* ======= heritage parallax band ======= */}
      <section className="heritage-band" id="heritage" ref={heritageRef}>
        <motion.div className="heritage-media" style={{ y: heritageY }} aria-hidden="true">
          <img src="/assets/babylon-hero.png" alt="" />
        </motion.div>
        <div className="heritage-overlay" />
        <div className="content-width heritage-content">
          <Reveal>
            <span className="heritage-cuneiform" aria-hidden="true">𒀊𒆠𒈾 𒆍𒀭𒊏𒆠</span>
            <blockquote>
              «على أرضِ الرافدين، دارت <em>أوّل عجلةٍ</em> في التاريخ.»
            </blockquote>
            <p className="heritage-sub">ومنها، نُكمل نحن المسير — أوروم موتورز</p>
          </Reveal>
          <motion.span
            className="heritage-star"
            aria-hidden="true"
            animate={{ rotate: -360 }}
            transition={{ duration: 60, ease: 'linear', repeat: Infinity }}
          >
            <IshtarStar size={72} />
          </motion.span>
        </div>
      </section>

      {/* ======= numbers ======= */}
      <section className="numbers-section section-dark">
        <div className="content-width numbers-layout">
          <div className="numbers-lead">
            <Reveal className="section-kicker"><span className="kicker-number">03</span><span className="kicker-line" /><span>لماذا أوروم؟</span></Reveal>
            <Reveal delay={0.1}><h2>الفرق<br /><em>في التفاصيل.</em></h2></Reveal>
            <Reveal delay={0.2}><p>لأن امتلاك سيارة فاخرة لا يبدأ من المقود فقط. يبدأ من الطريقة التي تجد بها سيارتك، ومن الشخص الذي يقف معك بعدها — كما وقفت أسوار بابل، قروناً.</p></Reveal>
          </div>
          <div className="numbers-list">
            <Reveal delay={0.05} className="number-item">
              <CountUp value={10} suffix="+" />
              <div><b>سنوات من الخبرة</b><span>نختار الأفضل للسوق العراقي</span></div>
            </Reveal>
            <Reveal delay={0.18} className="number-item">
              <CountUp value={48} />
              <div><b>ساعة للتسليم</b><span>من الاختيار إلى بابك</span></div>
            </Reveal>
            <Reveal delay={0.3} className="number-item">
              <CountUp value={360} suffix="°" />
              <div><b>خدمة ما بعد البيع</b><span>فريقك معنا في كل كيلومتر</span></div>
            </Reveal>
          </div>
          <div className="numbers-aside">
            <span className="vertical-label">BABYLON STANDARD / 2025</span>
            <div className="line-orb"><span /></div>
          </div>
        </div>
      </section>

      {/* ======= visit ======= */}
      <section className="experience-section section-cream" id="visit">
        <ZigguratDivider className="zg-divider--dark-to-cream" />
        <div className="content-width experience-grid">
          <div className="experience-copy">
            <Reveal className="section-kicker section-kicker--dark"><span className="kicker-number">04</span><span className="kicker-line" /><span>تجربة أوروم</span></Reveal>
            <Reveal delay={0.1}><h2>اقترب من<br /><em>اختيارك.</em></h2></Reveal>
            <Reveal delay={0.2}><p>الصور تعطيك فكرة. التجربة تمنحك الإجابة. تعال إلى صالتنا في بغداد — بلاطٌ أزرق كآجرّ عشتار، وسياراتٌ تنتظر طريقها معك.</p></Reveal>
            <Reveal delay={0.3}><button className="dark-button" onClick={() => setModalOpen(true)}>احجز تجربة قيادة <Icon name="arrow" size={16} /></button></Reveal>
          </div>
          <Reveal delay={0.2} className="experience-card-wrap">
            <div className="experience-card">
              <div className="experience-card__crenellation" aria-hidden="true" />
              <div className="experience-card__top"><span>THE BABYLON HOUSE</span><span>بابل / العراق</span></div>
              <div className="experience-card__middle">
                <motion.span
                  className="experience-star"
                  aria-hidden="true"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 32, ease: 'linear', repeat: Infinity }}
                >
                  <IshtarStar size={54} />
                </motion.span>
                <div><span>مفتوحون يومياً</span><strong>09:00 — 21:00</strong></div>
              </div>
              <div className="experience-card__bottom">
                <span>شارع الأميرات، المنصور</span>
                <a href="tel:+9647800000000" aria-label="اتصل بأوروم"><Icon name="phone" size={16} /></a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ======= footer ======= */}
      <footer className="site-footer section-dark">
        <div className="footer-ziggurat" aria-hidden="true">
          <svg viewBox="0 0 1440 110" preserveAspectRatio="none">
            <path d="M0 110V84h180V64h90V44h60V24h70V6h120V24h90V44h50V64h80V84h120V58h90V34h70V16h100V34h80V58h60V84h180v26Z" />
          </svg>
        </div>
        <div className="content-width footer-top">
          <BabylonMark inverse />
          <div className="footer-statement">طريقك يبدأ<br /><em>من أرض الحضارات.</em></div>
          <div className="footer-contact">
            <span>تحدث مع مستشار</span>
            <a href="tel:+9647800000000" dir="ltr">+964 780 000 0000</a>
            <button onClick={() => setModalOpen(true)}>احجز موعداً <Icon name="arrow" size={15} /></button>
          </div>
        </div>
        <div className="content-width footer-bottom">
          <span>© 2025 أوروم موتورز — بابل، العراق</span>
          <span className="footer-cuneiform" aria-hidden="true">𒀭 𒁹 𒆠 𒈗 𒌓 𒐕 𒄑 𒉺</span>
          <div className="footer-links">
            <a href="#experience" onClick={(event) => { event.preventDefault(); scrollTo('experience'); }}>انستغرام</a>
            <a href="#experience" onClick={(event) => { event.preventDefault(); scrollTo('experience'); }}>لينكدإن</a>
            <a href="#experience" onClick={(event) => { event.preventDefault(); scrollTo('experience'); }}>سياسة الخصوصية</a>
          </div>
          <button className="back-top" aria-label="العودة إلى الأعلى" onClick={() => scrollTo('experience')}><Icon name="arrowUp" size={16} /></button>
        </div>
      </footer>

      {/* ======= vehicle detail drawer ======= */}
      <AnimatePresence>
        {selectedCar && (
          <motion.div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedCar(null); }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="vehicle-modal" role="dialog" aria-modal="true" initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 25 }}>
              <button className="modal-close" aria-label="إغلاق" onClick={() => setSelectedCar(null)}><Icon name="close" size={18} /></button>
              <div className="vehicle-modal__image"><img src={selectedCar.image} alt={selectedCar.name} /><span>360° VIEW READY</span></div>
              <div className="vehicle-modal__body" dir="rtl">
                <div className="section-kicker"><span className="kicker-number">{selectedCar.year}</span><span className="kicker-line" /><span>{selectedCar.type}</span></div>
                <h2>{selectedCar.name}<em> «{selectedCar.arabicName}»</em></h2>
                <p className="vehicle-lead">تفاصيل مختارة بعناية — من الخط الخارجي إلى آخر غرزة داخل المقصورة.</p>
                <div className="vehicle-stats"><div><small>المحرك</small><b>{selectedCar.engine}</b></div><div><small>القوة</small><b>{selectedCar.power}</b></div><div><small>السعر</small><b>{selectedCar.price} <i>د.ع</i></b></div></div>
                <div className="vehicle-columns"><div><h4>من الخارج</h4>{selectedCar.exterior.map(item => <span key={item}><Icon name="check" size={14} />{item}</span>)}</div><div><h4>من الداخل</h4>{selectedCar.interior.map(item => <span key={item}><Icon name="check" size={14} />{item}</span>)}</div></div>
                <button className="form-submit" onClick={() => { setSelectedCar(null); setModalOpen(true); }}>احجز تجربة هذا الطراز <Icon name="arrow" size={16} /></button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======= staff login ======= */}
      <AnimatePresence>
        {authOpen && (
          <motion.div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setAuthOpen(false); }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="booking-modal auth-modal" role="dialog" aria-modal="true" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
              <div className="modal-crenellation" /><button className="modal-close" aria-label="إغلاق" onClick={() => setAuthOpen(false)}><Icon name="close" size={18} /></button>
              {signedIn ? <><div className="modal-kicker">لوحة التحكم الداخلية</div><h2>مرحباً بك في<br /><em>بيت أوروم.</em></h2><p>أنت مسجل الدخول بصلاحية {signedIn === 'manager' ? 'المدير' : 'الموظف'}.</p><div className="dashboard-mini"><span>طلبات اليوم <b>08</b></span><span>سيارات المخزون <b>24</b></span><span>مواعيد التجربة <b>12</b></span></div><button className="form-submit" onClick={signOut}>تسجيل الخروج</button></> : <><div className="modal-kicker">منظومة أوروم الداخلية</div><h2>دخول<br /><em>الفريق.</em></h2><p>للموظفين والمدير فقط — اختر مستوى الصلاحية وسجّل الدخول لإدارة العملاء والمخزون.</p><div className="role-switch"><button className={authRole === 'staff' ? 'is-active' : ''} onClick={() => setAuthRole('staff')}>موظف</button><button className={authRole === 'manager' ? 'is-active' : ''} onClick={() => setAuthRole('manager')}>مدير</button></div><form onSubmit={onAuthSubmit}><label>البريد الإلكتروني<input name="email" type="email" placeholder={authRole === 'manager' ? 'manager@aurum.iq' : 'staff@aurum.iq'} required /></label><label>كلمة المرور<input name="password" type="password" placeholder="••••••••" required /></label>{authError && <small className="auth-error">{authError}</small>}<button className="form-submit" type="submit">دخول آمن <Icon name="arrow" size={16} /></button></form><div className="demo-credentials">تجريبي: {authRole === 'manager' ? 'manager@aurum.iq / babil2025' : 'staff@aurum.iq / aurum123'}</div></>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======= booking modal ======= */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="modal-backdrop"
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}
          >
            <motion.div
              className="booking-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="booking-title"
              initial={{ opacity: 0, y: 42, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 28, scale: 0.96 }}
              transition={{ duration: 0.5, ease: easing }}
            >
              <div className="modal-crenellation" aria-hidden="true" />
              <button className="modal-close" aria-label="إغلاق" onClick={closeModal}><Icon name="close" size={18} /></button>
              {!submitted ? (
                <>
                  <div className="modal-kicker"><Icon name="calendar" size={17} /> تجربة خاصة في صالة أوروم</div>
                  <h2 id="booking-title">احجز لحظتك<br /><em>الأولى.</em></h2>
                  <p>أخبرنا بالوقت المناسب لك، وسيتواصل معك مستشار أوروم لتأكيد الموعد.</p>
                  <form onSubmit={onBookingSubmit}>
                    <label>الاسم الكامل<input required name="name" placeholder="اكتب اسمك" /></label>
                    <div className="form-row">
                      <label>رقم الهاتف<input required type="tel" name="phone" placeholder="07XX XXX XXXX" /></label>
                      <label>اليوم المفضل<input required type="date" name="date" /></label>
                    </div>
                    <label>اختر السيارة
                      <select name="car" defaultValue="AURUM ISHTAR">
                        <option>AURUM ISHTAR</option>
                        <option>AURUM BABEL</option>
                        <option>AURUM ZIQQURA GT</option>
                      </select>
                    </label>
                    <button className="form-submit" type="submit">أرسل الطلب <Icon name="arrow" size={16} /></button>
                  </form>
                </>
              ) : (
                <div className="modal-success">
                  <motion.span
                    className="success-icon"
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 15 }}
                  >
                    <Icon name="check" size={24} />
                  </motion.span>
                  <h2>وصلنا طلبك<br /><em>بنجاح.</em></h2>
                  <p>شكراً لثقتك. سيتواصل معك مستشار أوروم خلال دقائق لتأكيد موعدك.</p>
                  <button className="form-submit" onClick={closeModal}>تم</button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======= loading ======= */}
      <div className={`loading-screen ${loadedCount >= frames.length ? 'loading-screen--done' : ''}`} aria-hidden="true">
        <motion.span
          className="loading-star"
          animate={{ rotate: 360, scale: [1, 1.08, 1] }}
          transition={{ rotate: { duration: 14, ease: 'linear', repeat: Infinity }, scale: { duration: 2.4, ease: 'easeInOut', repeat: Infinity } }}
        >
          <IshtarStar size={64} />
        </motion.span>
        <BabylonMark />
        <span className="loading-label">تحضير التجربة {loadedCount}/03</span>
      </div>
    </main>
  );
}

export default App;
