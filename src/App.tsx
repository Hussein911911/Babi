import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';

type IconName =
  | 'arrow'
  | 'arrowUp'
  | 'calendar'
  | 'check'
  | 'chevron'
  | 'close'
  | 'compass'
  | 'menu'
  | 'phone'
  | 'play'
  | 'search'
  | 'spark';

type Frame = {
  src: string;
  eyebrow: string;
  title: string;
  detail: string;
  location: string;
};

type Car = {
  name: string;
  type: string;
  price: string;
  year: string;
  image: string;
  tag?: string;
};

const frames: Frame[] = [
  {
    src: '/assets/aurum-hero.png',
    eyebrow: '01 / حضور',
    title: 'السيارة التي\nتسبق وصولك.',
    detail: 'من بغداد، إلى أي طريق تختاره.',
    location: 'بغداد — شارع أبو نواس',
  },
  {
    src: '/assets/aurum-showroom.png',
    eyebrow: '02 / تفصيل',
    title: 'قوة هادئة.\nحضور لا يُنسى.',
    detail: 'كل خط، وكل انعكاس، صُمّم ليبقى.',
    location: 'صالة أوروم — بغداد',
  },
  {
    src: '/assets/aurum-desert.png',
    eyebrow: '03 / امتداد',
    title: 'صُمّمت لتصل\nأبعد.',
    detail: 'اختر مسارك. نحن نجهّز الباقي.',
    location: 'طريق الصحراء — العراق',
  },
];

const cars: Car[] = [
  { name: 'AURUM S7', type: 'سيدان فاخرة', price: '78,500,000', year: '2025', image: '/assets/aurum-hero.png', tag: 'الأكثر طلباً' },
  { name: 'AURUM S7 BLACK', type: 'إصدار خاص', price: '86,900,000', year: '2025', image: '/assets/aurum-showroom.png', tag: 'حصري' },
  { name: 'AURUM GT', type: 'جراند تورر', price: '94,200,000', year: '2024', image: '/assets/aurum-desert.png' },
];

const filters = ['الكل', 'سيدان', 'إصدار خاص', 'جراند تورر'];

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
    case 'chevron':
      return <svg {...common}><path d="m6 9 6 6 6-6" /></svg>;
    case 'close':
      return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
    case 'compass':
      return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="m14.8 9.2-1.9 3.7-3.7 1.9 1.9-3.7 3.7-1.9Z" /></svg>;
    case 'menu':
      return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    case 'phone':
      return <svg {...common}><path d="M6.5 4.5 9 4l1.7 4-1.8 1.6a14.7 14.7 0 0 0 5.5 5.5l1.6-1.8 4 1.7-.5 2.5c-.2 1.1-1.2 1.8-2.3 1.7C10.3 18.4 5.6 13.7 4.8 6.8c-.1-1.1.6-2.1 1.7-2.3Z" /></svg>;
    case 'play':
      return <svg {...common} fill="currentColor" stroke="none"><path d="m9 6 9 6-9 6V6Z" /></svg>;
    case 'search':
      return <svg {...common}><circle cx="10.8" cy="10.8" r="6.3" /><path d="m16 16 4.2 4.2" /></svg>;
    case 'spark':
      return <svg {...common}><path d="m12 3 1.5 6.5L20 12l-6.5 1.5L12 20l-1.5-6.5L4 12l6.5-2.5L12 3Z" /></svg>;
  }
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function AurumMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className={`aurum-mark ${inverse ? 'aurum-mark--inverse' : ''}`} aria-label="Aurum Motors">
      <span className="aurum-mark__symbol">A</span>
      <span className="aurum-mark__word">AURUM<small>MOTORS</small></span>
    </div>
  );
}

function App() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const scrollProgressRef = useRef(0);
  const renderRef = useRef<(progress: number) => void>(() => undefined);
  const [progress, setProgress] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeFilter, setActiveFilter] = useState('الكل');
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    const nextImages = frames.map((frame, index) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = frame.src;
      image.onload = () => {
        setLoadedCount((current) => Math.max(current, index + 1));
        renderRef.current(scrollProgressRef.current);
      };
      return image;
    });
    imagesRef.current = nextImages;

    return () => {
      nextImages.forEach((image) => { image.onload = null; });
    };
  }, []);

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
      if (!image.complete || !image.naturalWidth) return;
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
      context.fillStyle = '#141311';
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

  const activeFrame = Math.min(frames.length - 1, Math.round(progress * (frames.length - 1)));
  const filteredCars = cars.filter((car) => {
    if (activeFilter === 'الكل') return true;
    if (activeFilter === 'سيدان') return car.type === 'سيدان فاخرة';
    if (activeFilter === 'إصدار خاص') return car.type === 'إصدار خاص';
    return car.type === 'جراند تورر';
  });

  const onBookingSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="site-shell">
      <section ref={heroRef} id="experience" className="hero-scroll" aria-label="تجربة أوروم السينمائية">
        <div className="hero-sticky">
          <canvas ref={canvasRef} className="hero-canvas" aria-label="تجربة بصرية لسيارات أوروم" />
          <div className="hero-overlay" />
          <div className="hero-grain" />

          <header className="topbar content-width">
            <button className="mobile-menu-button" aria-label="فتح القائمة" onClick={() => setMenuOpen((value) => !value)}>
              <Icon name={menuOpen ? 'close' : 'menu'} size={21} />
            </button>
            <button className="topbar-logo" onClick={() => scrollTo('experience')}><AurumMark inverse /></button>
            <nav className={`main-nav ${menuOpen ? 'main-nav--open' : ''}`}>
              <button onClick={() => scrollTo('collection')}>المجموعة</button>
              <button onClick={() => scrollTo('philosophy')}>فلسفتنا</button>
              <button onClick={() => scrollTo('visit')}>صالة العرض</button>
              <span className="nav-divider" />
              <button className="language-button">EN <span>العربية</span></button>
            </nav>
            <div className="topbar-actions">
              <button className={`search-button ${searchOpen ? 'search-button--active' : ''}`} aria-label="البحث" onClick={() => setSearchOpen((value) => !value)}>
                <Icon name="search" size={19} />
              </button>
              <button className="topbar-cta" onClick={() => setModalOpen(true)}>احجز تجربة قيادة <Icon name="arrow" size={15} /></button>
            </div>
            {searchOpen && <div className="search-popover"><span>ابحث في أوروم</span><input autoFocus placeholder="مثلاً: AURUM S7" /></div>}
          </header>

          <div className="hero-content content-width">
            <div className="hero-copy-wrap">
              {frames.map((frame, index) => {
                const distance = Math.abs(progress * (frames.length - 1) - index);
                const opacity = clamp(1 - distance * 2.4);
                const translate = (index - progress * (frames.length - 1)) * 20;
                return (
                  <div key={frame.eyebrow} className="hero-copy" style={{ opacity, transform: `translateY(${translate}px)`, pointerEvents: opacity > 0.5 ? 'auto' : 'none' }}>
                    <div className="eyebrow"><span className="eyebrow-line" />{frame.eyebrow}<span className="eyebrow-en">AURUM / IRAQ</span></div>
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
              <span className="side-note-index">{String(activeFrame + 1).padStart(2, '0')}</span>
              <span className="side-note-rule" />
              <span>قصة تتحرك معك</span>
            </div>
          </div>

          <div className="hero-bottom content-width">
            <div className="hero-location"><Icon name="compass" size={16} /><span>{frames[activeFrame].location}</span></div>
            <div className="scroll-prompt"><span>مرّر لاكتشاف القصة</span><span className="scroll-line"><i style={{ height: `${Math.max(12, progress * 100)}%` }} /></span></div>
            <div className="hero-sequence" aria-label={`المشهد ${activeFrame + 1} من 3`}>
              <span>مشهد</span>
              <strong>0{activeFrame + 1}</strong>
              <span className="sequence-slash">/</span>
              <span>03</span>
              <div className="sequence-dashes">{frames.map((frame, index) => <i key={frame.eyebrow} className={index <= activeFrame ? 'is-active' : ''} />)}</div>
            </div>
          </div>

          <div className="floating-spec-card">
            <div className="spec-card-top"><span>الطراز الظاهر</span><span className="live-dot">LIVE</span></div>
            <strong>{activeFrame === 2 ? 'AURUM GT' : 'AURUM S7'}</strong>
            <div className="spec-card-meta"><span>V6 / 3.0L</span><span>× 470 حصان</span><span>AWD</span></div>
          </div>
        </div>
      </section>

      <section className="manifesto-section section-dark" id="philosophy">
        <div className="content-width manifesto-grid">
          <div className="section-kicker"><span className="kicker-number">01</span><span className="kicker-line" /><span>الفلسفة</span></div>
          <div className="manifesto-copy">
            <p className="display-intro">في أوروم، لا نبيع<br /><em>سيارة.</em> نصنع حضوراً.</p>
            <p className="body-copy">نختار سياراتنا كما تُختار القطع النادرة: بعين تعرف الفرق، وبمعيار لا يساوم على التفاصيل. سيارات تصل إلى العراق لتمنحك إحساساً لا يشبه سواه.</p>
            <button className="text-link" onClick={() => scrollTo('visit')}>تعرّف على أوروم <Icon name="arrow" size={16} /></button>
          </div>
          <div className="manifesto-stamp"><span>EST.</span><strong>2014</strong><span>BAGHDAD · IRAQ</span></div>
        </div>
      </section>

      <section className="collection-section section-cream" id="collection">
        <div className="content-width">
          <div className="section-heading-row">
            <div><div className="section-kicker section-kicker--dark"><span className="kicker-number">02</span><span className="kicker-line" /><span>المجموعة</span></div><h2 className="section-title">اختيارات<br /><em>لافتة.</em></h2></div>
            <div className="heading-aside"><span>كل سيارة في مجموعتنا<br />مختارة بعناية.</span><button className="round-arrow" onClick={() => scrollTo('visit')}><Icon name="arrow" size={18} /></button></div>
          </div>
          <div className="filter-bar">
            <div className="filter-tabs">{filters.map((filter) => <button key={filter} className={activeFilter === filter ? 'is-active' : ''} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div>
            <span className="filter-count">{String(filteredCars.length).padStart(2, '0')} سيارات</span>
          </div>
          <div className="car-grid">
            {filteredCars.map((car, index) => <article className={`car-card car-card--${index + 1}`} key={car.name}>
              <div className="car-image-wrap"><img src={car.image} alt={car.name} /><div className="car-image-shade" />{car.tag && <span className="car-tag">{car.tag}</span>}<span className="car-number">0{index + 1}</span><button className="card-arrow" aria-label={`تفاصيل ${car.name}`} onClick={() => setModalOpen(true)}><Icon name="arrow" size={17} /></button></div>
              <div className="car-info"><div><h3>{car.name}</h3><span>{car.type} · {car.year}</span></div><div className="car-price"><span>ابتداءً من</span><strong>{car.price} <small>د.ع</small></strong></div></div>
            </article>)}
          </div>
          <div className="collection-footer"><span>01 — 0{filteredCars.length}</span><div className="collection-rule" /><span>معرض أوروم، بغداد</span></div>
        </div>
      </section>

      <section className="numbers-section section-dark">
        <div className="content-width numbers-layout">
          <div className="numbers-lead"><div className="section-kicker"><span className="kicker-number">03</span><span className="kicker-line" /><span>لماذا أوروم؟</span></div><h2>الفرق<br /><em>في التفاصيل.</em></h2><p>لأن امتلاك سيارة فاخرة لا يبدأ من المقود فقط. يبدأ من الطريقة التي تجد بها سيارتك، ومن الشخص الذي يقف معك بعدها.</p></div>
          <div className="numbers-list"><div className="number-item"><strong>10<span>+</span></strong><div><b>سنوات من الخبرة</b><span>نختار الأفضل للسوق العراقي</span></div></div><div className="number-item"><strong>48</strong><div><b>ساعة للتسليم</b><span>من الاختيار إلى بابك</span></div></div><div className="number-item"><strong>360<span>°</span></strong><div><b>خدمة ما بعد البيع</b><span>فريقك معنا في كل كيلومتر</span></div></div></div>
          <div className="numbers-aside"><span className="vertical-label">AURUM STANDARD / 2025</span><div className="line-orb"><span /></div></div>
        </div>
      </section>

      <section className="experience-section section-cream" id="visit">
        <div className="content-width experience-grid">
          <div className="experience-copy"><div className="section-kicker section-kicker--dark"><span className="kicker-number">04</span><span className="kicker-line" /><span>تجربة أوروم</span></div><h2>اقترب من<br /><em>اختيارك.</em></h2><p>الصور تعطيك فكرة. التجربة تمنحك الإجابة. تعال إلى صالتنا في بغداد، ودع الطريق يختار معك.</p><button className="dark-button" onClick={() => setModalOpen(true)}>احجز تجربة قيادة <Icon name="arrow" size={16} /></button></div>
          <div className="experience-card"><div className="experience-card__top"><span>THE AURUM HOUSE</span><span>بغداد / العراق</span></div><div className="experience-card__middle"><span className="experience-orbit"><span /></span><div><span>مفتوحون يومياً</span><strong>09:00 — 21:00</strong></div></div><div className="experience-card__bottom"><span>شارع الأميرات، المنصور</span><button aria-label="اتصل بأوروم"><Icon name="phone" size={16} /></button></div></div>
        </div>
      </section>

      <footer className="site-footer section-dark">
        <div className="content-width footer-top"><AurumMark inverse /><div className="footer-statement">طريقك يبدأ<br /><em>من هنا.</em></div><div className="footer-contact"><span>تحدث مع مستشار</span><a href="tel:+9647800000000">+964 780 000 0000</a><button onClick={() => setModalOpen(true)}>احجز موعداً <Icon name="arrow" size={15} /></button></div></div>
        <div className="content-width footer-bottom"><span>© 2025 أوروم موتورز — العراق</span><div><a href="#experience">انستغرام</a><a href="#experience">لينكدإن</a><a href="#experience">سياسة الخصوصية</a></div><button className="back-top" aria-label="العودة إلى الأعلى" onClick={() => scrollTo('experience')}><Icon name="arrowUp" size={16} /></button></div>
      </footer>

      {modalOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) { setModalOpen(false); setSubmitted(false); } }}>
        <div className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
          <button className="modal-close" aria-label="إغلاق" onClick={() => { setModalOpen(false); setSubmitted(false); }}><Icon name="close" size={18} /></button>
          {!submitted ? <>
            <div className="modal-kicker"><Icon name="calendar" size={17} /> تجربة خاصة في صالة أوروم</div>
            <h2 id="booking-title">احجز لحظتك<br /><em>الأولى.</em></h2>
            <p>أخبرنا بالوقت المناسب لك، وسيتواصل معك مستشار أوروم لتأكيد الموعد.</p>
            <form onSubmit={onBookingSubmit}><label>الاسم الكامل<input required name="name" placeholder="اكتب اسمك" /></label><div className="form-row"><label>رقم الهاتف<input required type="tel" name="phone" placeholder="07XX XXX XXXX" /></label><label>اليوم المفضل<input required type="date" name="date" /></label></div><label>اختر السيارة<select name="car" defaultValue="AURUM S7"><option>AURUM S7</option><option>AURUM S7 BLACK</option><option>AURUM GT</option></select></label><button className="form-submit" type="submit">أرسل الطلب <Icon name="arrow" size={16} /></button></form>
          </> : <div className="modal-success"><span className="success-icon"><Icon name="check" size={24} /></span><h2>وصلنا طلبك<br /><em>بنجاح.</em></h2><p>شكراً لثقتك. سيتواصل معك مستشار أوروم خلال دقائق لتأكيد موعدك.</p><button className="form-submit" onClick={() => { setModalOpen(false); setSubmitted(false); }}>تم</button></div>}
        </div>
      </div>}
      <div className={`loading-screen ${loadedCount === frames.length ? 'loading-screen--done' : ''}`} aria-hidden="true"><AurumMark /><span>تحضير التجربة {loadedCount}/03</span></div>
    </main>
  );
}

export default App;
