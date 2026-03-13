import React, { useState, useEffect } from 'react';
import { Pickaxe, Plus, Save, Search, Calculator, Boxes } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function MinePurchases() {
    const [purchasesData, setPurchasesData] = useState({ data: [], total_pages: 1, current_page: 1 });
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);

    // Exhaustive Phase 3 Tracking Form
    const [formData, setFormData] = useState({
        mine_name: '', material_name: '', tonnes: '', cost_per_ton: '',
        gst_percentage: 18, loading_charges: '', transport_hire: '', payment_status: 'PENDING'
    });

    // Auto calculated values
    const [calculated, setCalculated] = useState({ basePrice: 0, gstAmount: 0, total: 0 });

    useEffect(() => {
        const base = (Number(formData.tonnes) || 0) * (Number(formData.cost_per_ton) || 0);
        const gst = (base * (Number(formData.gst_percentage) || 0)) / 100;
        const finalTotal = base + gst + (Number(formData.loading_charges) || 0) + (Number(formData.transport_hire) || 0);

        setCalculated({ basePrice: base, gstAmount: gst, total: finalTotal });
    }, [formData]);

    const fetchPurchases = () => {
        setLoading(true);
        const params = new URLSearchParams({
            search: searchTerm,
            page: page,
            limit: 10
        });
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/mine/?${params}`)
            .then(res => res.json())
            .then(data => {
                setPurchasesData(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchPurchases();
    }, [page, searchTerm]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/mine`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsFormOpen(false);
                setFormData({
                    mine_name: '', material_name: '', tonnes: '', cost_per_ton: '',
                    gst_percentage: 18, loading_charges: '', transport_hire: '', payment_status: 'PENDING'
                });
                alert("Mine Execution Saved Successfully!");
                fetchPurchases();
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert("Error: " + (errorData.error || "Failed to save purchase"));
            }
        } catch (e) {
            console.error(e);
            alert("Network Error");
        }
    };

    const fmt = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num || 0);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-heading font-bold text-base-50 flex items-center gap-3">
                        <Pickaxe size={28} className="text-accent" />
                        Extraction Ledger
                    </h2>
                    <p className="text-base-100/60 font-medium text-sm">Real-time procurement tracking & mine logistics</p>
                </div>
                <button onClick={() => setIsFormOpen(!isFormOpen)} className="gvk-btn !bg-accent !text-base-900 flex items-center gap-2 font-bold shadow-lg shadow-accent/10">
                    <Plus size={18} /> {isFormOpen ? 'Close Ledger' : 'Create Procurement'}
                </button>
            </div>

            {isFormOpen && (
                <form onSubmit={handleSubmit} className="gvk-card p-6 border-accent/20 space-y-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center border-b border-base-700 pb-3">
                        <h3 className="text-xl font-heading text-accent uppercase font-semibold">Log Extraction Workflow</h3>
                        <div className="flex gap-4 items-center">
                            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-status-success">
                                <div className="w-1.5 h-1.5 bg-status-success rounded-full animate-pulse"></div>
                                Live Sync
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Source Mine</label>
                            <input required type="text" className="gvk-input" value={formData.mine_name} onChange={e => setFormData({ ...formData, mine_name: e.target.value })} placeholder="e.g. Balaji Mines" />
                        </div>
                        <div>
                            <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Material / Grade</label>
                            <input required type="text" className="gvk-input" value={formData.material_name} onChange={e => setFormData({ ...formData, material_name: e.target.value })} placeholder="e.g. Iron Ore 60%" />
                        </div>
                        <div>
                            <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Settlement Status</label>
                            <select className="gvk-input font-bold" value={formData.payment_status} onChange={e => setFormData({ ...formData, payment_status: e.target.value })}>
                                <option value="PENDING">PENDING</option>
                                <option value="PAID">PAID FULLY</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-base-900/40 p-5 rounded-2xl border border-base-700/50">
                        <div>
                            <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Tonnes (W/B)</label>
                            <input required type="number" step="0.01" className="gvk-input font-data text-lg" value={formData.tonnes} onChange={e => setFormData({ ...formData, tonnes: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Base Rate/Ton</label>
                            <input required type="number" step="1" className="gvk-input font-data text-lg" value={formData.cost_per_ton} onChange={e => setFormData({ ...formData, cost_per_ton: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Loading Exp.</label>
                            <input required type="number" step="1" className="gvk-input font-data text-lg" value={formData.loading_charges} onChange={e => setFormData({ ...formData, loading_charges: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Transport Out</label>
                            <input required type="number" step="1" className="gvk-input font-data text-lg" value={formData.transport_hire} onChange={e => setFormData({ ...formData, transport_hire: e.target.value })} />
                        </div>
                    </div>

                    <div className="p-5 bg-base-900 rounded-2xl flex justify-between items-center border border-accent/20 shadow-inner">
                        <div className="flex gap-8">
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-bold text-base-100/40 mb-1">Untaxed Base</span>
                                <span className="font-data text-base-50 font-bold">{fmt(calculated.basePrice)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] uppercase font-bold text-accent mb-1">{formData.gst_percentage}% GST Ledger</span>
                                <span className="font-data text-accent font-bold">+{fmt(calculated.gstAmount)}</span>
                            </div>
                        </div>
                        <div className="text-3xl font-data text-status-success font-black tracking-tighter shadow-status-success/5 drop-shadow-lg flex items-center gap-3">
                            <Calculator className="text-base-100/20" size={24} />
                            {fmt(calculated.total)}
                        </div>
                    </div>

                    <button type="submit" className="gvk-btn !bg-accent !text-base-900 w-full flex justify-center items-center gap-2 py-4 font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/10 transition-transform active:scale-[0.98]">
                        <Save size={18} /> Commit to Ledger
                    </button>
                </form>
            )}

            {/* Modern Data Grid */}
            <div className="gvk-card overflow-hidden !p-0">
                <div className="p-4 border-b border-base-700 bg-base-900 flex justify-between items-center sm:flex-row flex-col gap-4">
                    <h3 className="font-heading font-bold text-base-50 text-xs uppercase tracking-widest flex items-center gap-2">
                        <Boxes size={14} className="text-accent" /> PROCUREMENT HISTORY
                    </h3>
                    <div className="search-container">
                        <Search className="search-icon" size={14} />
                        <input
                            type="text"
                            placeholder="Universal Filter..."
                            className="search-input-fixed !py-1.5 text-xs w-48"
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-base-900 border-b border-base-700 text-base-100/40 uppercase tracking-wider text-[10px] font-bold">
                                <th className="p-4">Timestamp</th>
                                <th className="p-4">Entity Details</th>
                                <th className="p-4 text-right">Accounting (Rate x Tonnes)</th>
                                <th className="p-4 text-center">Settlement</th>
                                <th className="p-4 text-right">Net Payable</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-base-700/50">
                            {loading ? (
                                <tr><td colSpan={5} className="p-12 text-center text-base-100/20 italic">Synchronizing with blockchain records...</td></tr>
                            ) : purchasesData.data.length === 0 ? (
                                <tr><td colSpan={5} className="p-12 text-center text-base-100/30">No matching procurement records found.</td></tr>
                            ) : (
                                purchasesData.data.map((p) => (
                                    <tr key={p.id} className="hover:bg-base-700/20 transition-colors group">
                                        <td className="p-4 text-xs font-data text-base-100/50">{p.date.split(' ')[0]}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-base-50 text-sm group-hover:text-accent transition-colors">{p.mine_name}</div>
                                            <div className="text-[10px] text-base-100/40 uppercase mt-0.5 tracking-tight">{p.material_name}</div>
                                        </td>
                                        <td className="p-4 text-right text-xs">
                                            <div className="font-data text-base-50 font-bold">{p.tonnes}T <span className="text-[9px] text-base-100/30 mx-1">x</span> {fmt(p.cost_per_ton)}</div>
                                            <div className="text-[9px] text-base-100/40 mt-1 uppercase">Extras: +{fmt(p.loading_charges + p.transport_hire)}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-tighter uppercase ${p.payment_status === 'PAID' ? 'bg-status-success/20 text-status-success border border-status-success/30' : 'bg-status-error/20 text-status-error border border-status-error/30'}`}>
                                                {p.payment_status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="font-data text-accent font-black text-sm tracking-tighter">{fmt(p.total_buying)}</div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={purchasesData.current_page}
                    totalPages={purchasesData.total_pages}
                    onPageChange={(p) => setPage(p)}
                />
            </div>
        </div>
    );
}
