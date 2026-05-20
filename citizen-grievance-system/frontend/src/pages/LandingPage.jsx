import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Icon, inputClass } from "../components/ui";

const commandCenterImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAOMx1-g5j3s87MsMIL5EJhLcSbIfR0QTQprx88NOXOJW155o7Qn71Lk1rSSyMDssynmH6j3d_JC_j4o3h7H-gRyyibQNEMhlbtfzeFVdZnLW0Y2CawXb8OZrZThYg538KMALp-FZTeo8qspM4HlupnJuv7TaIAttUP34YSNdY21Jac1-_IDA32ERQbGU7-PqXIG5SPROferywFN5ms5FU4R092yKYMsnLqp3BlJFG0TBqyHOCziSH89vmj8XQcGmxZrzhsWZFgXME";
const aiAnalysisImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAAZoSC0QZbRptJeH3vDsK2-JALz9O50uzLKH1P805Bd3BZ1892MWHdEmOnEwFgSuW8II1RDhPMuhwPVbf-0AJMYK453p8UOEHkgZi9P2obnCm9yShSJgH9UiRDtkxSWE_ZXr-lGH2ZEWRdCsDE8GxKXqtYL5xUWjpl4UOi3ER-BNHmYlbkqzyDHPlb91KEcxoiiXsQhAHb0_a7zsyPlOYoQdSSKiTnpy1mIypook2s2YNN-wYgIL_C0Tz-RArVGo4OZsVtcV1S8us";
const civicAnalyticsImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDu8GddEU3EDJIIlWmpM-ecFZ85H_C1a-NVQZMXEr1rQSXrp-frxJuPQ15wNogF5bHajxk1sEoDragesyaD3PXRUbtJpdChgJ73bdtviubuExQql9a9neRkjQc8Hi70EjqmCRj3dGswxroMGWEmrVx3hQiWJafcq63yDGP88L5y5QMUbUt5epsQSbjqrPL8O3SZKXTWD25nws-HsDPzxEBCOUi1mkfaJ4KsSHevCsKVApTEwZB6FZCbvjSkd-w4dSJfx-o13Cky7_o";
const dashboardImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBrVeF3A0mS7fFkXx99QS0Tir3hUW_23K0jZoQKDe6iNj76Ox0yGtGYodvx7x4MFiSEy3Di3oaTAvdE7mtdKWUSIGuSKhJBiEXhGlwJH-FAE9GmEehTvnMk_syobDYXfLOpYXkeUmocLXwqr2zQ-xjRc7EZtlHaG61zMAOld6-W7W1_K3cQgiuFxY97MX55eI6wFOuWzT4RO4xrBo-IX6JPfV0iIQcVQEl4Px_mqdR7QcTJ1xkNK4O1J4URKvc_CroqU1-Cv2__tPw";

const navItems = [
  ["Home", "#home"],
  ["Features", "#features"],
  ["About", "#about"],
  ["How It Works", "#how-it-works"],
  ["Analytics", "#analytics"],
  ["Contact", "#contact"],
  ["Privacy", "#privacy"],
];

const analyticsStats = [
  ["12.4K", "Complaints processed", "Across civic categories"],
  ["87%", "Resolution rate", "Closed within SLA"],
  ["91%", "AI accuracy", "Routing confidence"],
  ["18+", "Active departments", "Live assignment queues"],
];

const featureCards = [
  ["route", "AI Department Routing", "Autonomous routing to the correct civic department with confidence scoring."],
  ["priority_high", "Priority Detection", "Critical safety, health, and infrastructure complaints are surfaced first."],
  ["gpp_bad", "Fake Complaint Detection", "Suspicious, duplicate, or invalid submissions are flagged for review."],
  ["sentiment_satisfied", "Sentiment Analysis", "Citizen distress and urgency signals inform the response workflow."],
  ["track_changes", "Complaint Tracking", "Citizens follow each complaint from intake to assignment, action, and closure."],
  ["map", "Heatmap Analytics", "Ward-level complaint clusters reveal recurring civic service pressure."],
  ["timer", "SLA Monitoring", "Response timelines, overdue cases, and escalations stay visible to officers."],
  ["insights", "Governance Intelligence", "Daily complaints become operational intelligence for administrators."],
];

const processSteps = [
  ["chat_bubble", "Citizen Intake", "Complaints are submitted with location, evidence, language support, and live proof."],
  ["psychology", "AI Synthesis", "Language, category, urgency, validity, and sentiment are analyzed together."],
  ["forward_to_inbox", "Dynamic Routing", "The right department and officer queue receive the case instantly."],
  ["verified", "Audit & Close", "Resolution status, SLA adherence, and citizen feedback complete the loop."],
];

const faqItems = [
  ["How are complaints tracked?", "Every complaint receives a unique ID and status trail from submission to resolution."],
  ["How does AI routing work?", "SAHAYAK AI reads the complaint, identifies the civic category, and recommends the right department queue."],
  ["How are priorities assigned?", "Priority combines risk, urgency, public impact, sentiment, and category-specific SLA rules."],
  ["How do citizens receive updates?", "Citizens can view live portal updates when complaints are routed, assigned, escalated, or resolved."],
  ["How is privacy protected?", "The platform uses role-based access and privacy-aware complaint handling for sensitive civic data."],
];

function scrollToHash(hash) {
  document.querySelector(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SectionIntro({ eyebrow, title, description, invert = false, centered = true }) {
  return (
    <div className={`${centered ? "mx-auto text-center" : ""} mb-10 max-w-3xl`}>
      {eyebrow ? <p className={`mb-3 text-xs font-bold uppercase tracking-[0.18em] ${invert ? "text-emerald-300" : "text-secondary"}`}>{eyebrow}</p> : null}
      <h2 className={`font-display text-3xl font-bold leading-tight md:text-4xl ${invert ? "text-white" : "text-primary"}`}>{title}</h2>
      {description ? <p className={`mt-4 leading-7 ${invert ? "text-slate-300" : "text-text-muted"}`}>{description}</p> : null}
    </div>
  );
}

function LandingNavbar() {
  const [activeSection, setActiveSection] = useState("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: [0.1, 0.35, 0.6] },
    );
    navItems.forEach(([, href]) => {
      const element = document.getElementById(href.slice(1));
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  function handleNavClick(event, href) {
    event.preventDefault();
    setOpen(false);
    scrollToHash(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        <a className="flex items-center gap-3" href="#home" onClick={(event) => handleNavClick(event, "#home")}>
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-[#081c35] text-white"><Icon name="account_balance" /></span>
          <span className="font-display text-xl font-extrabold tracking-tight text-black">SAHAYAK AI</span>
        </a>
        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map(([label, href]) => (
            <a key={href} className={`border-b-2 py-2 text-sm font-bold transition-colors ${activeSection === href.slice(1) ? "border-secondary text-secondary" : "border-transparent text-slate-600 hover:text-secondary"}`} href={href} onClick={(event) => handleNavClick(event, href)}>
              {label}
            </a>
          ))}
        </nav>
        <div className="hidden items-center gap-4 lg:flex">
          <Link className="text-sm font-bold text-slate-600 transition hover:text-black" to="/login">Login</Link>
          <Link className="rounded-md bg-[#081c35] px-5 py-3 text-sm font-bold text-slate-200 transition hover:bg-black" to="/login">Submit Complaint</Link>
        </div>
        <button className="rounded-md border border-slate-200 bg-white p-2 text-primary transition hover:bg-slate-50 lg:hidden" aria-label="Toggle navigation menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          <Icon name={open ? "close" : "menu"} />
        </button>
      </div>
      {open ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-lg lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1">
            {navItems.map(([label, href]) => (
              <a key={href} className={`rounded-md px-3 py-2 text-sm font-bold ${activeSection === href.slice(1) ? "bg-emerald-50 text-secondary" : "text-slate-600"}`} href={href} onClick={(event) => handleNavClick(event, href)}>{label}</a>
            ))}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Link className="rounded-md border border-slate-200 px-4 py-2 text-center text-sm font-bold text-primary" to="/login">Login</Link>
              <Link className="rounded-md bg-[#081c35] px-4 py-2 text-center text-sm font-bold text-white" to="/login">Submit Complaint</Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

function HeroSection() {
  return (
    <section id="home" className="grid-texture relative overflow-hidden bg-[#f7f9fb] py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:px-6 lg:grid-cols-2 lg:px-8">
        <div className="relative z-10">
          <span className="mb-6 inline-flex rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">AI-powered governance</span>
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-normal text-black md:text-5xl lg:text-6xl">Transforming Public Complaints into <span className="text-secondary">Governance Intelligence</span>.</h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">SAHAYAK AI uses machine learning to categorize, route, prioritize, and analyze civic feedback with institutional trust and citizen-first transparency.</p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-7 py-4 text-sm font-bold text-white shadow-lg transition hover:brightness-110" to="/login">Submit Complaint <Icon name="arrow_forward" /></Link>
            <Link className="inline-flex items-center justify-center gap-2 rounded-lg border border-black px-7 py-4 text-sm font-bold text-black transition hover:bg-white" to="/admin/login">Explore Dashboard <Icon name="dashboard" /></Link>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {analyticsStats.slice(0, 3).map(([value, label]) => (
              <div key={label} className="rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm"><p className="font-display text-3xl font-bold text-black">{value}</p><p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p></div>
            ))}
          </div>
        </div>
        <div className="relative flex min-h-[420px] items-center justify-center lg:min-h-[600px]">
          <div className="absolute inset-4 rounded-full bg-secondary/10 blur-3xl" />
          <div className="glass-panel ai-glow relative w-full overflow-hidden rounded-xl p-3 shadow-2xl transition hover:rotate-0 lg:rotate-1">
            <img className="h-auto w-full rounded-lg object-cover" src={commandCenterImage} alt="Smart city command center dashboard with urban data and AI governance metrics" loading="eager" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureEyebrow({ icon, label }) {
  return <div className="mb-3 flex items-center gap-2 text-secondary"><Icon name={icon} className="text-[20px]" /><span className="text-xs font-bold uppercase tracking-[0.18em]">{label}</span></div>;
}

function CheckLine({ text }) {
  return <div className="flex items-start gap-3"><Icon name="check_circle" className="mt-1 text-secondary" /><p className="leading-7 text-slate-700">{text}</p></div>;
}

function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mb-20 grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1"><div className="overflow-hidden rounded-xl border border-slate-200 shadow-xl"><img className="h-[360px] w-full object-cover md:h-[500px]" src={aiAnalysisImage} alt="AI analysis interface with neural routing data" loading="lazy" /></div></div>
          <div className="order-1 lg:order-2 lg:pl-10">
            <FeatureEyebrow icon="route" label="Intelligent logistics" />
            <h2 className="font-display text-3xl font-bold text-black md:text-4xl">Autonomous Complaint Routing</h2>
            <p className="mt-5 leading-7 text-slate-600">SAHAYAK AI analyzes sentiment, urgency, department category, and validity. It routes issues to the correct civic team and reduces manual triage delay.</p>
            <div className="mt-6 grid gap-3"><CheckLine text="Natural language understanding for English, Hindi, and local complaint patterns." /><CheckLine text="Automated priority flagging for public safety and critical infrastructure." /><CheckLine text="Manual review paths for low-confidence or suspicious complaints." /></div>
          </div>
        </div>
        <div className="mb-20 grid items-center gap-12 lg:grid-cols-2">
          <div className="lg:pr-10">
            <FeatureEyebrow icon="monitoring" label="Decision support" />
            <h2 className="font-display text-3xl font-bold text-black md:text-4xl">Predictive Urban Analytics</h2>
            <p className="mt-5 leading-7 text-slate-600">Move from reactive fixes to proactive governance. Complaint clusters, SLA health, and ward-level patterns help administrators identify systemic infrastructure stress before it becomes a civic crisis.</p>
            <div className="mt-7 rounded-xl border-l-4 border-secondary bg-slate-100 p-5"><p className="italic leading-7 text-slate-600">Heatmaps and SLA views help teams see exactly where public services need attention before complaint volume surges.</p><p className="mt-3 text-sm font-bold text-black">Director of Urban Planning, Smart City Cell</p></div>
          </div>
          <div><div className="overflow-hidden rounded-xl border border-slate-200 shadow-xl lg:translate-x-8"><img className="h-[360px] w-full object-cover md:h-[500px]" src={civicAnalyticsImage} alt="Urban analytics operation center with heatmap displays" loading="lazy" /></div></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map(([icon, title, description]) => <div key={title} className="rounded-lg border border-slate-200 bg-[#f7f9fb] p-5 transition hover:-translate-y-1 hover:border-secondary hover:bg-white hover:shadow-md"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-secondary"><Icon name={icon} /></div><h3 className="font-display text-lg font-bold text-black">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{description}</p></div>)}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return <section id="about" className="border-y border-slate-200 bg-[#f7f9fb] py-16 md:py-24"><div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8"><SectionIntro eyebrow="About SAHAYAK AI" title="Precision governance for modern cities" description="SAHAYAK AI creates a civic intelligence layer between citizens, officers, administrators, and field teams." /><div className="grid gap-5 md:grid-cols-3">{[["Vision", "Make public complaint systems transparent, intelligent, and citizen-first."], ["Mission", "Reduce manual routing delays and help departments resolve civic issues with measurable accountability."], ["Smart governance goals", "Improve service delivery, surface ward-level patterns, and support faster civic decision-making."]].map(([title, description]) => <div key={title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="font-display text-xl font-bold text-black">{title}</h3><p className="mt-3 leading-7 text-slate-600">{description}</p></div>)}</div></div></section>;
}

function HowItWorksSection() {
  const workflow = ["Citizen submits complaint", "AI analyzes complaint", "Department auto-routing", "Priority detection", "Officer assignment", "Resolution tracking", "Citizen feedback"];
  return <section id="how-it-works" className="border-y border-slate-200 bg-[#f7f9fb] py-16 md:py-24"><div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8"><SectionIntro title="Governance in Real Time" description="The seamless journey from public friction to institutional resolution." /><div className="relative grid gap-8 md:grid-cols-4"><div className="absolute left-0 top-12 hidden h-px w-full bg-slate-300 md:block" />{processSteps.map(([icon, title, description]) => <div key={title} className="group relative text-center"><div className="ai-glow mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition group-hover:border-secondary"><Icon name={icon} className="text-4xl text-slate-600 transition group-hover:text-secondary" /></div><h3 className="font-display text-xl font-bold text-black">{title}</h3><p className="mt-3 leading-7 text-slate-600">{description}</p></div>)}</div><div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">{workflow.map((step, index) => <div key={step} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><p className="font-mono text-sm font-bold text-secondary">0{index + 1}</p><p className="mt-2 text-sm font-bold text-black">{step}</p></div>)}</div></div></section>;
}

function AnalyticsSection() {
  return <section id="analytics" className="relative overflow-hidden bg-[#081c35] py-16 text-white md:py-24"><div className="absolute -right-16 top-16 h-56 w-56 rounded-full bg-secondary/20 blur-3xl" /><div className="absolute -bottom-20 left-0 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" /><div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8"><SectionIntro invert eyebrow="Analytics" title="Universal Command Center" description="Every complaint, department, SLA timeline, AI confidence signal, and citizen interaction visualized in one interface for decision makers." /><div className="mx-auto max-w-5xl"><div className="ai-glow overflow-hidden rounded-xl border border-slate-500/30 bg-[#071b34] p-2 shadow-2xl"><img className="w-full rounded-lg opacity-90" src={dashboardImage} alt="Advanced governance dashboard with urban metrics" loading="lazy" /></div></div><div className="mt-10 grid gap-4 md:grid-cols-4">{analyticsStats.map(([value, label, note]) => <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-5"><p className="font-display text-3xl font-bold text-emerald-300">{value}</p><p className="mt-2 text-sm font-bold uppercase tracking-wide text-white">{label}</p><p className="mt-1 text-sm text-slate-300">{note}</p></div>)}</div></div></section>;
}

function TrustSection() {
  const cards = [["shield_person", "Unshakeable Transparency", "Public audit trails for AI-assisted decisions and complaint movement."], ["verified_user", "Secure Governance", "Role-based access, secure complaint handling, and privacy-aware workflows."], ["account_balance", "Citizen First Policy", "Built to prioritize public safety, vulnerable citizens, and service fairness."]];
  return <section className="bg-white py-16 md:py-24"><div className="mx-auto grid max-w-7xl gap-6 px-4 md:grid-cols-3 md:px-6 lg:px-8">{cards.map(([icon, title, description]) => <div key={title} className="rounded-xl border border-slate-200 bg-[#f7f9fb] p-8 text-center transition hover:-translate-y-1 hover:shadow-md"><div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-secondary"><Icon name={icon} className="text-4xl" /></div><h3 className="font-display text-xl font-bold text-black">{title}</h3><p className="mt-3 leading-7 text-slate-600">{description}</p></div>)}</div></section>;
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);
  return <section className="bg-[#f7f9fb] py-16 md:py-24"><div className="mx-auto max-w-3xl px-4 md:px-6"><SectionIntro title="Frequently Asked Questions" description="Clarifying how SAHAYAK AI handles tracking, AI decisions, routing, priorities, and privacy." /><div className="space-y-4">{faqItems.map(([question, answer], index) => { const isOpen = openIndex === index; return <div key={question} className="rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-secondary"><button className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-lg font-bold text-black" onClick={() => setOpenIndex(isOpen ? -1 : index)}><span>{question}</span><Icon name={isOpen ? "expand_less" : "expand_more"} className="shrink-0 text-slate-500" /></button>{isOpen ? <p className="border-t border-slate-200 px-5 py-4 leading-7 text-slate-600">{answer}</p> : null}</div>; })}</div></div></section>;
}

function ContactSection() {
  const [sent, setSent] = useState(false);
  return <section id="contact" className="bg-white py-16 md:py-24"><div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-6 lg:grid-cols-[1fr_420px] lg:px-8"><div><SectionIntro centered={false} eyebrow="Contact" title="Governance Inquiries" description="Reach the SAHAYAK AI civic support desk for platform queries, city onboarding, or citizen support." /><div className="rounded-xl border border-slate-200 bg-[#f7f9fb] p-6 shadow-sm"><form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); setSent(true); }}><input className={inputClass} placeholder="Full name" required /><input className={inputClass} placeholder="Email address" type="email" required /><input className={inputClass} placeholder="Department or ward" /><input className={inputClass} placeholder="Phone number" type="tel" /><textarea className={`${inputClass} min-h-32 md:col-span-2`} placeholder="How can we help?" required /><button className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-secondary px-6 py-3 text-sm font-bold text-white transition hover:brightness-110 md:col-span-2" type="submit">Send Message <Icon name="send" /></button>{sent ? <p className="text-sm font-semibold text-secondary md:col-span-2">Thanks. Your inquiry has been noted for the support team.</p> : null}</form></div></div><div className="space-y-4">{[["Emergency helplines", "Police 100 - Fire 101 - Ambulance 108", "call"], ["Email", "support@sahayak.ai", "mail"], ["Address", "Municipal Civic Center, Smart Governance Wing", "location_on"], ["Social media", "LinkedIn - X - Facebook - YouTube", "share"]].map(([title, value, icon]) => <div key={title} className="rounded-xl border border-slate-200 bg-[#f7f9fb] p-5 shadow-sm"><div className="flex gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-secondary"><Icon name={icon} /></div><div><p className="font-display font-bold text-black">{title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{value}</p></div></div></div>)}</div></div></section>;
}

function PrivacySection() {
  return <section id="privacy" className="grid-texture relative overflow-hidden bg-[#081c35] py-16 text-white md:py-20"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-4 md:px-6 lg:flex-row lg:items-center lg:px-8"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Privacy Policy</p><h2 className="font-display text-3xl font-bold">Advanced Security Architecture</h2><p className="mt-3 max-w-2xl leading-7 text-slate-300">Secure complaint handling, AI transparency, role-based access, and citizen privacy assurance are built into the platform workflow.</p></div><div className="flex flex-col gap-3 sm:flex-row">{[["lock", "Secure Handling"], ["verified", "AI Transparency"], ["admin_panel_settings", "Citizen Privacy"]].map(([icon, label]) => <div key={label} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3"><Icon name={icon} className="text-emerald-300" /><span className="text-sm font-bold text-white">{label}</span></div>)}</div></div></section>;
}

function LandingFooter() {
  const year = useMemo(() => new Date().getFullYear(), []);
  const groups = [["Product", ["Features", "Analytics", "Security"]], ["Company", ["About", "Contact", "Help Center"]], ["Legal", ["Privacy Policy", "Terms", "AI Transparency"]]];
  return <footer className="bg-[#081c35] text-white"><div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4 md:px-6 lg:px-8"><div><p className="font-display text-xl font-extrabold">SAHAYAK AI</p><p className="mt-4 text-sm leading-6 text-slate-300">Precise governance for modern cities. Building citizen-government interaction through responsible artificial intelligence.</p></div>{groups.map(([title, links]) => <div key={title} className="grid gap-2"><p className="mb-2 font-bold text-white">{title}</p>{links.map((link) => <a key={link} className="text-sm text-slate-300 transition hover:text-emerald-300" href={link === "Privacy Policy" ? "#privacy" : "#home"}>{link}</a>)}</div>)}</div><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 border-t border-white/10 px-4 py-5 text-sm text-slate-400 md:flex-row md:items-center md:px-6 lg:px-8"><p>Copyright {year} SAHAYAK AI. All rights reserved. Version 2.4.0-Stable.</p><div className="flex gap-4">{["public", "monitoring", "share"].map((icon) => <a key={icon} className="text-slate-400 transition hover:text-emerald-300" href="#contact" aria-label={icon}><Icon name={icon} /></a>)}</div></div></footer>;
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fb] text-slate-900">
      <LandingNavbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AboutSection />
        <HowItWorksSection />
        <AnalyticsSection />
        <TrustSection />
        <FaqSection />
        <ContactSection />
        <PrivacySection />
      </main>
      <LandingFooter />
    </div>
  );
}
