import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
    ArrowRight, Shield, Cpu, Radio,
    Users, Droplets, Zap, Globe,
    Activity, MapPin, Clock, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HydroSentryLogo } from '@/components/HydroSentryLogo';

// ── Scroll reveal via IntersectionObserver ─────────────────────
function useScrollReveal() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); observer.unobserve(el); } },
            { threshold: 0.12, rootMargin: '0px 0px -30px 0px' },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    return ref;
}

function Reveal({ children, className = '', stagger = false }: { children: React.ReactNode; className?: string; stagger?: boolean }) {
    const ref = useScrollReveal();
    return <div ref={ref} className={`${stagger ? 'stagger-children' : 'scroll-reveal'} ${className}`}>{children}</div>;
}

// ── Operational Status Ticker ──────────────────────────────────
function StatusTicker() {
    const [time, setTime] = useState(new Date());
    useEffect(() => { const iv = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(iv); }, []);
    return (
        <div className="flex items-center gap-4 text-xs font-mono tracking-wide">
            <span className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-emerald-700 uppercase font-semibold">Operational</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">{time.toLocaleTimeString('en-US', { hour12: false })} WAT</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">Borno State, Nigeria</span>
        </div>
    );
}

// ── Component ──────────────────────────────────────────────────
export default function Landing() {
    const navigate = useNavigate();
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            setScrollProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-sky-100" style={{ fontFamily: "'Inter', sans-serif" }}>
            {/* Scroll Progress */}
            <div className="scroll-progress shadow-[0_0_10px_rgba(2,132,199,0.5)]" style={{ width: `${scrollProgress}%` }} />

            {/* ───── NAV ──────────────────────────────────────────── */}
            <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16">
                    <HydroSentryLogo size="small" />
                    <div className="flex items-center gap-6">
                        <StatusTicker />
                        <div className="h-6 w-px bg-slate-200 hidden md:block" />
                        <Button
                            onClick={() => navigate('/login')}
                            size="sm"
                            className="bg-[#005587] hover:bg-[#003d63] text-white text-xs font-semibold px-6 h-9 rounded shadow-sm transition-all hover:shadow-md"
                        >
                            System Login
                        </Button>
                    </div>
                </div>
            </nav>

            {/* ───── HERO ─────────────────────────────────────────── */}
            <section className="relative overflow-hidden bg-white border-b border-slate-200">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

                <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
                    {/* System Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-200 bg-sky-50 text-sky-800 mb-8 shadow-sm">
                        <Shield className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                            Early Warning System • Climate, Peace & Security
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-slate-900 mb-6">
                        Decentralized Intelligence for <span className="text-[#005587]">Climate Resilience</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        HydroSentry protects off-grid, displacement-affected communities in the Lake Chad Basin through edge AI, autonomous LoRaWAN alerts, and youth-led action.
                    </p>

                    {/* CTAs */}
                    <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button
                            onClick={() => navigate('/login')}
                            className="bg-[#005587] hover:bg-[#003d63] text-white text-base font-semibold px-8 h-12 rounded-lg shadow-md transition-all hover:shadow-lg w-full sm:w-auto"
                        >
                            Access Command Center <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth' })}
                            className="border-slate-300 text-slate-700 hover:bg-slate-50 text-base font-semibold px-8 h-12 rounded-lg transition-all w-full sm:w-auto"
                        >
                            View Architecture
                        </Button>
                    </div>
                </div>
            </section>

            {/* ───── STATS BAR ────────────────────────────────────── */}
            <Reveal>
                <section className="bg-white border-b border-slate-200 shadow-sm relative z-10 -mt-px">
                    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
                        {[
                            { value: '10', label: 'Sensor Nodes', sub: 'Active LoRaWAN Mesh', icon: Radio },
                            { value: '847', label: 'SMS Alerts', sub: 'Successfully Dispatched', icon: Activity },
                            { value: '9/10', label: 'Network Health', sub: 'Online Status', icon: Globe },
                            { value: '< 1s', label: 'Inference Time', sub: 'Edge AI Processing', icon: Zap },
                        ].map((s, i) => (
                            <div key={i} className="px-6 py-8 text-center bg-slate-50/50 hover:bg-sky-50/50 transition-colors">
                                <s.icon className="h-6 w-6 text-[#005587] mx-auto mb-3 opacity-80" />
                                <p className="text-3xl font-extrabold text-slate-900 tabular-nums tracking-tight">{s.value}</p>
                                <p className="text-sm font-semibold text-slate-700 mt-2">{s.label}</p>
                                <p className="text-xs text-slate-500 mt-1">{s.sub}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </Reveal>

            {/* ───── THE CRISIS ───────────────────────────────────── */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-5xl mx-auto">
                    <Reveal>
                        <div className="mb-14">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-[2px] w-8 bg-rose-600" />
                                <p className="text-xs font-bold uppercase tracking-widest text-rose-600">Context & Challenge</p>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight max-w-3xl">
                                Climate shocks are multiplying conflict in Northeast Nigeria.
                            </h2>
                            <p className="text-base text-slate-600 mt-4 max-w-2xl leading-relaxed">
                                The September 2024 Alau Dam collapse displaced 400,000 people in Maiduguri with zero effective
                                last-mile warning. Existing systems rely heavily on cloud infrastructure that fails exactly when communities
                                need it most—during telecom blackouts caused by severe weather.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal stagger>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { stat: '400K+', label: 'People Displaced', desc: 'From recent severe flooding events lacking last-mile community alerts.', color: 'border-rose-600', iconColor: 'text-rose-600', bg: 'bg-rose-50' },
                                { stat: '<1%', label: 'Youth Climate Funding', desc: 'Despite youth constituting nearly half the affected population.', color: 'border-amber-500', iconColor: 'text-amber-600', bg: 'bg-amber-50' },
                                { stat: 'Zero', label: 'Offline Resilience', desc: 'Current early warning systems fail when internet connectivity drops.', color: 'border-slate-400', iconColor: 'text-slate-600', bg: 'bg-slate-100' },
                            ].map((c, i) => (
                                <div key={i} className={`p-8 rounded-xl bg-white border border-slate-200 shadow-sm border-t-4 ${c.color} hover:shadow-md transition-shadow`}>
                                    <p className={`text-4xl font-black ${c.iconColor} tracking-tight`}>{c.stat}</p>
                                    <p className="text-base font-bold text-slate-900 mt-3">{c.label}</p>
                                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{c.desc}</p>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ───── ARCHITECTURE ─────────────────────────────────── */}
            <section id="architecture" className="py-24 px-6 bg-white border-y border-slate-200">
                <div className="max-w-5xl mx-auto">
                    <Reveal>
                        <div className="mb-16 md:text-center">
                            <div className="flex items-center md:justify-center gap-3 mb-4">
                                <div className="h-[2px] w-8 bg-[#005587]" />
                                <p className="text-xs font-bold uppercase tracking-widest text-[#005587]">Technical Architecture</p>
                                <div className="h-[2px] w-8 bg-[#005587] hidden md:block" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                                Sense, Process, Alert. Completely Offline.
                            </h2>
                            <p className="text-base text-slate-600 mt-4 max-w-2xl mx-auto leading-relaxed">
                                HydroSentry's entire early warning pipeline operates independently of internet connectivity, engineered for maximum resilience in austere environments.
                            </p>
                        </div>
                    </Reveal>

                    <Reveal stagger>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    step: 'Phase 01', icon: Droplets, title: 'Sense & Collect',
                                    desc: 'Rugged ultrasonic sensors measure water levels every 30 seconds. Solar-powered units ensure 5-10 years of continuous operation.',
                                },
                                {
                                    step: 'Phase 02', icon: Cpu, title: 'Edge Processing',
                                    desc: 'Embedded TinyML models continuously analyze flow patterns on the node, detecting dangerous anomalies locally in milliseconds.',
                                },
                                {
                                    step: 'Phase 03', icon: Zap, title: 'Autonomous Dispatch',
                                    desc: 'Upon threat detection, nodes autonomously trigger local sirens and utilize LoRaWAN gateways to dispatch SMS alerts bypassing internet outages.',
                                },
                            ].map((item, i) => (
                                <div key={i} className="relative p-8 rounded-xl bg-slate-50 border border-slate-200 hover:border-sky-200 hover:bg-sky-50/30 transition-colors group">
                                    <div className="absolute top-8 right-8 text-4xl font-black text-slate-200 group-hover:text-sky-100 transition-colors">
                                        {`0${i + 1}`}
                                    </div>
                                    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-6 shadow-sm group-hover:border-[#005587] group-hover:text-[#005587] transition-colors">
                                        <item.icon className="h-6 w-6 text-slate-600 group-hover:text-[#005587]" />
                                    </div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-sky-700 mb-2">{item.step}</p>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ───── CAPABILITIES ─────────────────────────────────── */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <Reveal>
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-[2px] w-8 bg-[#005587]" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-[#005587]">Core Capabilities</p>
                                </div>
                                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                                    Empowering local wardens with actionable intelligence.
                                </h2>
                                <p className="text-base text-slate-600 leading-relaxed mb-8">
                                    Technology alone cannot save lives. HydroSentry merges resilient hardware with a community-led operational framework. We recruit, train, and equip local youth as Sensor Wardens—turning vulnerability into active resilience.
                                </p>

                                <ul className="space-y-5">
                                    {[
                                        { title: 'Youth-Led Maintenance', desc: '10 trained local wardens receive stipends to secure and maintain nodes.' },
                                        { title: 'Dual-Crisis Monitoring', desc: 'Switches seamlessly between wet season flood risks and dry season conflict resource mapping.' },
                                        { title: 'Incident Dispatcher', desc: 'Integrated command center for tracking maintenance, alerts, and community reports in real-time.' }
                                    ].map((f, i) => (
                                        <li key={i} className="flex gap-4">
                                            <div className="flex-shrink-0 mt-1">
                                                <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#005587]" />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900">{f.title}</h4>
                                                <p className="text-sm text-slate-600 mt-1">{f.desc}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Reveal>

                        <Reveal className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
                            <div className="aspect-[4/3] rounded-xl bg-slate-100 flex flex-col items-center justify-center border border-slate-200 p-8 text-center overflow-hidden relative">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1584281729054-0518dc90539b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
                                <MapPin className="h-12 w-12 text-[#005587] mb-4 relative z-10" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2 relative z-10">Command Center Interface</h3>
                                <p className="text-sm text-slate-600 relative z-10">Displays active geospatial tracking, telemetry data, and real-time alert logs.</p>
                                <div className="w-full max-w-sm h-32 bg-white mt-8 rounded-t-lg border-x border-t border-slate-200 shadow-sm relative z-10 flex px-4 pt-4 gap-3">
                                    <div className="w-1/3 bg-slate-100 rounded-md" />
                                    <div className="w-2/3 space-y-2">
                                        <div className="h-4 bg-slate-100 rounded w-full" />
                                        <div className="h-4 bg-slate-100 rounded w-5/6" />
                                        <div className="h-4 bg-sky-50 rounded w-4/6 border border-sky-100" />
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* ───── CTA ──────────────────────────────────────────── */}
            <section className="py-24 px-6 border-t border-slate-200 bg-white">
                <Reveal>
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-sky-100">
                            <Shield className="h-8 w-8 text-[#005587]" />
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-5">
                            Access the HydroSentry Dashboard
                        </h2>
                        <p className="text-base text-slate-600 mb-10 max-w-xl mx-auto leading-relaxed">
                            Authorized personnel only. Review live telemetry, manage sensor nodes, and dispatch work orders through the secure Command Center interface.
                        </p>
                        <Button
                            onClick={() => navigate('/login')}
                            size="lg"
                            className="bg-[#005587] hover:bg-[#003d63] text-white text-base font-semibold px-10 h-14 rounded-lg shadow-lg shadow-sky-900/10 transition-all hover:-translate-y-0.5"
                        >
                            Login to Secure Portal <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </Reveal>
            </section>

            {/* ───── FOOTER ───────────────────────────────────────── */}
            <footer className="bg-slate-900 text-slate-400 py-12 px-6">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center border-b border-slate-800 pb-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Droplets className="h-6 w-6 text-sky-400" />
                            <span className="text-lg font-bold text-white tracking-tight">Hydro<span className="text-sky-400">Sentry</span></span>
                        </div>
                        <p className="text-sm max-w-sm leading-relaxed">
                            Decentralized early warning and crisis management system for the Lake Chad Basin.
                        </p>
                    </div>
                    <div className="md:text-right text-sm space-y-2">
                        <p>Initiative by <strong className="text-white">Orivon Edge</strong></p>
                        <p className="text-slate-500">Supported by <strong className="text-slate-300">UNDP Youth4Climate</strong></p>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} Orivon Edge. All rights reserved.</p>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <span>Borno State, Nigeria</span>
                        <span>•</span>
                        <span>v1.0.0-MVP</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
