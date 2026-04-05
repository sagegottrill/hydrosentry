import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import {
    ArrowRight,
    ArrowUpRight,
    Shield,
    Cpu,
    Radio,
    Droplets,
    Zap,
    MapPin,
    Github,
    LayoutDashboard,
    Smartphone,
} from 'lucide-react';

/** Set `VITE_GITHUB_REPO_URL` in `.env` to override the public repository URL. */
const GITHUB_REPO_URL =
    import.meta.env.VITE_GITHUB_REPO_URL ?? 'https://github.com/sagegottrill/hydrosentry';

import { Button } from '@/components/ui/button';
import { HydroSentryLogo } from '@/components/HydroSentryLogo';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactLenis } from '@studio-freight/react-lenis';

function TopBarClock() {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const iv = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(iv);
    }, []);
    return (
        <div className="hidden text-[11px] font-medium text-slate-500 sm:flex sm:items-center sm:gap-3">
            <span className="flex items-center gap-1.5 text-emerald-700">
                <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </span>
                Pilot program
            </span>
            <span className="text-slate-300">·</span>
            <span>{time.toLocaleTimeString('en-US', { hour12: false })} WAT</span>
            <span className="text-slate-300">·</span>
            <span>Borno State</span>
        </div>
    );
}

const MARQUEE_ITEMS = [
    'Open hardware',
    'LoRaWAN mesh',
    'Lake Chad Basin',
    'Offline-first',
    'TinyML at the edge',
    'Data sovereignty',
    'Youth-maintained',
    'BOSEPA coordination',
];

function MarqueeStrip() {
    const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
    return (
        <div className="border-y border-primary/20 bg-primary py-3 text-primary-foreground">
            <div className="relative overflow-hidden">
                <div className="landing-marquee-track flex w-max gap-10 px-4 text-xs font-semibold uppercase tracking-[0.2em]">
                    {doubled.map((label, i) => (
                        <span key={`${label}-${i}`} className="flex shrink-0 items-center gap-10">
                            <span>{label}</span>
                            <span className="text-primary-foreground/40">◆</span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

function HeroVisual() {
    return (
        <div className="relative mx-auto aspect-square w-full max-w-md lg:max-w-none lg:mx-0">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-slate-100 via-white to-sky-50/90 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/80" />
            <div className="absolute inset-[8%] rounded-[1.5rem] border border-slate-200/60 bg-white/80 backdrop-blur-sm">
                <div className="absolute inset-0 opacity-[0.35] bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:1.5rem_1.5rem]" />
                <div className="absolute left-[18%] top-[22%] h-3 w-3 rounded-full bg-primary shadow-[0_0_0_4px_rgba(2,132,199,0.15)]" />
                <div className="absolute left-[52%] top-[38%] h-3 w-3 rounded-full bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.2)]" />
                <div className="absolute left-[68%] top-[58%] h-3 w-3 rounded-full bg-primary shadow-[0_0_0_4px_rgba(2,132,199,0.15)]" />
                <div className="absolute left-[32%] top-[62%] h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.2)]" />
                <div className="absolute left-[12%] top-[48%] right-[20%] h-px rotate-[18deg] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <div className="absolute bottom-[20%] left-[24%] right-[28%] h-px -rotate-[12deg] bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                        <MapPin className="h-4 w-4 text-primary" strokeWidth={1.75} />
                        Situational overview
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        Demo
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function Landing() {
    const navigate = useNavigate();
    const [scrollProgress, setScrollProgress] = useState(0);

    const heroRef = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);

    useEffect(() => {
        const handleScroll = () => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            setScrollProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    return (
        <ReactLenis root>
            <div className="min-h-screen overflow-x-clip bg-[#f8fafc] font-sans text-slate-900 antialiased selection:bg-sky-100">
                <div
                    className="fixed left-0 top-0 z-[60] h-0.5 bg-primary transition-[width] duration-150 ease-out"
                    style={{ width: `${scrollProgress}%` }}
                />

                <div className="border-b border-slate-200/80 bg-white">
                    <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-6">
                        <p className="text-[11px] font-medium tracking-wide text-slate-500">
                            Open-source edge infrastructure · Lake Chad Basin
                        </p>
                        <TopBarClock />
                    </div>
                </div>

                <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                        <HydroSentryLogo size="small" />
                        <div className="hidden items-center gap-8 md:flex">
                            {[
                                ['Challenge', 'crisis'],
                                ['Architecture', 'architecture'],
                                ['Capabilities', 'capabilities'],
                                ['Get started', 'cta-footer'],
                            ].map(([label, id]) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => scrollTo(id)}
                                    className="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 border-slate-200 px-2.5 text-slate-700 sm:px-4"
                                onClick={() => navigate('/field-report')}
                            >
                                <Smartphone className="mr-1.5 h-4 w-4 shrink-0 sm:mr-2" strokeWidth={1.75} />
                                <span className="max-w-[5.5rem] truncate text-xs font-semibold sm:max-w-none sm:text-sm">
                                    Warden mode
                                </span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="hidden h-9 border-slate-200 text-slate-700 sm:inline-flex"
                                onClick={() => navigate('/dashboard')}
                            >
                                Live demo
                            </Button>
                            <Button size="sm" className="h-9 bg-primary px-4 font-semibold hover:bg-primary/90" onClick={() => navigate('/login')}>
                                Operator login
                            </Button>
                        </div>
                    </div>
                </nav>

                <section
                    ref={heroRef}
                    className="relative overflow-hidden border-b border-slate-200/80 bg-white"
                >
                    <motion.div
                        style={{ y: bgY }}
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(14,165,233,0.12),transparent)]"
                    />
                    <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:pb-24 lg:pt-12">
                        <div>
                            <ScrollReveal animation="blur-in">
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-sky-50/90 px-3.5 py-1.5 text-sky-900 shadow-sm">
                                    <Shield className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
                                        Open infrastructure · Climate, peace & security
                                    </span>
                                </div>
                            </ScrollReveal>

                            <ScrollReveal animation="fade-up" delay={0.08}>
                                <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.06]">
                                    Open-Source Edge Infrastructure for{' '}
                                    <span className="text-primary">Climate Resilience</span>
                                </h1>
                            </ScrollReveal>

                            <ScrollReveal animation="fade-up" delay={0.15}>
                                <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                                    HydroSentry is a localized, offline-first early warning blueprint protecting the Lake Chad Basin.
                                    Built entirely on open hardware and open data, maintained by local youth.
                                </p>
                            </ScrollReveal>

                            <ScrollReveal animation="fade-up" delay={0.22}>
                                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                                    <Button
                                        size="lg"
                                        className="h-12 rounded-xl bg-primary px-7 text-base font-semibold shadow-lg shadow-primary/15 hover:bg-primary/90"
                                        onClick={() => navigate('/dashboard')}
                                    >
                                        Access live demo
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                    <Button size="lg" variant="outline" asChild className="h-12 rounded-xl border-2 border-slate-200 px-7 text-base font-semibold">
                                        <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
                                            <Github className="mr-2 h-5 w-5" />
                                            View GitHub
                                        </a>
                                    </Button>
                                </div>
                            </ScrollReveal>
                        </div>

                        <ScrollReveal animation="fade-up" delay={0.18}>
                            <HeroVisual />
                        </ScrollReveal>
                    </div>
                </section>

                <div className="relative z-10 -mt-6 px-4 sm:px-6">
                    <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="group flex flex-col rounded-2xl bg-primary p-6 text-left text-primary-foreground shadow-xl shadow-primary/20 transition hover:bg-primary/95"
                        >
                            <LayoutDashboard className="mb-4 h-8 w-8 opacity-90" strokeWidth={1.5} />
                            <p className="text-lg font-semibold">Live demo</p>
                            <p className="mt-1 text-sm text-primary-foreground/85">Map, telemetry UI, pilot simulation</p>
                            <span className="mt-4 inline-flex items-center text-sm font-semibold">
                                Open console
                                <ArrowUpRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </span>
                        </button>
                        <a
                            href={GITHUB_REPO_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                        >
                            <Github className="mb-4 h-8 w-8 text-slate-800" strokeWidth={1.5} />
                            <p className="text-lg font-semibold text-slate-900">Repository</p>
                            <p className="mt-1 text-sm text-slate-600">Firmware, schema, and app source</p>
                            <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                                GitHub
                                <ArrowUpRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </span>
                        </a>
                        <button
                            type="button"
                            onClick={() => scrollTo('architecture')}
                            className="group flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
                        >
                            <Cpu className="mb-4 h-8 w-8 text-slate-800" strokeWidth={1.5} />
                            <p className="text-lg font-semibold text-slate-900">Architecture</p>
                            <p className="mt-1 text-sm text-slate-600">Sense, process, alert — offline-first</p>
                            <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                                How it works
                                <ArrowUpRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="group flex flex-col rounded-2xl border border-slate-200/90 bg-white p-6 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
                        >
                            <Shield className="mb-4 h-8 w-8 text-slate-800" strokeWidth={1.5} />
                            <p className="text-lg font-semibold text-slate-900">Operator access</p>
                            <p className="mt-1 text-sm text-slate-600">Secure login for field coordination</p>
                            <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                                Sign in
                                <ArrowUpRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </span>
                        </button>
                    </div>
                </div>

                <div className="mt-14">
                    <MarqueeStrip />
                </div>

                <ScrollReveal>
                    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
                        <div className="grid gap-4 sm:grid-cols-3">
                            {[
                                {
                                    value: '10',
                                    label: 'Active pilot nodes',
                                    sub: 'Current deployment scale (pilot)',
                                    icon: Radio,
                                },
                                {
                                    value: 'Demo',
                                    label: 'Simulated telemetry health',
                                    sub: 'Prototype UI; seed data — not live production traffic',
                                    icon: Cpu,
                                },
                                {
                                    value: '< 1s',
                                    label: 'Target inference',
                                    sub: 'Design goal for on-device edge processing',
                                    icon: Zap,
                                },
                            ].map((s, i) => (
                                <div
                                    key={i}
                                    className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                                >
                                    <s.icon className="mb-4 h-7 w-7 text-primary" strokeWidth={1.5} />
                                    <p className="text-3xl font-semibold tabular-nums tracking-tight text-slate-900">{s.value}</p>
                                    <p className="mt-2 text-sm font-semibold text-slate-800">{s.label}</p>
                                    <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{s.sub}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </ScrollReveal>

                <section id="crisis" className="scroll-mt-20 border-t border-slate-200/80 bg-slate-50/80 py-20 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <ScrollReveal>
                            <div className="mb-12 max-w-3xl">
                                <span className="inline-block rounded-md bg-rose-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-rose-800">
                                    Context & challenge
                                </span>
                                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                                    Climate shocks are multiplying conflict in Northeast Nigeria.
                                </h2>
                                <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
                                    The September 2024 Alau Dam collapse displaced 400,000 people in Maiduguri with zero effective
                                    last-mile warning. Existing systems rely heavily on cloud infrastructure that fails exactly when communities
                                    need it most—during telecom blackouts caused by severe weather.
                                </p>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal className="stagger-children">
                            <div className="grid gap-5 md:grid-cols-3">
                                {[
                                    {
                                        stat: '400K+',
                                        label: 'People Displaced',
                                        desc: 'From recent severe flooding events lacking last-mile community alerts.',
                                        accent: 'border-t-rose-500 bg-white',
                                    },
                                    {
                                        stat: '<1%',
                                        label: 'Youth Climate Funding',
                                        desc: 'Despite youth constituting nearly half the affected population.',
                                        accent: 'border-t-amber-500 bg-white',
                                    },
                                    {
                                        stat: 'Zero',
                                        label: 'Offline Resilience',
                                        desc: 'Current early warning systems fail when internet connectivity drops.',
                                        accent: 'border-t-slate-400 bg-white',
                                    },
                                ].map((c, i) => (
                                    <div
                                        key={i}
                                        className={`rounded-2xl border border-slate-200/90 border-t-4 p-8 shadow-sm ${c.accent} transition hover:shadow-md`}
                                    >
                                        <p className="text-3xl font-semibold tabular-nums tracking-tight text-slate-900">{c.stat}</p>
                                        <p className="mt-3 text-base font-semibold text-slate-900">{c.label}</p>
                                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                <section id="architecture" className="scroll-mt-20 border-t border-slate-200/80 bg-white py-20 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <ScrollReveal>
                            <div className="mx-auto mb-14 max-w-3xl text-center">
                                <span className="inline-block rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                                    Technical architecture
                                </span>
                                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.5rem]">
                                    Sense, process, alert. Offline-first by design.
                                </h2>
                                <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
                                    HydroSentry&apos;s early warning pipeline is engineered to run when the cloud cannot — maximum resilience in
                                    austere environments, with{' '}
                                    <strong className="font-semibold text-slate-800">data sovereignty</strong> for the communities it serves.
                                </p>
                                <div className="mt-8 rounded-2xl border border-slate-200/90 bg-slate-50/90 p-6 text-left text-sm leading-relaxed text-slate-600 sm:p-8 sm:text-base">
                                    <p>
                                        <strong className="font-semibold text-slate-800">Right to repair.</strong> Hardware is built from easily
                                        sourced, non-proprietary parts — ESP32-class MCUs, standard LiFePO₄ cells, and commodity sensors — so nodes
                                        can be maintained locally without vendor lock-in.
                                    </p>
                                    <p className="mt-4">
                                        <strong className="font-semibold text-slate-800">Community-owned data.</strong> Telemetry and alert logic are
                                        designed to stay with the Lake Chad Basin operator and communities — not siloed on a hyperscaler in Virginia.
                                        Open data practices keep stewardship transparent and auditable.
                                    </p>
                                </div>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal className="stagger-children">
                            <div className="grid gap-6 md:grid-cols-3">
                                {[
                                    {
                                        step: '01',
                                        icon: Droplets,
                                        title: 'Sense & collect',
                                        desc: 'Rugged ultrasonic sensors measure water levels every 30 seconds. Solar-powered units ensure 5-10 years of continuous operation.',
                                    },
                                    {
                                        step: '02',
                                        icon: Cpu,
                                        title: 'Edge processing',
                                        desc: 'Embedded TinyML models continuously analyze flow patterns on the node, detecting dangerous anomalies locally in milliseconds.',
                                    },
                                    {
                                        step: '03',
                                        icon: Zap,
                                        title: 'Autonomous dispatch',
                                        desc: 'Upon threat detection, nodes autonomously trigger local sirens and utilize LoRaWAN gateways to dispatch SMS alerts bypassing internet outages.',
                                    },
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-50/50 p-8 transition hover:border-primary/25 hover:bg-white hover:shadow-lg"
                                    >
                                        <span className="absolute right-6 top-6 text-5xl font-semibold text-slate-200 transition group-hover:text-primary/15">
                                            {item.step}
                                        </span>
                                        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition group-hover:border-primary/30 group-hover:text-primary">
                                            <item.icon className="h-6 w-6 text-slate-700 transition group-hover:text-primary" strokeWidth={1.5} />
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                                        <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                <section id="capabilities" className="scroll-mt-20 border-t border-slate-200/80 bg-slate-50/80 py-20 sm:py-24">
                    <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20">
                        <ScrollReveal>
                            <span className="inline-block rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-primary">
                                Core capabilities
                            </span>
                            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                                The Warden Guild: data sovereignty stewards on the ground.
                            </h2>
                            <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
                                The stack is open; the <strong className="font-semibold text-slate-800">system</strong> is people. HydroSentry
                                recruits, trains, and pays local youth as Sensor Wardens — a{' '}
                                <strong className="font-semibold text-slate-800">local gig economy for climate resilience</strong> that maintains
                                hardware, validates field reality, and keeps alert pathways accountable to communities — not distant platforms.
                            </p>
                            <ul className="mt-10 space-y-8">
                                {[
                                    {
                                        title: 'Data sovereignty stewards',
                                        desc: 'Wardens are not “just” maintenance crews — they anchor data integrity, physical security, and community trust around each node.',
                                    },
                                    {
                                        title: 'Dual-crisis monitoring',
                                        desc: 'One operational rhythm across wet-season flood risk and dry-season resource stress — so the same local network adapts to the hazard in season.',
                                    },
                                    {
                                        title: 'Incident dispatcher',
                                        desc: 'Transparent workflows for maintenance, alerts, and field reports — built for coordination with BOSEPA and ward focal points.',
                                    },
                                ].map((f, i) => (
                                    <li key={i} className="flex gap-4 border-b border-slate-200/80 pb-8 last:border-0 last:pb-0">
                                        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-base font-semibold text-slate-900">{f.title}</h4>
                                            <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </ScrollReveal>

                        <ScrollReveal>
                            <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.2)]">
                                <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Demo console</p>
                                    <p className="mt-1 text-sm font-medium text-slate-800">Situational map & dispatch</p>
                                </div>
                                <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-sky-50/40 p-6">
                                    <div className="absolute inset-4 rounded-xl border border-slate-200/80 bg-white/90 shadow-inner">
                                        <div className="absolute inset-2 rounded-lg bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:12px_12px] opacity-60" />
                                        <div className="absolute left-[20%] top-[30%] h-2 w-2 rounded-full bg-primary ring-4 ring-primary/20" />
                                        <div className="absolute left-[55%] top-[45%] h-2 w-2 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
                                        <div className="absolute left-[70%] top-[65%] h-2 w-2 rounded-full bg-primary ring-4 ring-primary/20" />
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white/95 px-4 py-3 text-xs shadow-sm backdrop-blur-sm">
                                        <span className="font-medium text-slate-600">Pilot telemetry · simulated</span>
                                        <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-800">Live demo</span>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                <section id="cta-footer" className="scroll-mt-20 border-t border-slate-200/80 bg-white py-20 sm:py-24">
                    <ScrollReveal>
                        <div className="mx-auto max-w-5xl rounded-[2rem] border border-slate-200/90 bg-slate-50/90 px-6 py-14 text-center shadow-sm sm:px-10 sm:py-16">
                            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <Shield className="h-7 w-7" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                                Explore the stack — demo, code, or secure access
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                                The live demo uses simulated pilot telemetry so reviewers can stress-test the UI honestly. For production
                                deployments, use the secure operator login.
                            </p>
                            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap">
                                <Button
                                    size="lg"
                                    className="h-12 rounded-xl bg-primary px-8 font-semibold"
                                    onClick={() => navigate('/dashboard')}
                                >
                                    Access live demo
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                <Button size="lg" variant="outline" asChild className="h-12 rounded-xl border-2 border-slate-200 px-8 font-semibold">
                                    <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
                                        <Github className="mr-2 h-5 w-5" />
                                        View GitHub repository
                                    </a>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    className="h-12 rounded-xl px-8 font-semibold"
                                    onClick={() => navigate('/login')}
                                >
                                    Operator login
                                </Button>
                            </div>
                        </div>
                    </ScrollReveal>
                </section>

                <footer className="border-t border-slate-200/80 bg-slate-950 text-slate-400">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
                        <div className="flex flex-col gap-10 border-b border-slate-800 pb-10 md:flex-row md:items-start md:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <Droplets className="h-6 w-6 text-sky-400" strokeWidth={1.5} />
                                    <span className="text-lg font-semibold text-white">
                                        Hydro<span className="text-sky-400">Sentry</span>
                                    </span>
                                </div>
                                <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
                                    Open-source edge early warning blueprint for the Lake Chad Basin — open hardware, open data, youth-maintained.
                                </p>
                            </div>
                            <div className="text-sm">
                                <p className="font-medium text-slate-300">Initiative</p>
                                <p className="mt-2">
                                    <strong className="text-white">Orivon Edge</strong>
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-slate-500 sm:flex-row">
                            <p>© {new Date().getFullYear()} Orivon Edge. All rights reserved.</p>
                            <p>
                                Borno State, Nigeria · v1.0.0-MVP
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </ReactLenis>
    );
}
