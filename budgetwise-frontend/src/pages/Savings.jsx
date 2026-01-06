import React, { useState, useEffect } from 'react';
import { useAuth } from "@clerk/clerk-react";
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Plus, AlertTriangle, CheckCircle2, Loader2, Trash2, X, Pencil, PiggyBank, TrendingUp, Coins, Banknote, Landmark, Gem, ShieldCheck, Trophy, Sparkles, CircleDollarSign, HandCoins, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';

const SAVINGS_ICONS = [PiggyBank, Coins, TrendingUp, Banknote, Landmark, Gem, ShieldCheck, Trophy, Sparkles, CircleDollarSign, HandCoins, Wallet];

const SAVINGS_COLORS = [
    '#6366f1', // Indigo (Jan)
    '#10b981', // Emerald (Feb)
    '#3b82f6', // Blue (Mar)
    '#f59e0b', // Amber (Apr)
    '#8b5cf6', // Violet (May)
    '#ec4899', // Pink (Jun)
    '#06b6d4', // Cyan (Jul)
    '#f97316', // Orange (Aug)
    '#14b8a6', // Teal (Sep)
    '#d946ef', // Fuchsia (Oct)
    '#ef4444', // Red (Nov)
    '#84cc16'  // Lime (Dec)
];

const Savings = () => {
    const { getToken } = useAuth();
    const [savings, setSavings] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        targetAmount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const [isFormDisabled, setIsFormDisabled] = useState(false);
    const [isEditingActive, setIsEditingActive] = useState(false);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const fetchData = async () => {
        try {
            const token = await getToken();
            const headers = { Authorization: `Bearer ${token}` };

            const [savingsRes, transRes] = await Promise.all([
                api.get('/savings', { headers }),
                api.get('/transactions', { headers })
            ]);

            setSavings(savingsRes.data);
            setTransactions(transRes.data);
        } catch (err) {
            console.error("Error fetching savings data", err);
            // toast.error("Failed to load savings data."); // Suppress on init
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [getToken]);

    // Contextual Check Effect
    useEffect(() => {
        const existingGoal = savings.find(s =>
            s.month === formData.month &&
            s.year === formData.year
        );

        if (existingGoal) {
            // Found existing: Pre-fill, set ID, Disable form (View Mode)
            setEditingId(existingGoal.id);
            setFormData(prev => ({ ...prev, targetAmount: existingGoal.targetAmount }));
            setIsFormDisabled(true);
            setIsEditingActive(false);
        } else {
            // No existing: Clear ID, Clear Amount (avoid clearing if just typing? No, context switch clears), Enable form
            setEditingId(null);
            setFormData(prev => ({ ...prev, targetAmount: '' }));
            setIsFormDisabled(false);
            setIsEditingActive(true); // "Save" mode is active
        }
    }, [formData.month, formData.year, savings]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = await getToken();

            // We rely on editingId set by the Effect to decide PUT vs POST + ID in body
            // But we should double check logic or rely on ID presence
            if (editingId) {
                await api.put('/savings', { ...formData, id: editingId }, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("Savings target updated successfully.");
            } else {
                await api.post('/savings', formData, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("Savings target saved successfully.");
            }
            setIsModalOpen(false);
            fetchData(); // Will trigger effect and re-disable form if found
        } catch (err) {
            console.error("Error saving savings goal", err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (e) => {
        e.preventDefault();
        setIsEditingActive(true);
        setIsFormDisabled(false);
    };

    const handleEdit = (goal) => {
        setEditingId(goal.id);
        setFormData({
            targetAmount: goal.targetAmount,
            month: goal.month,
            year: goal.year
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setIdToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!idToDelete) return;
        try {
            const token = await getToken();
            await api.delete(`/savings/${idToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
            setSavings(prev => prev.filter(s => s.id !== idToDelete));
            toast.success("Savings target deleted successfully.");
        } catch (err) {
            console.error("Error deleting savings goal", err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsDeleteModalOpen(false);
            setIdToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Monthly Savings</h1>
                    <p className="text-muted-foreground">Plan and track your savings goals for each month.</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({
                            targetAmount: '',
                            month: new Date().getMonth() + 1,
                            year: new Date().getFullYear()
                        });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-lg shadow-indigo-600/20"
                >
                    <Plus className="w-4 h-4" />
                    Set Monthly Goal
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <p className="text-muted-foreground col-span-full text-center py-10">Loading savings goals...</p>
                ) : savings.length === 0 ? (
                    <div className="col-span-full text-center py-10 border-2 border-dashed border-border rounded-xl">
                        <PiggyBank className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                        <h3 className="font-medium text-lg">No savings goals yet</h3>
                        <p className="text-muted-foreground">Set a monthly savings goal to start building your savings.</p>
                    </div>
                ) : (
                    savings.map(goal => {
                        const gMonth = goal.month || (new Date().getMonth() + 1);
                        const gYear = goal.year || new Date().getFullYear();

                        // Calculate Income and Expenses for this Goal's Month/Year
                        let monthlyIncome = 0;
                        let monthlyExpense = 0;

                        transactions.forEach(t => {
                            const tDate = new Date(t.date);
                            if ((tDate.getMonth() + 1) === gMonth && tDate.getFullYear() === gYear) {
                                if (t.type === 'INCOME') monthlyIncome += (t.amount || 0);
                                else if (t.type === 'EXPENSE') monthlyExpense += (t.amount || 0);
                            }
                        });

                        const currentSaved = monthlyIncome - monthlyExpense;
                        // Clamp percentage between 0 and 100
                        const percentage = Math.min(Math.max((currentSaved / goal.targetAmount) * 100, 0), 100);
                        const isGoalMet = currentSaved >= goal.targetAmount;
                        const remaining = Math.max(goal.targetAmount - currentSaved, 0);

                        return (
                            <div key={goal.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            {monthNames[gMonth - 1]} {gYear}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-1 font-medium">Monthly Target</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(goal)}
                                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(goal.id)}
                                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div
                                            className={cn("p-2 rounded-full shadow-sm")}
                                            style={{
                                                backgroundColor: isGoalMet ? '#10b98115' : `${SAVINGS_COLORS[(gMonth - 1) % SAVINGS_COLORS.length]}15`,
                                                color: isGoalMet ? '#10b981' : SAVINGS_COLORS[(gMonth - 1) % SAVINGS_COLORS.length],
                                                border: `1px solid ${isGoalMet ? '#10b98125' : `${SAVINGS_COLORS[(gMonth - 1) % SAVINGS_COLORS.length]}25`}`
                                            }}
                                        >
                                            {isGoalMet ? <CheckCircle2 className="w-5 h-5" /> : React.createElement(SAVINGS_ICONS[(gMonth - 1) % SAVINGS_ICONS.length], { className: "w-5 h-5" })}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-muted-foreground">Saved</span>
                                        <span className={cn("font-bold", isGoalMet && "text-green-600")}>
                                            ₹{currentSaved.toLocaleString('en-IN', { minimumFractionDigits: 2 })} <span className="text-muted-foreground font-normal">/ ₹{goal.targetAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full transition-all duration-500",
                                                isGoalMet ? "bg-green-500" : "bg-indigo-600"
                                            )}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                                        <span>0%</span>
                                        <span>{percentage.toFixed(0)}%</span>
                                    </div>
                                </div>

                                {!isGoalMet ? (
                                    <div className="bg-muted/50 p-3 rounded-lg text-xs font-medium flex items-center gap-2 text-muted-foreground">
                                        <div style={{ color: SAVINGS_COLORS[(gMonth - 1) % SAVINGS_COLORS.length] }}>
                                            {React.createElement(SAVINGS_ICONS[(gMonth - 1) % SAVINGS_ICONS.length], { className: "w-4 h-4" })}
                                        </div>
                                        <span>₹{remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })} more to reach goal</span>
                                    </div>
                                ) : (
                                    <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg text-xs font-medium flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Remaining: ₹0.00 — Goal Achieved!
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-card w-full max-w-2xl border border-border/50 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
                            <h2 className="text-xl font-bold">{editingId ? 'Edit Savings Goal' : 'New Savings Goal'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Month</label>
                                        <select
                                            className="w-full p-2 bg-background border border-border rounded-md"
                                            value={formData.month}
                                            onChange={e => setFormData({ ...formData, month: parseInt(e.target.value) })}
                                        >
                                            {monthNames.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Year</label>
                                        <input
                                            type="number"
                                            min="2000"
                                            max="2100"
                                            className="w-full p-2 bg-background border border-border rounded-md"
                                            value={formData.year}
                                            onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div >

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Target Amount (INR)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            disabled={isFormDisabled}
                                            className={cn(
                                                "w-full pl-8 pr-4 py-2 bg-background border border-border rounded-md transition-all",
                                                isFormDisabled && "opacity-60 cursor-not-allowed bg-muted"
                                            )}
                                            placeholder={(() => {
                                                const existing = savings.find(s => s.id === editingId);
                                                return existing ? existing.targetAmount.toString() : "0";
                                            })()}
                                            value={formData.targetAmount}
                                            onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 hover:bg-muted rounded-md text-sm font-medium transition-colors" disabled={isSubmitting}>Cancel</button>

                                    {isFormDisabled && !isEditingActive ? (
                                        <button
                                            type="button"
                                            onClick={handleEditClick}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2"
                                        >
                                            <Pencil className="w-4 h-4" />
                                            Edit Goal
                                        </button>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium shadow-md hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    {editingId ? 'Updating...' : 'Saving...'}
                                                </>
                                            ) : (editingId ? 'Update Goal' : 'Save Goal')}
                                        </button>
                                    )}
                                </div>
                            </form >
                        </div >
                    </div >
                </div >
            )}

            {/* Custom Delete Confirmation Modal */}
            {
                isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/40 backdrop-blur-md p-4 animate-in fade-in">
                        <div className="bg-card w-full max-w-[400px] border border-border/50 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                            <div className="p-8 text-center">
                                <div className="mx-auto w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
                                    <AlertTriangle className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-black text-foreground mb-2">Are you sure?</h2>
                                <p className="text-muted-foreground font-medium text-sm leading-relaxed px-4">
                                    This action will permanently remove this savings goal. This cannot be undone.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 border-t border-border">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="p-5 text-sm font-bold text-muted-foreground hover:bg-muted/50 transition-colors border-r border-border uppercase tracking-widest"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="p-5 text-sm font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all uppercase tracking-widest"
                                >
                                    Yes, Remove
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Savings;
