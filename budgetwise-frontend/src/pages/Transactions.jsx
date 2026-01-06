import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from "@clerk/clerk-react";
import api from '../services/api';
import { Plus, Trash2, Search, Loader2, X, Download, AlertTriangle, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

const EXPENSE_CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Education", "Health", "Bills", "Other"];
const INCOME_CATEGORIES = ["Salary", "Investment", "Bonus", "Other"];
const CURRENCIES = ["INR", "USD", "EUR", "GBP"];

const Transactions = () => {
    const { getToken } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [idToDelete, setIdToDelete] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        type: 'EXPENSE',
        amount: '',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        description: '',
        currency: 'INR'
    });

    const fetchTransactions = async () => {
        try {
            const token = await getToken();
            const res = await api.get('/transactions', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTransactions(res.data);
        } catch (err) {
            console.error("Error fetching transactions", err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [getToken]);

    // Handle Delete Trigger
    const handleDeleteClick = (id) => {
        setIdToDelete(id);
        setIsDeleteModalOpen(true);
    };

    // Confirm Delete Action
    const confirmDelete = async () => {
        if (!idToDelete) return;

        const originalTransactions = [...transactions];
        setTransactions(transactions.filter(t => t.id !== idToDelete)); // Optimistic UI update

        try {
            const token = await getToken();
            await api.delete(`/transactions/${idToDelete}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Transaction deleted successfully.");
        } catch (err) {
            setTransactions(originalTransactions);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsDeleteModalOpen(false);
            setIdToDelete(null);
        }
    };

    const handleExport = async () => {
        try {
            toast.loading("Exporting CSV...");
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
            toast.dismiss();
            toast.success("Export successful.");
        } catch (err) {
            console.error("Error downloading report", err);
            toast.dismiss();
            toast.error("Something went wrong. Please try again.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = await getToken();

            const payload = {
                ...formData,
                originalCurrency: formData.currency,
                originalAmount: formData.amount,
                description: formData.description
            };

            await api.post('/transactions', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchTransactions();
            setIsModalOpen(false);
            setFormData({
                type: 'EXPENSE',
                amount: '',
                category: 'Food',
                date: new Date().toISOString().split('T')[0],
                description: '',
                currency: 'INR'
            });
            toast.success("Transaction added successfully.");
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    const filteredTransactions = transactions.filter(t => {
        const search = searchTerm.toLowerCase();
        const formattedDate = format(new Date(t.date), 'dd MMM, yyyy').toLowerCase();
        const formattedOriginal = (t.originalCurrency && t.originalAmount)
            ? `${t.originalCurrency} ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(t.originalAmount)}`.toLowerCase()
            : "";

        const matchesSearch = (
            (t.description?.toLowerCase() || "").includes(search) ||
            (t.category?.toLowerCase() || "").includes(search) ||
            (t.type?.toLowerCase() || "").includes(search) ||
            (t.amount?.toString() || "").includes(search) ||
            formattedDate.includes(search) ||
            formattedOriginal.includes(search)
        );
        const matchesDate = dateFilter ? t.date.startsWith(dateFilter) : true;
        return matchesSearch && matchesDate;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                    <p className="text-muted-foreground">Manage and track your financial history.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-secondary/50 text-secondary-foreground px-4 py-2 rounded-lg font-medium hover:bg-secondary transition-colors"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
                    >
                        <Plus className="w-4 h-4" /> Add Transaction
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10 w-full pl-9 pr-4 rounded-xl border border-border bg-card shadow-sm text-sm outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all"
                    />
                </div>
                <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="h-10 w-full md:w-auto px-4 rounded-xl border border-border bg-card shadow-sm text-sm outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all text-muted-foreground"
                />
                {(searchTerm || dateFilter) && (
                    <button
                        onClick={() => { setSearchTerm(""); setDateFilter(""); }}
                        className="h-10 px-4 bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl font-medium transition-all flex items-center gap-2"
                    >
                        <X className="w-4 h-4" /> Clear
                    </button>
                )}
            </div>

            <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-bold border-b border-border">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground italic">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-muted-foreground/70" />
                                                {format(new Date(t.date), 'dd MMM, yyyy')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "text-xs font-bold uppercase tracking-wider",
                                                t.type === 'INCOME' ? "text-green-600" : "text-red-500"
                                            )}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-foreground">
                                                {t.category}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground max-w-[200px] truncate">
                                            {t.description || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className={cn(
                                                "font-bold tabular-nums break-words leading-tight",
                                                t.type === 'INCOME' ? "text-green-600" : "text-red-500"
                                            )}>
                                                {t.type === 'INCOME' ? '+' : '-'}₹{(t.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </div>
                                            {t.originalCurrency && t.originalCurrency !== 'INR' && (
                                                <div className="text-[10px] text-muted-foreground font-medium mt-0.5 opacity-80">
                                                    {t.originalCurrency} {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(t.originalAmount || 0)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleDeleteClick(t.id)}
                                                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Delete Transaction"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {isModalOpen && createPortal(
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in">
                        <div className="bg-card w-full max-w-2xl border border-border/50 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
                            <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold">New Transaction</h2>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 space-y-4">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Type</label>
                                            <div className="flex bg-muted p-1 rounded-lg">
                                                {['EXPENSE', 'INCOME'].map(type => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, type, category: type === 'INCOME' ? 'Salary' : 'Food' })}
                                                        className={cn(
                                                            "flex-1 py-1.5 text-xs font-bold rounded-md transition-all",
                                                            formData.type === type ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div >
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Currency</label>
                                            <select
                                                value={formData.currency}
                                                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                                className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                                            >
                                                {CURRENCIES.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div >

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Amount</label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all placeholder:text-muted-foreground/50"
                                            placeholder="0.00"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                                        >
                                            {(formData.type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Description (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full h-10 px-3 rounded-lg border border-border bg-background focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all placeholder:text-muted-foreground/50"
                                            placeholder="e.g. Lunch with team"
                                        />
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full h-12 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-600/20"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                                                </>
                                            ) : (
                                                <>
                                                    Save Transaction
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

                {/* Custom Delete Confirmation Modal */}
                {isDeleteModalOpen && createPortal(
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/40 backdrop-blur-md p-4 animate-in fade-in">
                        <div className="bg-card w-full max-w-[400px] border border-border/50 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                            <div className="p-8 text-center">
                                <div className="mx-auto w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
                                    <AlertTriangle className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-black text-foreground mb-2">Are you sure?</h2>
                                <p className="text-muted-foreground font-medium text-sm leading-relaxed px-4">
                                    This action will permanently remove this transaction. This cannot be undone.
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
                )}
            </div>
        </div>
    );
};

export default Transactions;
