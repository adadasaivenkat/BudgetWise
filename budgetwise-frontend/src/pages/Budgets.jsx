import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from "@clerk/clerk-react";
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Plus, Target, AlertTriangle, Loader2, Trash2, X, Pencil, PieChart, Utensils, Car, ShoppingBag, Ticket, GraduationCap, HeartPulse, Receipt, Layers } from 'lucide-react';
import { cn } from '../lib/utils';

const categories = ["Food", "Transport", "Shopping", "Entertainment", "Education", "Health", "Bills", "Other"];

const CATEGORY_COLORS = {
    'Food': '#10b981',      // Emerald-500
    'Transport': '#3b82f6', // Blue-500
    'Bills': '#eab308',     // Yellow-500
    'Entertainment': '#f97316',// Orange-500
    'Shopping': '#a855f7',  // Purple-500
    'Education': '#ec4899', // Pink-500
    'Health': '#ef4444',    // Red-500
    'Other': '#71717a'      // Zinc-500
};

const CATEGORY_ICONS = {
    'Food': Utensils,
    'Transport': Car,
    'Shopping': ShoppingBag,
    'Entertainment': Ticket,
    'Education': GraduationCap,
    'Health': HeartPulse,
    'Bills': Receipt,
    'Other': Layers
};

const Budgets = () => {
    const { getToken } = useAuth();
    const [budgets, setBudgets] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        category: 'Food',
        limitAmount: '',
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

            // Parallel fetch
            const [budgetRes, transRes] = await Promise.all([
                api.get('/budgets', { headers }),
                api.get('/transactions', { headers })
            ]);

            setBudgets(budgetRes.data);
            setTransactions(transRes.data);
        } catch (err) {
            console.error("Error fetching budget data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [getToken]);

    // Contextual Check Effect
    useEffect(() => {
        const existingBudget = budgets.find(b =>
            b.category === formData.category &&
            b.month === formData.month &&
            b.year === formData.year
        );

        if (existingBudget) {
            // Found existing: Pre-fill, set ID, Disable form (View Mode)
            setEditingId(existingBudget.id);
            setFormData(prev => ({ ...prev, limitAmount: existingBudget.limitAmount }));
            setIsFormDisabled(true);
            setIsEditingActive(false);
        } else {
            // No existing: Clear ID, Clear Amount (avoid clearing if just typing? No, context switch clears), Enable form
            setEditingId(null);
            setFormData(prev => ({ ...prev, limitAmount: '' }));
            setIsFormDisabled(false);
            setIsEditingActive(true); // "Save" mode is active
        }
    }, [formData.category, formData.month, formData.year, budgets]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = await getToken();

            // Determine if we are editing (explicitly or via overwrite match)
            if (editingId) {
                await api.put('/budgets', { ...formData, id: editingId }, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("Budget updated successfully.");
            } else {
                await api.post('/budgets', formData, { headers: { Authorization: `Bearer ${token}` } });
                toast.success("Budget saved successfully.");
            }
            setIsModalOpen(false);
            fetchData(); // Will trigger effect and re-disable form if found
        } catch (err) {
            console.error("Error saving budget", err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (e) => {
        e.preventDefault();
        setIsEditingActive(true); // Enable inputs
        setIsFormDisabled(false); // Enable inputs
    };

    const handleEdit = (budget) => {
        setEditingId(budget.id);
        setFormData({
            category: budget.category,
            limitAmount: budget.limitAmount,
            month: budget.month,
            year: budget.year
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
            await api.delete(`/budgets/${idToDelete}`, { headers: { Authorization: `Bearer ${token}` } });
            setBudgets(prev => prev.filter(b => b.id !== idToDelete));
            toast.success("Budget removed successfully.");
        } catch (err) {
            console.error("Error deleting budget", err);
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
                    <h1 className="text-3xl font-bold tracking-tight">Monthly Budgets</h1>
                    <p className="text-muted-foreground">Set spending limits and track your monthly expenses.</p>
                </div>
                <button
                    onClick={() => {
                        setFormData({
                            category: 'Food',
                            limitAmount: '',
                            month: new Date().getMonth() + 1,
                            year: new Date().getFullYear()
                        });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm shadow-lg shadow-indigo-600/20"
                >
                    <Plus className="w-4 h-4" />
                    Set Monthly Budget
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <p className="text-muted-foreground col-span-full text-center py-10">Loading budgets...</p>
                ) : budgets.length === 0 ? (
                    <div className="col-span-full text-center py-10 border-2 border-dashed border-border rounded-xl">
                        <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                        <h3 className="font-medium text-lg">No budgets yet</h3>
                        <p className="text-muted-foreground">Set a monthly budget to start tracking your spending.</p>
                    </div>
                ) : (
                    budgets.map(b => {
                        // Calculate spent for THIS budget's specific month/year
                        const bMonth = b.month || (new Date().getMonth() + 1);
                        const bYear = b.year || new Date().getFullYear();

                        const spent = transactions.reduce((sum, t) => {
                            const tDate = new Date(t.date);
                            if (
                                t.category === b.category &&
                                t.type === 'EXPENSE' &&
                                (tDate.getMonth() + 1) === bMonth &&
                                tDate.getFullYear() === bYear
                            ) {
                                return sum + (t.amount || 0);
                            }
                            return sum;
                        }, 0);

                        const percentage = b.limitAmount > 0
                            ? Math.min((spent / b.limitAmount) * 100, 100)
                            : 0;
                        const isOverBudget = spent > b.limitAmount;
                        const isNearBudget = percentage > 80;

                        return (
                            <div key={b.id} className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-lg truncate">{b.category}</h3>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            {monthNames[bMonth - 1]} {bYear}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1 font-medium italic">Monthly Limit</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEdit(b)}
                                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(b.id)}
                                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div
                                            className={cn("p-2 rounded-full shadow-sm")}
                                            style={{
                                                backgroundColor: isOverBudget ? undefined : `${CATEGORY_COLORS[b.category] || '#6366f1'}15`,
                                                color: isOverBudget ? undefined : (CATEGORY_COLORS[b.category] || '#6366f1'),
                                                border: isOverBudget ? undefined : `1px solid ${CATEGORY_COLORS[b.category] || '#6366f1'}25`
                                            }}
                                        >
                                            {isOverBudget ? <AlertTriangle className="w-5 h-5 text-red-600" /> : (CATEGORY_ICONS[b.category] ? React.createElement(CATEGORY_ICONS[b.category], { className: "w-5 h-5" }) : <Target className="w-5 h-5" />)}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-muted-foreground">Spent</span>
                                        <span className={cn("font-bold", isOverBudget && "text-red-500")}>
                                            ₹{spent.toLocaleString('en-IN', { minimumFractionDigits: 2 })} <span className="text-muted-foreground font-normal">/ ₹{b.limitAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className={cn("h-full transition-all duration-500",
                                                isOverBudget ? "bg-red-500" : isNearBudget ? "bg-yellow-500" : "bg-indigo-600"
                                            )}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                                        <span>0%</span>
                                        <span>{percentage.toFixed(0)}%</span>
                                    </div>
                                </div>

                                {!isOverBudget ? (
                                    <div className="bg-muted/50 p-3 rounded-lg text-xs font-medium flex items-center gap-2 text-muted-foreground">
                                        {React.createElement(CATEGORY_ICONS[b.category] || Target, { className: "w-4 h-4" })}
                                        <span>₹{(b.limitAmount - spent).toLocaleString('en-IN', { minimumFractionDigits: 2 })} remaining in budget</span>
                                    </div>
                                ) : (
                                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-xs font-medium flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />
                                        <span>Exceeded by ₹{(spent - b.limitAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}!</span>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-card w-full max-w-2xl border border-border/50 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
                            <h2 className="text-xl font-bold">{editingId ? 'Edit Budget' : 'New Budget'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 space-y-4">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <select
                                        className="w-full p-2 bg-background border border-border rounded-md lowercase capitalize"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

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
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Monthly Limit (INR)</label>
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
                                                const existing = budgets.find(b => b.id === editingId);
                                                return existing ? existing.limitAmount.toString() : "0";
                                            })()}
                                            value={formData.limitAmount}
                                            onChange={e => setFormData({ ...formData, limitAmount: e.target.value })}
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
                                            Edit Budget
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
                                            ) : (editingId ? 'Update Budget' : 'Save Budget')}
                                        </button>
                                    )}
                                </div>
                            </form >
                        </div >
                    </div >
                </div >,
                document.body
            )}

            {/* Custom Delete Confirmation Modal */}
            {
                isDeleteModalOpen && createPortal(
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/40 backdrop-blur-md p-4 animate-in fade-in">
                        <div className="bg-card w-full max-w-[400px] border border-border/50 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                            <div className="p-8 text-center">
                                <div className="mx-auto w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
                                    <AlertTriangle className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-black text-foreground mb-2">Are you sure?</h2>
                                <p className="text-muted-foreground font-medium text-sm leading-relaxed px-4">
                                    This action will permanently remove this budget goal. This cannot be undone.
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
                    </div>,
                    document.body
                )
            }
        </div >
    );
};

export default Budgets;
