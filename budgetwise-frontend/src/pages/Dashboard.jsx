import React, { useEffect, useState } from 'react';
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, BarChart, Bar as ReBar } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, IndianRupee, Loader2, Lightbulb, PiggyBank, ArrowRight, Briefcase, Gift, MoreHorizontal, PieChart, Download, Utensils, Car, ShoppingBag, Ticket, GraduationCap, HeartPulse, Receipt, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';

const EXPENSE_CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Education", "Health", "Bills", "Other"];

const CATEGORY_COLORS = {
    'Food': '#10b981',      // Emerald-500
    'Transport': '#3b82f6', // Blue-500
    'Bills': '#eab308',     // Yellow-500
    'Entertainment': '#f97316',// Orange-500
    'Shopping': '#a855f7',  // Purple-500
    'Education': '#ec4899', // Pink-500
    'Health': '#ef4444',    // Red-500
    'Other': '#71717a',      // Zinc-500
    'Salary': '#10b981',    // Emerald-500
    'Investment': '#3b82f6',
    'Bonus': '#eab308'
};

const CATEGORY_ICONS = {
    'Food': Utensils,
    'Transport': Car,
    'Shopping': ShoppingBag,
    'Entertainment': Ticket,
    'Education': GraduationCap,
    'Health': HeartPulse,
    'Bills': Receipt,
    'Other': Layers,
    'Salary': Briefcase,
    'Investment': TrendingUp,
    'Bonus': Gift
};

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#eab308', '#f97316', '#a855f7', '#ec4899', '#ef4444'];

const StatCard = ({ title, value, icon: Icon, trend, className, variant = 'indigo', trendIcon: TrendIconOverride }) => {
    const variants = {
        indigo: 'bg-indigo-600/10 text-indigo-600 border-l-indigo-600',
        blue: 'bg-blue-600/10 text-blue-600 border-l-blue-600',
        green: 'bg-green-600/10 text-green-600 border-l-green-500',
        red: 'bg-red-600/10 text-red-600 border-l-red-500'
    };

    const trendColors = {
        indigo: 'text-indigo-600',
        blue: 'text-blue-600',
        green: 'text-green-600',
        red: 'text-red-500'
    };

    const currentVariant = variants[variant] || variants.indigo;
    const currentTrendColor = trendColors[variant] || trendColors.indigo;
    const TrendIcon = TrendIconOverride || (variant === 'red' ? TrendingDown : TrendingUp);

    return (
        <div className={cn(
            "bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all border-l-4",
            currentVariant.split(' ')[2],
            className
        )}>
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className={cn(
                        "font-extrabold mt-2 tabular-nums leading-tight break-all",
                        value.length > 20 ? "text-base" : value.length > 15 ? "text-lg" : "text-2xl"
                    )}>
                        {value}
                    </h3>
                </div>
                <div className={cn("p-3 rounded-full shrink-0", currentVariant.split(' ').slice(0, 2).join(' '))}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            {trend && (
                <div className={cn("flex items-center mt-4 text-xs font-medium", currentTrendColor)}>
                    <TrendIcon className="w-3 h-3 mr-1" />
                    <span>{trend}</span>
                </div>
            )}
        </div>
    );
};

const Dashboard = () => {
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]); // Keep state name for less refactoring, but store all
    const [advice, setAdvice] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadingAdvice, setLoadingAdvice] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
        const fetchData = async () => {
            try {
                const token = await getToken();
                if (!token) return;

                const headers = { Authorization: `Bearer ${token}` };

                // Fetch dashboard data
                const res = await api.get('/dashboard', { headers });
                setData(res.data);

                // Fetch all transactions for calculations
                const transRes = await api.get('/transactions', { headers });
                setRecentTransactions(transRes.data);
            } catch (err) {
                console.error("Error loading dashboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [getToken]);

    const generateAdvice = async () => {
        setLoadingAdvice(true);
        try {
            const token = await getToken();
            const res = await api.post('/ai/advice', {}, { headers: { Authorization: `Bearer ${token}` } });
            setAdvice(res.data.advice);
        } catch (err) {
            console.error("Error getting advice", err);
        } finally {
            setLoadingAdvice(false);
        }
    };

    const handleDownloadReport = async () => {
        try {
            const token = await getToken();
            const response = await api.get('/export/csv', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `budgetwise_report.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Report downloaded successfully.");
        } catch (err) {
            console.error("Error downloading report", err);
            toast.error("Something went wrong. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Format currency
    const fmt = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
    const compactFmt = (val) => new Intl.NumberFormat('en-IN', { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 1, style: 'currency', currency: 'INR' }).format(val || 0);

    // Calculate Monthly Insights locally for cross-page consistency
    const now = new Date();
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();

    const [monthlyStats, allTimeStats] = recentTransactions.reduce((accs, t) => {
        const [mAcc, aAcc] = accs;
        const tDate = new Date(t.date);
        const amount = t.amount || 0;

        // All-Time logic
        if (t.type === 'INCOME') {
            aAcc.income += amount;
        } else if (t.type === 'EXPENSE' && EXPENSE_CATEGORIES.includes(t.category)) {
            aAcc.expense += amount;
        }

        // Monthly logic
        if (tDate.getMonth() === curMonth && tDate.getFullYear() === curYear) {
            if (t.type === 'INCOME') {
                mAcc.income += amount;
                mAcc.incomeByCategory[t.category] = (mAcc.incomeByCategory[t.category] || 0) + amount;
            } else if (t.type === 'EXPENSE' && EXPENSE_CATEGORIES.includes(t.category)) {
                mAcc.expense += amount;
                mAcc.expenseByCategory[t.category] = (mAcc.expenseByCategory[t.category] || 0) + amount;
            }
        }
        return accs;
    }, [
        { income: 0, expense: 0, incomeByCategory: {}, expenseByCategory: {} },
        { income: 0, expense: 0 }
    ]);

    const allTimeBalance = allTimeStats.income - allTimeStats.expense;
    const monthlyBalance = monthlyStats.income - monthlyStats.expense;

    // Transform expense map for Pie Chart
    const expenseData = Object.entries(monthlyStats.expenseByCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const totalCalculatedIncome = monthlyStats.income;
    const salPerc = totalCalculatedIncome > 0 ? (monthlyStats.incomeByCategory['Salary'] || 0) / totalCalculatedIncome * 100 : 0;
    const invPerc = totalCalculatedIncome > 0 ? (monthlyStats.incomeByCategory['Investment'] || 0) / totalCalculatedIncome * 100 : 0;
    const bonPerc = totalCalculatedIncome > 0 ? (monthlyStats.incomeByCategory['Bonus'] || 0) / totalCalculatedIncome * 100 : 0;
    const othPerc = totalCalculatedIncome > 0 ? (monthlyStats.incomeByCategory['Other'] || 0) / totalCalculatedIncome * 100 : 0;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Here's your financial overview.</p>
                </div>
                <button
                    onClick={generateAdvice}
                    disabled={loadingAdvice}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50"
                >
                    {loadingAdvice ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lightbulb className="w-4 h-4 mr-2" />}
                    {advice ? 'Refresh Monthly Insights' : 'Get Monthly AI Insight'}
                </button>
            </div>

            {advice && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-900 rounded-xl p-4 md:p-6 animate-in slide-in-from-top-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg h-fit text-indigo-600 dark:text-indigo-400 w-fit">
                            <Lightbulb className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                                <h3 className="text-base md:text-lg font-bold text-indigo-900 dark:text-indigo-100 uppercase tracking-tight">AI Insights — Based on This Month</h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/10 text-indigo-600 uppercase tracking-widest border border-indigo-500/10 w-fit">Current Month</span>
                            </div>
                            <div className="text-indigo-800 dark:text-indigo-200 leading-relaxed text-sm md:text-base prose prose-indigo dark:prose-invert max-w-none prose-p:mb-3 prose-ul:mb-3 prose-li:mb-1 text-justify">
                                <ReactMarkdown
                                    components={{
                                        h1: ({ node, ...props }) => <h1 className="text-lg md:text-xl font-bold mb-2" {...props} />,
                                        h2: ({ node, ...props }) => <h2 className="text-base md:text-lg font-bold mb-2" {...props} />,
                                        h3: ({ node, ...props }) => <h3 className="text-sm md:text-md font-bold mb-1" {...props} />,
                                        p: ({ node, ...props }) => <p className="mb-3" {...props} />,
                                        ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                                        li: ({ node, ...props }) => <li className="marker:text-indigo-400" {...props} />,
                                        strong: ({ node, ...props }) => <strong className="font-bold text-indigo-950 dark:text-indigo-50" {...props} />,
                                    }}
                                >
                                    {advice}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-muted text-muted-foreground text-[10px] font-bold rounded-full uppercase tracking-wider">Operational View</span>
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Monthly Summary</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
                    <StatCard
                        title="Monthly Balance"
                        value={fmt(monthlyBalance)}
                        trend="Net Savings"
                        icon={Wallet}
                        variant="blue"
                        trendIcon={monthlyBalance >= 0 ? TrendingUp : TrendingDown}
                    />
                    <StatCard
                        title="Monthly Income"
                        value={fmt(monthlyStats.income)}
                        trend="This Month"
                        icon={TrendingUp}
                        variant="green"
                    />
                    <StatCard
                        title="Monthly Expenses"
                        value={fmt(monthlyStats.expense)}
                        trend="This Month"
                        icon={TrendingDown}
                        variant="red"
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50 bg-muted/30 dark:bg-muted/5 p-6 rounded-2xl border-2 border-dashed border-border/50">
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-muted-foreground/10 text-muted-foreground text-[10px] font-bold rounded-full uppercase tracking-wider">Historical Health</span>
                    <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">All-Time Summary</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
                    <StatCard
                        title="Total Balance (All Time)"
                        value={fmt(allTimeBalance)}
                        icon={IndianRupee}
                        variant="blue"
                        className="bg-background/50"
                        trendIcon={allTimeBalance >= 0 ? TrendingUp : TrendingDown}
                    />
                    <StatCard
                        title="Total Income (All Time)"
                        value={fmt(allTimeStats.income)}
                        icon={TrendingUp}
                        variant="green"
                        className="bg-background/50"
                    />
                    <StatCard
                        title="Total Expenses (All Time)"
                        value={fmt(allTimeStats.expense)}
                        icon={TrendingDown}
                        variant="red"
                        className="bg-background/50"
                    />
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-12">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-4">
                    {/* Top Row: Summaries */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Spending Breakdown */}
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col min-w-0">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-semibold text-lg">Spending Breakdown</h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground uppercase tracking-wider">Monthly</span>
                            </div>
                            {hasMounted && expenseData.length > 0 ? (
                                <div className="flex flex-col h-full">
                                    <div className="h-[240px] w-full relative mb-6">
                                        <ResponsiveContainer width="99%" height="100%">
                                            <RePieChart>
                                                <Pie
                                                    data={expenseData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={65}
                                                    outerRadius={85}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    animationDuration={1000}
                                                >
                                                    {expenseData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={CATEGORY_COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value) => fmt(value)}
                                                    contentStyle={{
                                                        borderRadius: '12px',
                                                        border: '1px solid hsl(var(--border))',
                                                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                                                        background: 'hsl(var(--card))',
                                                    }}
                                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                                                />
                                            </RePieChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider leading-tight mb-1">Total<br />(This Month)</span>
                                            <span className={cn(
                                                "font-black tabular-nums break-words",
                                                (monthlyStats.expense >= 10000000 ? compactFmt(monthlyStats.expense) : fmt(monthlyStats.expense)).length > 12 ? "text-[10px]" : (monthlyStats.expense >= 10000000 ? compactFmt(monthlyStats.expense) : fmt(monthlyStats.expense)).length > 8 ? "text-sm" : "text-lg"
                                            )}>
                                                {monthlyStats.expense >= 10000000 ? compactFmt(monthlyStats.expense) : fmt(monthlyStats.expense)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mt-auto">
                                        {expenseData.slice(0, 4).map((entry, index) => (
                                            <div key={entry.name} className="flex items-center justify-between group cursor-default">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: CATEGORY_COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length] }}
                                                    />
                                                    <span className="text-xs font-semibold text-foreground/80">{entry.name}</span>
                                                </div>
                                                <span className="text-xs font-bold text-muted-foreground tabular-nums truncate max-w-[120px]" title={fmt(entry.value)}>{fmt(entry.value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                                    <PieChart className="w-12 h-12 mb-2 opacity-20" />
                                    <p>No expense data yet</p>
                                </div>
                            )}
                        </div>

                        {/* Income Summary */}
                        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-semibold text-lg">Income Overview</h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-muted text-muted-foreground uppercase tracking-wider">Monthly</span>
                            </div>
                            {hasMounted ? (
                                <div className="space-y-8 h-full flex flex-col justify-center">
                                    <div>
                                        <div className="flex items-center justify-between mb-3 gap-4">
                                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest shrink-0">Monthly Income Mix</span>
                                            <span className={cn(
                                                "font-bold text-foreground bg-muted px-2 py-0.5 rounded-full tabular-nums ml-auto truncate",
                                                fmt(totalCalculatedIncome).length > 20 ? "text-[10px]" : "text-xs"
                                            )}>
                                                {fmt(totalCalculatedIncome)}
                                            </span>
                                        </div>
                                        <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex shadow-inner">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-1000 ease-out"
                                                style={{ width: `${salPerc}%` }}
                                            />
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 transition-all duration-1000 ease-out border-l border-white/10"
                                                style={{ width: `${invPerc}%` }}
                                            />
                                            <div
                                                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-1000 ease-out border-l border-white/10"
                                                style={{ width: `${bonPerc}%` }}
                                            />
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out border-l border-white/10"
                                                style={{ width: `${othPerc}%` }}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-y-2 mt-3 text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                                            <div className="flex items-center gap-1.5 focus-within:z-10">
                                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                                <span className="truncate" title={`Salary: ${salPerc.toFixed(2)}%`}>Salary {salPerc > 0 && salPerc < 1 ? "<1" : salPerc.toFixed(0)}%</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <span className="truncate" title={`Investment: ${invPerc.toFixed(2)}%`}>{invPerc > 0 && invPerc < 1 ? "<1" : invPerc.toFixed(0)}% Invest</span>
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-amber-400" />
                                                <span className="truncate" title={`Bonus: ${bonPerc.toFixed(2)}%`}>Bonus {bonPerc > 0 && bonPerc < 1 ? "<1" : bonPerc.toFixed(0)}%</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 justify-end">
                                                <span className="truncate" title={`Other: ${othPerc.toFixed(2)}%`}>{othPerc > 0 && othPerc < 1 ? "<1" : othPerc.toFixed(0)}% Other</span>
                                                <div className="w-2 h-2 rounded-full bg-purple-500" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div
                                            className="p-4 rounded-xl transition-all group border border-transparent hover:border-border/50"
                                            style={{ backgroundColor: `${CATEGORY_COLORS['Salary'] || '#10b981'}08` }}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div
                                                    className="p-2 rounded-lg group-hover:scale-110 transition-transform shadow-sm"
                                                    style={{
                                                        backgroundColor: `${CATEGORY_COLORS['Salary'] || '#10b981'}15`,
                                                        color: CATEGORY_COLORS['Salary'] || '#10b981'
                                                    }}
                                                >
                                                    <Briefcase className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Salary</span>
                                            </div>
                                            <p className={cn(
                                                "font-black text-foreground tabular-nums break-words",
                                                fmt(monthlyStats.incomeByCategory?.['Salary'] || 0).length > 15 ? "text-sm" : "text-lg"
                                            )}>{fmt(monthlyStats.incomeByCategory?.['Salary'] || 0)}</p>
                                        </div>
                                        <div
                                            className="p-4 rounded-xl transition-all group border border-transparent hover:border-border/50"
                                            style={{ backgroundColor: `${CATEGORY_COLORS['Investment'] || '#3b82f6'}08` }}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div
                                                    className="p-2 rounded-lg group-hover:scale-110 transition-transform shadow-sm"
                                                    style={{
                                                        backgroundColor: `${CATEGORY_COLORS['Investment'] || '#3b82f6'}15`,
                                                        color: CATEGORY_COLORS['Investment'] || '#3b82f6'
                                                    }}
                                                >
                                                    <TrendingUp className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Investment</span>
                                            </div>
                                            <p className={cn(
                                                "font-black text-foreground tabular-nums break-words",
                                                fmt(monthlyStats.incomeByCategory?.['Investment'] || 0).length > 15 ? "text-sm" : "text-lg"
                                            )}>{fmt(monthlyStats.incomeByCategory?.['Investment'] || 0)}</p>
                                        </div>
                                        <div
                                            className="p-4 rounded-xl transition-all group border border-transparent hover:border-border/50"
                                            style={{ backgroundColor: `${CATEGORY_COLORS['Bonus'] || '#eab308'}08` }}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div
                                                    className="p-2 rounded-lg group-hover:scale-110 transition-transform shadow-sm"
                                                    style={{
                                                        backgroundColor: `${CATEGORY_COLORS['Bonus'] || '#eab308'}15`,
                                                        color: CATEGORY_COLORS['Bonus'] || '#eab308'
                                                    }}
                                                >
                                                    <Gift className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Bonus</span>
                                            </div>
                                            <p className={cn(
                                                "font-black text-foreground tabular-nums break-words",
                                                fmt(monthlyStats.incomeByCategory?.['Bonus'] || 0).length > 15 ? "text-sm" : "text-lg"
                                            )}>{fmt(monthlyStats.incomeByCategory?.['Bonus'] || 0)}</p>
                                        </div>
                                        <div
                                            className="p-4 rounded-xl transition-all group border border-transparent hover:border-border/50"
                                            style={{ backgroundColor: '#a855f708' }}
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div
                                                    className="p-2 rounded-lg group-hover:scale-110 transition-transform shadow-sm"
                                                    style={{
                                                        backgroundColor: '#a855f715',
                                                        color: '#a855f7'
                                                    }}
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </div>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Other</span>
                                            </div>
                                            <p className={cn(
                                                "font-black text-foreground tabular-nums break-words",
                                                fmt(monthlyStats.incomeByCategory?.['Other'] || 0).length > 15 ? "text-sm" : "text-lg"
                                            )}>
                                                {fmt(monthlyStats.incomeByCategory?.['Other'] || 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-[280px] flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Row: Expense Comparison */}
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm min-w-0">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">Detailed Analytics</h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase tracking-wider">Monthly</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground px-2 py-1 bg-muted rounded-md tracking-widest uppercase">Expenses per Category</span>
                            </div>
                        </div>
                        {hasMounted && expenseData.length > 0 ? (
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="99%" height="100%">
                                    <BarChart data={expenseData.slice(0, 10)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: 600 }}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            cursor={{ fill: 'hsl(var(--primary)/0.03)' }}
                                            formatter={(value) => fmt(value)}
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: '1px solid hsl(var(--border))',
                                                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                                                background: 'hsl(var(--card))',
                                            }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                                        />
                                        <ReBar
                                            dataKey="value"
                                            radius={[8, 8, 0, 0]}
                                            barSize={40}
                                        >
                                            {expenseData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={CATEGORY_COLORS[entry.name] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                                                    fillOpacity={0.9}
                                                />
                                            ))}
                                        </ReBar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20 italic text-sm">
                                No data for detailed comparison
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar area */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Quick Actions */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-fit">
                        <h3 className="font-bold mb-6 text-lg text-foreground/90">Quick Actions</h3>
                        <div className="space-y-4">
                            <button
                                onClick={() => navigate('/transactions')}
                                className="w-full flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-muted/30 hover:bg-primary/5 hover:border-primary/40 hover:shadow-md transition-all group text-left active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-500/10 text-green-600 rounded-xl group-hover:bg-green-500/20 transition-colors">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-sm">Add Transaction</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                            </button>
                            <button
                                onClick={() => navigate('/budgets')}
                                className="w-full flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-muted/30 hover:bg-primary/5 hover:border-primary/40 hover:shadow-md transition-all group text-left active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary/20 transition-colors">
                                        <PieChart className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-sm">Set Budget Limit</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                            </button>
                            <button
                                onClick={() => navigate('/savings')}
                                className="w-full flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-muted/30 hover:bg-purple-500/5 hover:border-purple-500/40 hover:shadow-md transition-all group text-left active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                                        <PiggyBank className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-sm">Set Savings Goal</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                            </button>
                            <button
                                onClick={handleDownloadReport}
                                className="w-full flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-muted/30 hover:bg-blue-500/5 hover:border-blue-500/40 hover:shadow-md transition-all group text-left active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 text-blue-600 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                                        <Download className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-sm">Download Report</span>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-all group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>

                    {/* Recent History */}
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-fit">
                        <div className="flex items-center justify-between mb-7">
                            <h3 className="font-bold text-lg text-foreground/90">Transaction History</h3>
                            <button
                                onClick={() => navigate('/transactions')}
                                className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/70 bg-primary/5 px-2 py-1 rounded-md transition-all"
                            >
                                View All
                            </button>
                        </div>
                        <div className="space-y-6">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.slice(0, 6).map((t) => (
                                    <div key={t.id} className="flex items-center justify-between group cursor-default">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className="w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center shadow-sm"
                                                style={{
                                                    backgroundColor: (t.type === 'INCOME' && t.category === 'Other') ? '#a855f715' : `${CATEGORY_COLORS[t.category] || DEFAULT_COLORS[0]}15`,
                                                    color: (t.type === 'INCOME' && t.category === 'Other') ? '#a855f7' : (CATEGORY_COLORS[t.category] || DEFAULT_COLORS[0]),
                                                    border: `1px solid ${(t.type === 'INCOME' && t.category === 'Other') ? '#a855f725' : `${CATEGORY_COLORS[t.category] || DEFAULT_COLORS[0]}25`}`
                                                }}
                                            >
                                                {React.createElement(
                                                    (t.type === 'INCOME' && t.category === 'Other') ? MoreHorizontal : (CATEGORY_ICONS[t.category] || MoreHorizontal),
                                                    { className: "w-5 h-5" }
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-foreground leading-none mb-1.5 truncate uppercase tracking-tight">{t.category}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] text-muted-foreground font-black opacity-60">
                                                        {format(new Date(t.date), 'dd MMM')}
                                                    </p>
                                                    {t.description && t.description !== t.category && (
                                                        <>
                                                            <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                                                            <p className="text-[10px] text-muted-foreground font-medium italic truncate max-w-[90px] opacity-70">
                                                                {t.description}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right ml-2 shrink-0 max-w-[120px]">
                                            <p className={cn(
                                                "text-sm font-black tracking-tight tabular-nums break-words",
                                                t.type === 'INCOME' ? "text-green-600" : "text-foreground"
                                            )}>
                                                {t.type === 'INCOME' ? '+' : '-'}{fmt(t.amount)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center border-2 border-dashed border-border/50 rounded-2xl bg-muted/5">
                                    <p className="text-xs text-muted-foreground italic font-medium">No activity to show</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
