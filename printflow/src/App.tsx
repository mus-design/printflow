import './App.css'
import OrderFlow from './OrderFlow'
import ShopDashboard from './ShopDashboard'

const steps = [
  { number: '01', title: 'Upload', text: 'Add your documents and tell us what you need printed.', icon: 'file' },
  { number: '02', title: 'Choose', text: 'Pick a nearby print shop that works for you.', icon: 'pin' },
  { number: '03', title: 'Pay', text: 'Confirm your order and pay securely in the app.', icon: 'card' },
  { number: '04', title: 'Collect', text: 'Get your pickup code and grab your prints when ready.', icon: 'check' },
]

const features = [
  { title: 'Skip the line', text: 'Place your order before you leave home, class, or the office.', icon: 'clock' },
  { title: 'Know when it’s ready', text: 'Get a clear update when your prints are ready to collect.', icon: 'bell' },
  { title: 'Pickup made simple', text: 'Show your unique pickup code and be on your way.', icon: 'qr' },
  { title: 'Easy from start to finish', text: 'Your files, print choices, and order details in one place.', icon: 'spark' },
]

function Icon({ name, size = 24 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const }
  const paths: Record<string, React.ReactNode> = {
    file: <><path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z"/><path d="M13 3v7h7M8 14h8M8 17h6"/></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h3"/></>,
    check: <><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    qr: <><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v6h-6v-2"/></>,
    spark: <><path d="m12 3 1.5 6.5L20 11l-6.5 1.5L12 19l-1.5-6.5L4 11l6.5-1.5L12 3Z"/><path d="m19 16 .6 2.4L22 19l-2.4.6L19 22l-.6-2.4L16 19l2.4-.6L19 16Z"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    arrowUp: <><path d="M7 17 17 7M7 7h10v10"/></>,
  }
  return <svg {...common}>{paths[name] ?? paths.spark}</svg>
}

function Brand({ light = false }: { light?: boolean }) {
  return <a className={`brand${light ? ' brand-light' : ''}`} href="/" aria-label="PrintFlow home"><span className="brand-mark"><span /></span><span>PrintFlow</span></a>
}

function Header() {
  return <header className="site-header"><div className="container nav-wrap"><Brand /><nav aria-label="Main navigation"><a href="#how-it-works">How it works</a><a href="#features">Why PrintFlow</a></nav><a className="button button-small button-dark" href="/order">Start an order <Icon name="arrowUp" size={16} /></a></div></header>
}

function OrderPreview() {
  return <div className="preview-stage" aria-label="Illustration of a print order ready for pickup">
    <div className="orb orb-one" /><div className="orb orb-two" />
    <div className="paper-card"><div className="paper-top"><div className="paper-logo"><span className="brand-mark mini"><span /></span> printflow</div><span className="file-type">PDF</span></div><div className="paper-lines"><i /><i /><i /><i /><i /></div><div className="paper-footer"><span>Project brief.pdf</span><span>4 pages</span></div></div>
    <div className="ready-card"><span className="ready-icon"><Icon name="check" size={18} /></span><span><b>Ready for pickup</b><small>Order #PF-2048</small></span><span className="ready-dot" /></div>
    <div className="pickup-card"><div className="qr-art" aria-hidden="true">{Array.from({ length: 36 }, (_, i) => <i key={i} className={i % 4 === 0 || i % 7 === 0 ? 'filled' : ''} />)}</div><span>YOUR PICKUP CODE</span><b>PF 2048</b></div>
    <div className="stage-caption"><span className="caption-dot" /> A smoother way to print</div>
  </div>
}

function Hero() {
  return <section className="hero" id="top"><div className="container hero-grid"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-line" /> PRINTING, ON YOUR TIME</div><h1>Skip the queue.<br /><span>Print before</span><br />you arrive.</h1><p className="hero-lede">Upload your documents, choose a print shop, pay, and collect when your order is ready. More time for what matters.</p><div className="hero-actions"><a className="button button-primary" href="/order">Start a Print Order <Icon name="arrow" /></a><a className="text-link" href="#how-it-works">How it works <span className="play-icon">▶</span></a></div><div className="hero-proof"><div className="proof-avatars"><span>J</span><span>M</span><span>A</span></div><p><b>Less waiting.</b> More doing.</p></div></div><OrderPreview /></div><div className="hero-bottom container"><span>MADE FOR BUSY DAYS</span><div><span className="bottom-mark">✳</span> Students <i /> Professionals <i /> Everyone on a deadline</div></div></section>
  }

function ProblemSolution() {
  return <section className="problem-section"><div className="container problem-grid"><div className="section-label"><span>01</span> THE OLD WAY</div><div className="problem-content"><h2>Deadlines don’t wait.<br /><span>Neither should you.</span></h2><p>Long queues at print shops waste time, especially during school, work, application, and deadline periods.</p></div><div className="solution-card"><span className="solution-icon"><Icon name="spark" /></span><span className="solution-tag">MEET PRINTFLOW</span><h3>Your print order,<br />already in motion.</h3><p>Place your print order before you arrive. We’ll let you know when it’s ready to pick up.</p><a href="#how-it-works" aria-label="See how PrintFlow works"><Icon name="arrow" size={20} /></a></div></div></section>
}

function HowItWorks() {
  return <section className="steps-section" id="how-it-works"><div className="container"><div className="section-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> A BETTER WAY, IN FOUR STEPS</div><h2>From file to pickup.<br /><span>That simple.</span></h2></div><p>Everything you need to get your documents printed, without the wait.</p></div><div className="steps-grid">{steps.map((step) => <article className="step-card" key={step.title}><div className="step-top"><span className="step-icon"><Icon name={step.icon} /></span><span className="step-number">{step.number}</span></div><h3>{step.title}</h3><p>{step.text}</p></article>)}</div></div></section>
}

function Features() {
  return <section className="features-section" id="features"><div className="container features-grid"><div className="features-intro"><div className="eyebrow eyebrow-light"><span className="eyebrow-line" /> PRINTING, WITHOUT THE FRICTION</div><h2>Your day has<br />better things<br /><span>to do.</span></h2><p>PrintFlow takes the busywork out of printing, so you can keep your day moving.</p><a href="/order" className="feature-link">Get started <Icon name="arrow" size={18} /></a></div><div className="feature-list">{features.map((feature, i) => <article className="feature-row" key={feature.title}><span className="feature-icon"><Icon name={feature.icon} size={21} /></span><div><span className="feature-index">0{i + 1}</span><h3>{feature.title}</h3><p>{feature.text}</p></div><Icon name="arrowUp" size={18} /></article>)}</div></div></section>
}

function CallToAction() {
  return <section className="cta-section" id="get-started"><div className="container cta-card"><div className="cta-spark cta-spark-left">✳</div><div className="cta-spark cta-spark-right">✳</div><span className="cta-kicker">A LITTLE MORE READY</span><h2>Your documents.<br /><span>Ready when you are.</span></h2><a className="button button-primary" href="/order">Start a Print Order <Icon name="arrow" /></a><p>No queues. No guesswork. Just pick up and go.</p></div></section>
}

function Footer() {
  return <footer className="site-footer"><div className="container footer-inner"><Brand light /><span>© {new Date().getFullYear()} PrintFlow. All rights reserved.</span><a href="#top" className="back-top">Back to top ↑</a></div></footer>
}

function App() {
  if (window.location.pathname === '/order') return <OrderFlow />
  if (window.location.pathname === '/shop') return <ShopDashboard />

  return <><Header /><main><Hero /><ProblemSolution /><HowItWorks /><Features /><CallToAction /></main><Footer /></>
}

export default App
