import { Link } from "react-router-dom";

const commandCenterImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAOMx1-g5j3s87MsMIL5EJhLcSbIfR0QTQprx88NOXOJW155o7Qn71Lk1rSSyMDssynmH6j3d_JC_j4o3h7H-gRyyibQNEMhlbtfzeFVdZnLW0Y2CawXb8OZrZThYg538KMALp-FZTeo8qspM4HlupnJuv7TaIAttUP34YSNdY21Jac1-_IDA32ERQbGU7-PqXIG5SPROferywFN5ms5FU4R092yKYMsnLqp3BlJFG0TBqyHOCziSH89vmj8XQcGmxZrzhsWZFgXME";
const aiAnalysisImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAAZoSC0QZbRptJeH3vDsK2-JALz9O50uzLKH1P805Bd3BZ1892MWHdEmOnEwFgSuW8II1RDhPMuhwPVbf-0AJMYK453p8UOEHkgZi9P2obnCm9yShSJgH9UiRDtkxSWE_ZXr-lGH2ZEWRdCsDE8GxKXqtYL5xUWjpl4UOi3ER-BNHmYlbkqzyDHPlb91KEcxoiiXsQhAHb0_a7zsyPlOYoQdSSKiTnpy1mIypook2s2YNN-wYgIL_C0Tz-RArVGo4OZsVtcV1S8us";
const civicAnalyticsImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDu8GddEU3EDJIIlWmpM-ecFZ85H_C1a-NVQZMXEr1rQSXrp-frxJuPQ15wNogF5bHajxk1sEoDragesyaD3PXRUbtJpdChgJ73bdtviubuExQql9a9neRkjQc8Hi70EjqmCRj3dGswxroMGWEmrVx3hQiWJafcq63yDGP88L5y5QMUbUt5epsQSbjqrPL8O3SZKXTWD25nws-HsDPzxEBCOUi1mkfaJ4KsSHevCsKVApTEwZB6FZCbvjSkd-w4dSJfx-o13Cky7_o";
const dashboardImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBrVeF3A0mS7fFkXx99QS0Tir3hUW_23K0jZoQKDe6iNj76Ox0yGtGYodvx7x4MFiSEy3Di3oaTAvdE7mtdKWUSIGuSKhJBiEXhGlwJH-FAE9GmEehTvnMk_syobDYXfLOpYXkeUmocLXwqr2zQ-xjRc7EZtlHaG61zMAOld6-W7W1_K3cQgiuFxY97MX55eI6wFOuWzT4RO4xrBo-IX6JPfV0iIQcVQEl4Px_mqdR7QcTJ1xkNK4O1J4URKvc_CroqU1-Cv2__tPw";

const navLinks = [
  ["Home", "#home"],
  ["Features", "#features"],
  ["About", "#about"],
  ["Analytics", "#analytics"],
  ["Contact", "#contact"],
];

const processSteps = [
  ["chat_bubble", "Citizen Intake", "Complaints submitted via web, app, or IoT portal."],
  ["psychology", "AI Synthesis", "Neural categorization and cross-reference with city data."],
  ["forward_to_inbox", "Dynamic Routing", "Instant dispatch to localized municipal field teams."],
  ["verified", "Audit & Close", "Resolution verified by AI and citizen feedback loops."],
];

const trustCards = [
  ["shield_person", "Unshakeable Transparency", "Public audit trails for every AI decision, ensuring 100% institutional accountability."],
  ["verified_user", "Secure Governance", "Sovereign data hosting with military-grade encryption and PII sanitization."],
  ["account_balance", "Citizen First Policy", "Engineered to prioritize vulnerable populations through bias-aware AI models."],
];

const faqs = [
  "How do you handle PII and data sovereignty?",
  "Can SAHAYAK integrate with existing ERP software?",
  "What is the typical deployment timeline?",
];

function MaterialIcon({ name, className = "" }) {
  return <span className={`material-symbols-outlined ${className}`}>{name}</span>;
}

export default function HomePage() {
  return (
    <div className="min-h-screen scroll-smooth bg-[#f7f9fb] font-sans text-[#191c1e] selection:bg-[#7ffc97] selection:text-[#002109]">
      <header className="sticky top-0 z-50 border-b border-[#c4c6ce] bg-white shadow-sm">
        <div className="mx-auto flex h-20 w-full max-w-[1280px] items-center justify-between px-6 py-2">
          <Link className="font-display text-2xl font-bold tracking-tight text-black" to="/">
            SAHAYAK AI
          </Link>
          <nav className="hidden items-center gap-10 md:flex">
            {navLinks.map(([label, href], index) => (
              <a
                className={`text-sm font-semibold transition-colors duration-200 hover:text-[#006e2d] ${
                  index === 0 ? "border-b-2 border-[#006e2d] text-[#006e2d]" : "text-[#44474d]"
                }`}
                href={href}
                key={href}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-6">
            <Link className="hidden text-sm font-medium text-[#44474d] transition-colors hover:text-black md:block" to="/login">
              Login
            </Link>
            <Link
              className="rounded px-6 py-2 text-sm font-medium text-[#7385a3] transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#081c35" }}
              to="/submit"
            >
              Submit Complaint
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-[radial-gradient(#e2e8f0_0.5px,transparent_0.5px)] bg-[length:24px_24px] pb-24 pt-16" id="home">
          <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-16 px-6 lg:grid-cols-2">
            <div className="z-10">
              <span className="mb-6 inline-block rounded-xl bg-[#7ffc97] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#005320]">
                AI-Powered Governance
              </span>
              <h1 className="mb-6 max-w-2xl font-display text-[40px] font-bold leading-[1.1] tracking-normal text-black md:text-5xl">
                Transforming Public Complaints into <span className="text-[#006e2d]">Governance Intelligence</span>.
              </h1>
              <p className="mb-16 max-w-xl text-lg leading-[1.6] text-[#44474d]">
                SAHAYAK AI leverages advanced large language models and machine learning to categorize, route, and analyze
                civic feedback with unshakeable institutional trust.
              </p>
              <div className="flex flex-wrap gap-6">
                <a
                  className="rounded-lg bg-[#006e2d] px-10 py-6 text-sm font-medium text-white shadow-lg transition-all hover:brightness-110"
                  href="#features"
                >
                  Explore Platform
                </a>
                <a
                  className="rounded-lg border border-black px-10 py-6 text-sm font-medium text-black transition-all hover:bg-[#f2f4f6]"
                  href="#analytics"
                >
                  View Case Studies
                </a>
              </div>
            </div>
            <div className="relative flex items-center justify-center lg:h-[600px]">
              <div className="absolute inset-0 -translate-y-12 rounded-full bg-[#006e2d]/5 blur-3xl" />
              <div className="relative w-full rotate-2 overflow-hidden rounded-lg border border-slate-200/50 bg-white/70 p-4 shadow-2xl shadow-[#16a34a]/15 backdrop-blur-xl">
                <img alt="Smart City Command Center" className="h-auto w-full rounded" src={commandCenterImage} />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16" id="features">
          <div className="mx-auto max-w-[1280px] px-6">
            <div className="mb-24 grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <div className="overflow-hidden rounded-lg border border-[#c4c6ce]/30 shadow-xl">
                  <img alt="AI Analysis" className="h-[500px] w-full object-cover" src={aiAnalysisImage} />
                </div>
              </div>
              <div className="order-1 lg:order-2 lg:pl-16">
                <div className="mb-2 flex items-center gap-2 text-[#006e2d]">
                  <MaterialIcon className="text-lg" name="account_tree" />
                  <span className="text-xs font-semibold uppercase tracking-widest">Intelligent Logistics</span>
                </div>
                <h2 className="mb-6 font-display text-[32px] font-semibold leading-[1.2] tracking-normal text-black">
                  Autonomous Complaint Routing
                </h2>
                <p className="mb-6 text-base leading-relaxed text-[#44474d]">
                  SAHAYAK AI instantly analyzes the sentiment, urgency, and category of every public submission. It
                  autonomously routes issues to the correct department, reducing administrative lag by up to 70%.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                    <MaterialIcon className="mt-1 text-[#006e2d]" name="check_circle" />
                    <span>Natural Language Understanding of local dialects.</span>
                  </li>
                  <li className="flex items-start gap-4">
                    <MaterialIcon className="mt-1 text-[#006e2d]" name="check_circle" />
                    <span>Automated priority flagging for critical infrastructure.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
              <div className="lg:pr-16">
                <div className="mb-2 flex items-center gap-2 text-[#006e2d]">
                  <MaterialIcon className="text-lg" name="monitoring" />
                  <span className="text-xs font-semibold uppercase tracking-widest">Decision Support</span>
                </div>
                <h2 className="mb-6 font-display text-[32px] font-semibold leading-[1.2] tracking-normal text-black">
                  Predictive Urban Analytics
                </h2>
                <p className="mb-6 text-base leading-relaxed text-[#44474d]">
                  Move from reactive fixes to proactive governance. Our AI maps complaint clusters to identify systemic
                  infrastructure failures before they escalate into civic crises.
                </p>
                <div className="rounded-lg border-l-4 border-[#006e2d] bg-[#eceef0] p-6">
                  <p className="italic text-[#44474d]">
                    "The heatmaps provided by SAHAYAK AI allowed our municipal board to reallocate budget to the precise
                    wards needing water-grid updates, six months before the peak summer surge."
                  </p>
                  <p className="mt-4 text-sm font-medium text-black">- Director of Urban Planning, Metro City</p>
                </div>
              </div>
              <div>
                <div className="overflow-hidden rounded-lg border border-[#c4c6ce]/30 shadow-xl lg:translate-x-12">
                  <img alt="Civic Analytics" className="h-[500px] w-full object-cover" src={civicAnalyticsImage} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-[#c4c6ce]/20 bg-[#f7f9fb] py-16" id="about">
          <div className="mx-auto mb-16 max-w-[1280px] px-6 text-center">
            <h2 className="mb-2 font-display text-[32px] font-semibold leading-[1.2] tracking-normal text-black">
              Governance in Real-Time
            </h2>
            <p className="text-[#44474d]">The seamless journey from public friction to institutional resolution.</p>
          </div>
          <div className="mx-auto max-w-[1280px] px-6">
            <div className="relative flex flex-col items-start justify-between gap-10 md:flex-row">
              <div className="absolute left-0 top-12 -z-0 hidden h-[2px] w-full bg-[#c4c6ce]/30 md:block" />
              {processSteps.map(([icon, title, copy]) => (
                <div className="group relative z-10 flex-1 text-center" key={title}>
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-xl border border-[#c4c6ce] bg-white shadow-sm transition-colors group-hover:border-[#006e2d] group-hover:shadow-[#16a34a]/15">
                    <MaterialIcon className="text-4xl text-[#44474d] group-hover:text-[#006e2d]" name={icon} />
                  </div>
                  <h3 className="mb-2 font-display text-2xl font-semibold leading-[1.3] text-black">{title}</h3>
                  <p className="text-[#44474d]">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-[#081c35] py-16 text-white" id="analytics">
          <div className="mx-auto max-w-[1280px] px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-6 font-display text-[32px] font-semibold leading-[1.2] text-white">Universal Command Center</h2>
              <p className="mx-auto max-w-2xl text-[#7184a9]">
                Every data point, every citizen interaction, visualized in one singular interface for decision makers.
              </p>
            </div>
            <div className="relative mx-auto max-w-5xl">
              <div className="overflow-hidden rounded-lg border border-[#7184a9]/20 bg-[#071B34] p-2 shadow-2xl shadow-[#16a34a]/15 md:p-1">
                <img alt="Advanced Dashboard" className="w-full rounded opacity-90" src={dashboardImage} />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-6 md:grid-cols-3">
            {trustCards.map(([icon, title, copy]) => (
              <div className="flex flex-col items-center rounded-lg border border-[#c4c6ce]/30 bg-[#f7f9fb] p-10 text-center" key={title}>
                <div className="mb-6 rounded-xl bg-[#006e2d]/10 p-6">
                  <MaterialIcon className="text-4xl text-[#006e2d]" name={icon} />
                </div>
                <h4 className="mb-2 font-display text-2xl font-semibold leading-[1.3] text-black">{title}</h4>
                <p className="text-[#44474d]">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[#f7f9fb] py-16" id="contact">
          <div className="mx-auto max-w-3xl px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-6 font-display text-[32px] font-semibold leading-[1.2] text-black">Governance Inquiries</h2>
              <p className="text-[#44474d]">Clarifying how SAHAYAK AI integrates with legacy systems.</p>
            </div>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div className="cursor-pointer rounded-lg border border-[#c4c6ce] bg-white p-6 shadow-sm transition-all hover:border-[#006e2d]" key={faq}>
                  <div className="flex items-center justify-between gap-4">
                    <h5 className="font-display text-lg font-semibold text-black">{faq}</h5>
                    <MaterialIcon className="text-[#44474d]" name="expand_more" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#081c35] py-16">
          <div className="relative z-10 mx-auto flex max-w-[1280px] flex-col items-center justify-between px-6 md:flex-row">
            <div className="mb-10 md:mb-0">
              <h2 className="mb-2 font-display text-[32px] font-semibold leading-[1.2] text-white">Advanced Security Architecture</h2>
              <p className="text-[#7184a9]">Protecting civic trust with AI-driven threat monitoring.</p>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-6 py-2">
                <MaterialIcon className="text-sm text-[#7ffc97]" name="lock" />
                <span className="text-xs font-semibold text-white">ISO 27001 Certified</span>
              </div>
              <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-6 py-2">
                <MaterialIcon className="text-sm text-[#7ffc97]" name="verified" />
                <span className="text-xs font-semibold text-white">GDPR Compliant</span>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_0.5px,transparent_0.5px)] bg-[length:24px_24px] opacity-10" />
        </section>
      </main>

      <footer className="bg-[#081c35]">
        <div className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-10 px-6 py-16 md:grid-cols-4">
          <div>
            <div className="mb-6 font-display text-2xl font-bold text-[#7385a3]">SAHAYAK AI</div>
            <p className="text-xs font-semibold leading-relaxed text-[#7184a9]">
              Precise Governance for Modern Cities. Building the future of citizen-government interaction through ethical
              artificial intelligence.
            </p>
          </div>
          <FooterColumn title="Product" links={["Features", "Analytics", "Security", "Terms of Service"]} />
          <FooterColumn title="Company" links={["About", "Contact", "Privacy Policy"]} />
          <div className="flex flex-col gap-2">
            <span className="mb-2 text-sm font-bold text-[#7385a3]">Legal</span>
            <p className="text-xs font-semibold text-[#7184a9]">2024 SAHAYAK AI. All rights reserved. Precise Governance for Modern Cities.</p>
          </div>
        </div>
        <div className="mx-auto max-w-[1280px] border-t border-[#7184a9]/10 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              {["public", "monitoring", "share"].map((icon) => (
                <MaterialIcon className="cursor-pointer text-[#7184a9] hover:text-[#7ffc97]" key={icon} name={icon} />
              ))}
            </div>
            <div className="text-xs font-semibold text-[#7184a9]/60">Version 2.4.0-Stable</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="mb-2 text-sm font-bold text-[#7385a3]">{title}</span>
      {links.map((link) => (
        <a className="text-xs font-semibold text-[#7184a9] transition-colors hover:text-[#7ffc97]" href="#" key={link}>
          {link}
        </a>
      ))}
    </div>
  );
}
