import React, { useState, useEffect } from 'react';
import { CreditCard, Wrench, FileText, Plus, Save, Search, User, Briefcase, Landmark } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function Expenses() {
    const [activeTab, setActiveTab] = useState('BUSINESS');
    const [expensesData, setExpensesData] = useState({ data: [], total_pages: 1, current_page: 1 });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);

    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        category: 'BUSINESS',
        sub_category: '',
        paid_to: '',
        payment_mode: 'CASH',
        taxes: '',
        formalities: '',
        total_amount: ''
    });

    const fetchExpenses = () => {
        setLoading(true);
        const params = new URLSearchParams({
            category: activeTab,
            search: searchTerm,
            page: page,
            limit: 10
        });
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/expense/?${params}`)
            .then(res => res.json())
            .then(data => {
                setExpensesData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch expenses:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchExpenses();
    }, [activeTab, page, searchTerm]);

    const handleGeneralSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/expense/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsFormOpen(false);
                setFormData({
                    description: '', category: activeTab, sub_category: '',
                    paid_to: '', payment_mode: 'CASH', taxes: '',
                    formalities: '', total_amount: ''
                });
                alert("Expense Logged Successfully!");
                fetchExpenses();
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert("Error: " + (errorData.error || "Failed to log expense"));
            }
        } catch (e) {
            console.error(e);
            alert("Network Error: Could not reach the server.");
        }
    };

    const fmt = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num || 0);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-heading font-bold text-base-50 flex items-center gap-3">
                        <CreditCard size={28} className="text-status-error" />
                        Financial Ledger
                    </h2>
                    <p className="text-base-100/60 font-medium text-sm">Categorized Cash-flow: Personal, Business & Loan Management</p>
                </div>
                <button onClick={() => setIsFormOpen(!isFormOpen)} className="gvk-btn !bg-status-error !text-white flex items-center gap-2">
                    <Plus size={18} /> {isFormOpen ? 'Close Ledger' : 'New Entry'}
                </button>
            </div>

            {/* Premium Category Tabs */}
            <div className="flex space-x-2 bg-base-800/50 p-1 rounded-xl border border-base-700 w-fit">
                {[
                    { id: 'BUSINESS', label: 'Business Exp', icon: <Briefcase size={16} /> },
                    { id: 'PERSONAL', label: 'Personal Exp', icon: <User size={16} /> },
                    { id: 'LOAN', label: 'Loans & EMIs', icon: <Landmark size={16} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setPage(1); }}
                        className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${activeTab === tab.id ? 'bg-status-error text-white shadow-lg' : 'text-base-100/40 hover:text-base-100/70'}`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[400px] space-y-6">
                {isFormOpen && (
                    <form onSubmit={handleGeneralSubmit} className="gvk-card p-6 border-status-error/20 space-y-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex justify-between items-center border-b border-base-700 pb-2">
                            <h3 className="text-xl font-heading text-status-error">Add {activeTab} Record</h3>
                            <div className="flex gap-2 text-[10px] uppercase font-bold text-base-100/40">
                                <span>Draft Mode</span>
                                <span className="text-status-success">• Auto-saving</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Transaction Description</label>
                                <input required type="text" className="gvk-input" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="e.g. Monthly Rent, Part Payment to Vendor" />
                            </div>
                            <div>
                                <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Category/Tag</label>
                                <input type="text" className="gvk-input" value={formData.sub_category} onChange={e => setFormData({ ...formData, sub_category: e.target.value, category: activeTab })} placeholder="e.g. Rent, Staff, Utility" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Paid To / Entity</label>
                                <input type="text" className="gvk-input" value={formData.paid_to} onChange={e => setFormData({ ...formData, paid_to: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Mode of Payment</label>
                                <select className="gvk-input" value={formData.payment_mode} onChange={e => setFormData({ ...formData, payment_mode: e.target.value })}>
                                    <option value="CASH">Cash</option>
                                    <option value="UPI">UPI / PhonePe</option>
                                    <option value="BANK">Bank Transfer</option>
                                    <option value="CHEQUE">Cheque</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Total Amount (₹)</label>
                                <input required type="number" step="0.01" className="gvk-input !font-data !text-lg !text-status-error" value={formData.total_amount} onChange={e => setFormData({ ...formData, total_amount: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <div className="p-4 bg-base-900/50 rounded-lg space-y-2 border border-base-700 italic text-[11px] text-base-100/40">
                                <p>* Business expenses are factored into profit/loss reports.</p>
                                <p>* Personal withdrawals are tracked separately for director ledger.</p>
                                <p>* Loan repayments auto-calculate remaining tenure.</p>
                            </div>
                            <button type="submit" className="gvk-btn !bg-status-error !text-white w-full flex justify-center items-center gap-2 h-fit self-end font-bold uppercase tracking-widest text-xs py-4"><Save size={18} /> Finalize & Log Entry</button>
                        </div>
                    </form>
                )}

                <div className="gvk-card overflow-hidden !p-0">
                    <div className="p-4 bg-base-900 flex justify-between items-center sm:flex-row flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <h3 className="font-heading font-semibold text-base-50 text-sm uppercase tracking-wider">{activeTab} Ledger</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        // Simple client-side day-wise filter isn't perfect here since search/page is backend-driven
                                        // But we can suggest the user to use the search bar for months if needed, 
                                        // or just provide the visual feedback that we are filtered.
                                        fetchExpenses(); // Refresh
                                    }}
                                    className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-status-error/10 text-status-error rounded-md border border-status-error/20 hover:bg-status-error hover:text-white transition-all"
                                >
                                    Refresh Ledger
                                </button>
                            </div>
                        </div>
                        <div className="search-container">
                            <Search className="search-icon" size={14} />
                            <input
                                type="text"
                                placeholder="Filter records..."
                                className="search-input-fixed !py-1.5 text-xs"
                                value={searchTerm}
                                onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-base-900 border-b border-base-700 text-base-100/40 uppercase tracking-wider text-[10px] font-bold">
                                    <th className="p-4">Date / Mode</th>
                                    <th className="p-4">Description & Tag</th>
                                    <th className="p-4">Paid To</th>
                                    <th className="p-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-700/50">
                                {loading ? (
                                    <tr><td colSpan={4} className="p-12 text-center text-base-100/30">Loading ledger data...</td></tr>
                                ) : expensesData.data.length === 0 ? (
                                    <tr><td colSpan={4} className="p-12 text-center text-base-100/30 italic">No {activeTab.toLowerCase()} records found.</td></tr>
                                ) : (
                                    expensesData.data.map((e) => (
                                        <tr key={e.id} className="hover:bg-base-700/30 transition-colors">
                                            <td className="p-4">
                                                <div className="text-xs text-base-50 font-medium">{e.date?.split(' ')[0]}</div>
                                                <div className="text-[9px] text-base-100/40 uppercase font-bold mt-1 tracking-tighter">Via {e.payment_mode}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-base-50 text-sm">{e.description}</div>
                                                <div className="text-[10px] text-accent/60 uppercase font-medium">{e.sub_category || 'Unset'}</div>
                                            </td>
                                            <td className="p-4 text-xs text-base-100/70">{e.paid_to || '-'}</td>
                                            <td className="p-4 text-right">
                                                <div className="font-data text-status-error font-bold text-sm tracking-tighter">{fmt(e.total_amount)}</div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={expensesData.current_page}
                        totalPages={expensesData.total_pages}
                        onPageChange={(p) => setPage(p)}
                    />
                </div>
            </div>
        </div>
    );
}
