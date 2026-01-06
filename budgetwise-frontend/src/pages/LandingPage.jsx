import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, SignInButton, SignUpButton } from "@clerk/clerk-react";
import {
    Wallet,
    PieChart,
    PiggyBank,
    Lightbulb,
    Globe,
    Repeat,
    ArrowRight,
    ShieldCheck,
    Layers,
    LayoutDashboard,
    Sun,
    Moon,
    Linkedin,
    Github,
    Mail,
    Loader2,
    Menu,
    X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { useTheme } from '../components/ThemeProvider';

const LandingPage = () => {
    const navigate = useNavigate();
    const { isSignedIn, isLoaded } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (isSignedIn) {
            navigate('/dashboard');
        }
    }, [isSignedIn, navigate]);

    const features = [
        {
            icon: Wallet,
            title: "Smart Expense Tracking",
            description: "Log and monitor income and expenses effortlessly.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            icon: PieChart,
            title: "Monthly Budgets",
            description: "Set category-wise limits and stay on track every month.",
            color: "text-zinc-500",
            bg: "bg-zinc-500/10"
        },
        {
            icon: PiggyBank,
            title: "Savings Goals",
            description: "Plan and track your monthly savings targets.",
            color: "text-purple-600",
            bg: "bg-purple-600/10"
        },
        {
            icon: Lightbulb,
            title: "AI Financial Insights",
            description: "Get smart, personalized spending and saving suggestions.",
            color: "text-blue-600",
            bg: "bg-blue-600/10"
        },
        {
            icon: Globe,
            title: "Global Multi-Currency",
            description: "Transact in USD, EUR, or GBP. We auto-convert to INR for seamless tracking.",
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            icon: Repeat,
            title: "Recurring Transactions",
            description: "Automatically track monthly bills, subscriptions, and salary without manual entry.",
            color: "text-rose-500",
            bg: "bg-rose-500/10"
        }
    ];

    const steps = [
        {
            title: "Sign in with Google",
            description: "Secure and instant access using your existing Google account via Clerk."
        },
        {
            title: "Add transactions & goals",
            description: "Easily input your spending, income, and set your financial targets."
        },
        {
            title: "Get AI insights",
            description: "Monitor your dashboard and receive smart advice to optimize your wealth."
        }
    ];

    if (!isLoaded || isSignedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-indigo-600/10">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="w-full px-6 md:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.svg" alt="BudgetWise Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-full" />
                        <span className="font-heading font-black text-xl tracking-tight">BudgetWise</span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        {!isSignedIn && (
                            <div className="flex items-center gap-4">
                                <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                                    <button className="px-4 py-2 rounded-full text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-black dark:hover:text-white transition-all">Log In</button>
                                </SignInButton>
                                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                                    <button className="px-5 py-2 bg-indigo-600 text-white rounded-full font-semibold text-sm hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
                                        Get Started
                                    </button>
                                </SignUpButton>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="flex md:hidden items-center gap-4">
                        <button
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-b border-border bg-background/95 backdrop-blur-xl"
                    >
                        <div className="px-6 py-8 flex flex-col gap-4">
                            {!isSignedIn && (
                                <>
                                    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                                        <button className="w-full py-3 rounded-xl font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-all border border-border/50">Log In</button>
                                    </SignInButton>
                                    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                                        <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-indigo-600/20">
                                            Get Started
                                        </button>
                                    </SignUpButton>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-40 pointer-events-none">
                    <div className="absolute top-0 right-[-10%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-indigo-600/30 rounded-full blur-[80px] md:blur-[120px] animate-pulse" />
                    <div className="absolute top-[20%] left-[-10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-purple-600/20 rounded-full blur-[80px] md:blur-[120px]" />
                    <div className="absolute bottom-0 right-[20%] w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-pink-600/10 rounded-full blur-[80px] md:blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[10%] w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-blue-600/10 rounded-full blur-[80px] md:blur-[120px]" />
                </div>

                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-black leading-[1.15] mb-6 tracking-tight">
                            Take control of your money <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-blue-600 to-foreground/80">with clarity and confidence.</span>
                        </h1>
                        <p className="text-base md:text-xl text-muted-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                            Track expenses, manage monthly budgets, and set savings goals with AI-powered insights — all in one simple, intelligent dashboard.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                                <button className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-base hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group border border-indigo-500/20">
                                    Start Tracking — It's Free
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </SignUpButton>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="py-24 bg-muted/30 relative overflow-hidden">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-600/10 to-blue-600/10 text-emerald-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-emerald-600/20 mb-6 inline-block">
                            Core Platform
                        </span>
                        <h2 className="text-3xl md:text-5xl font-heading font-black mb-4">Powerful features for total control.</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Everything you need to manage your money with precision and ease.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-card border border-border p-8 rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className={cn("w-12 h-12 rounded-2xl mb-6 flex items-center justify-center", feature.bg, feature.color)}>
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-black mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>


            {/* How It Works */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full -z-10 opacity-20 pointer-events-none">
                    <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-600/30 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px]" />
                </div>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="px-4 py-1.5 bg-indigo-600/10 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-600/20 mb-6 inline-block">
                            Step-by-Step
                        </span>
                        <h2 className="text-3xl md:text-5xl font-heading font-black mb-4">Start your journey today.</h2>
                        <p className="text-muted-foreground text-lg">Financial freedom is just 3 simple steps away.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="relative p-8 text-center"
                            >
                                <div className="w-16 h-16 bg-indigo-600/10 text-indigo-600 border border-indigo-600/20 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-6">
                                    0{i + 1}
                                </div>
                                <h4 className="text-xl font-bold mb-3">{step.title}</h4>
                                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                                {i < 2 && (
                                    <div className="hidden lg:block absolute top-[60px] -right-[20%] w-[40%] text-border">
                                        <ArrowRight className="w-full h-8" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Choose BudgetWise */}
            <section className="py-24 bg-muted/30 relative overflow-hidden">
                <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[80px] -z-10" />
                <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px] -z-10" />
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="px-4 py-1.5 bg-gradient-to-r from-purple-600/10 to-blue-600/10 text-purple-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-purple-600/20 mb-6 inline-block">
                            Why Choose Us
                        </span>
                        <h2 className="text-3xl md:text-5xl font-heading font-black mb-4">Built for clarity and growth.</h2>
                        <p className="text-muted-foreground text-lg">We focus on the details so you can focus on your wealth.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { t: "Avoid Overspending", d: "Clear alerts help you stay disciplined without any manual effort.", i: ShieldCheck },
                            { t: "Data Ownership", d: "Your data is yours. Export to CSV anytime for local storage.", i: Layers },
                            { t: "Cross-Platform", d: "Manage your finances from any device with optimized responsive design.", i: LayoutDashboard }
                        ].map((item, i) => (
                            <div key={i} className="space-y-4">
                                <div className="p-3 bg-indigo-600/10 rounded-xl text-indigo-600 w-fit">
                                    <item.i className="w-6 h-6" />
                                </div>
                                <h4 className="text-xl font-bold">{item.t}</h4>
                                <p className="text-muted-foreground leading-relaxed">{item.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Footer */}
            <section className="py-32">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-6xl font-heading font-black leading-tight mb-8">Ready to take control <br />of your money?</h2>
                    <p className="text-xl text-muted-foreground mb-12">Join BudgetWise and simplify your finances.</p>
                    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                        <button className="px-7 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-base hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 mx-auto group border border-indigo-500/20">
                            Get Started for Free
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </SignUpButton>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full bg-white dark:bg-card border-t border-slate-100 dark:border-border py-12">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <div className="flex justify-center gap-6 mb-4">
                        <a
                            href="https://www.linkedin.com/in/adadasaivenkat"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                            aria-label="LinkedIn"
                        >
                            <Linkedin size={20} />
                        </a>
                        <a
                            href="https://github.com/adadasaivenkat"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-black dark:hover:text-white transition-colors"
                            aria-label="GitHub"
                        >
                            <Github size={20} />
                        </a>
                        <a
                            href="mailto:adadasaivenkat0109@gmail.com"
                            className="text-slate-400 hover:text-red-500 transition-colors"
                            aria-label="Gmail"
                        >
                            <Mail size={20} />
                        </a>
                    </div>
                    <div className="text-xs text-slate-400">
                        © {new Date().getFullYear()} BudgetWise. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
