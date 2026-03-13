import React, { useState, useEffect } from 'react';
import { Factory, Truck, ArrowRight, Save, Plus, Search, Filter, Calendar } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function FactoryOperations() {
    const [activeTab, setActiveTab] = useState('sales');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [salesData, setSalesData] = useState({ data: [], total_pages: 1, current_page: 1 });
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        factory_name: '',
        start_date: '',
        end_date: '',
        page: 1
    });

    const [formData, setFormData] = useState({
        invoice_number: '',
        factory_name: '',
        material_name: '',
        vehicle_number: '',
        driver_name: '',
        destination: '',
        tonnes: '',
        selling_price_per_ton: '',
        gst_percentage: 18,
        advanced_payment: '',
        payment_received: '',
        due_date: ''
    });

    const [calc, setCalc] = useState({ base: 0, gst: 0, total: 0, pending: 0 });

    const fetchSales = async () => {
        try {
            const params = new URLSearchParams({
                search: searchTerm,
                factory_name: filters.factory_name,
                start_date: filters.start_date,
                end_date: filters.end_date,
                page: filters.page,
                limit: 10
            });
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/factory/sale?${params}`);
            const data = await res.json();
            setSalesData(data);
        } catch (e) {
            console.error("Error fetching sales:", e);
        }
    };

    useEffect(() => {
        fetchSales();
    }, [filters, searchTerm]);

    useEffect(() => {
        const tonnes = parseFloat(formData.tonnes) || 0;
        const rate = parseFloat(formData.selling_price_per_ton) || 0;
        const gstP = parseFloat(formData.gst_percentage) || 0;
        const adv = parseFloat(formData.advanced_payment) || 0;
        const rec = parseFloat(formData.payment_received) || 0;

        const base = tonnes * rate;
        const gst = (base * gstP) / 100;
        const total = base + gst;
        const pending = total - (adv + rec);

        setCalc({ base, gst, total, pending });
    }, [formData]);

    const handleSubmit = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/factory/sale`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsFormOpen(false);
                alert('Sale Recorded Successfully!');
                fetchSales();
                // Reset form
                setFormData({
                    invoice_number: '', factory_name: '', material_name: '',
                    vehicle_number: '', driver_name: '', destination: '',
                    tonnes: '', selling_price_per_ton: '', gst_percentage: 18,
                    advanced_payment: '', payment_received: '', due_date: ''
                });
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert('Error: ' + (errorData.error || 'Failed to save sale'));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fmt = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num || 0);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-heading font-bold text-base-50 flex items-center gap-3">
                        <Factory size={28} className="text-accent" />
                        Factory Sales
                    </h2>
                    <p className="text-base-100/60 font-medium text-sm">Expert Ledger: Invoicing, GST, and Multi-party Balance Recovery</p>
                </div>
                <button onClick={() => setIsFormOpen(!isFormOpen)} className="gvk-btn flex items-center gap-2">
                    <Plus size={18} /> {isFormOpen ? 'Close Form' : 'New Invoice'}
                </button>
            </div>

            {isFormOpen && (
                <form className="gvk-card p-6 border-accent/20 space-y-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Invoice #</label>
                            <input required type="text" className="gvk-input" value={formData.invoice_number} onChange={e => setFormData({ ...formData, invoice_number: e.target.value })} placeholder="GVK/2024/001" />
                        </div>
                        <div>
                            <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Factory (Billed To)</label>
                            <input required type="text" className="gvk-input" value={formData.factory_name} onChange={e => setFormData({ ...formData, factory_name: e.target.value })} placeholder="e.g. JSW Steel" />
                        </div>
                        <div>
                            <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Material Name</label>
                            <input required type="text" className="gvk-input" value={formData.material_name} onChange={e => setFormData({ ...formData, material_name: e.target.value })} placeholder="e.g. Iron Ore 62% Fe" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Vehicle #</label>
                            <input required type="text" className="gvk-input" value={formData.vehicle_number} onChange={e => setFormData({ ...formData, vehicle_number: e.target.value })} placeholder="KA 01 XY 1234" />
                        </div>
                        <div>
                            <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Driver Name</label>
                            <input type="text" className="gvk-input" value={formData.driver_name} onChange={e => setFormData({ ...formData, driver_name: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Destination</label>
                            <input type="text" className="gvk-input" value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Qty (Tonnes)</label>
                            <input required type="number" step="0.01" className="gvk-input" value={formData.tonnes} onChange={e => setFormData({ ...formData, tonnes: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Selling Rate (₹)</label>
                            <input required type="number" step="1" className="gvk-input" value={formData.selling_price_per_ton} onChange={e => setFormData({ ...formData, selling_price_per_ton: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">GST %</label>
                            <select className="gvk-input" value={formData.gst_percentage} onChange={e => setFormData({ ...formData, gst_percentage: e.target.value })}>
                                <option value="0">0%</option>
                                <option value="5">5%</option>
                                <option value="12">12%</option>
                                <option value="18">18%</option>
                                <option value="28">28%</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Due Date</label>
                            <input type="date" className="gvk-input" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold font-data text-status-success">Advanced Rec. (₹)</label>
                            <input type="number" step="1" className="gvk-input focus:border-status-success" value={formData.advanced_payment} onChange={e => setFormData({ ...formData, advanced_payment: e.target.value })} />
                        </div>
                        <div>
                            <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold font-data text-status-success">Post-Delivery Rec. (₹)</label>
                            <input type="number" step="1" className="gvk-input focus:border-status-success" value={formData.payment_received} onChange={e => setFormData({ ...formData, payment_received: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-base-900 rounded-lg border border-base-700 space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-base-100/40">Subtotal:</span> <span className="font-data text-base-50">{fmt(calc.base)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-base-100/40">{formData.gst_percentage}% GST:</span> <span className="font-data text-accent">+{fmt(calc.gst)}</span></div>
                            <div className="flex justify-between text-lg font-heading text-base-50 font-bold border-t border-base-700 pt-2">
                                <span>Grand Total:</span> <span className="text-accent">{fmt(calc.total)}</span>
                            </div>
                        </div>
                        <div className="p-4 bg-status-error/5 text-status-error rounded-lg border border-status-error/20 flex flex-col justify-center items-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Final Balance Due</span>
                            <span className="text-3xl font-bold font-data tabular-nums">{fmt(calc.pending)}</span>
                        </div>
                    </div>

                    <button type="button" onClick={handleSubmit} className="gvk-btn w-full items-center justify-center flex gap-2"><Save size={18} /> Generate Invoice & Record Sale</button>
                </form>
            )}

            {/* Advanced Filters */}
            <div className="gvk-card !bg-base-900/40 border-base-700/50 p-4">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                const now = new Date();
                                const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                                const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                                setFilters({ ...filters, start_date: start, end_date: end, page: 1 });
                            }}
                            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-accent/10 text-accent rounded-full border border-accent/20 hover:bg-accent hover:text-base-900 transition-all"
                        >
                            Show This Month
                        </button>
                        <button
                            onClick={() => setFilters({ ...filters, start_date: '', end_date: '', page: 1 })}
                            className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-base-700/50 text-base-100/50 rounded-full border border-base-700 hover:text-base-100 transition-all"
                        >
                            Reset Dates
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="search-container">
                        <Search className="search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Invoice, Vehicle or Material..."
                            className="search-input-fixed"
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setFilters({ ...filters, page: 1 }); }}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-base-100/40 uppercase font-bold mb-1 block">Factory Filter</label>
                        <input
                            type="text"
                            placeholder="All Companies"
                            className="search-input-fixed !pl-4"
                            value={filters.factory_name}
                            onChange={e => setFilters({ ...filters, factory_name: e.target.value, page: 1 })}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-base-100/40 uppercase font-bold mb-1 block">From Date</label>
                        <input
                            type="date"
                            className="search-input-fixed !pl-4"
                            value={filters.start_date}
                            onChange={e => setFilters({ ...filters, start_date: e.target.value, page: 1 })}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] text-base-100/40 uppercase font-bold mb-1 block">To Date</label>
                        <input
                            type="date"
                            className="search-input-fixed !pl-4"
                            value={filters.end_date}
                            onChange={e => setFilters({ ...filters, end_date: e.target.value, page: 1 })}
                        />
                    </div>
                </div>
            </div>

            {/* Data Grid */}
            <div className="gvk-card overflow-hidden !p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-base-900/80 border-b border-base-700 text-base-100/50 uppercase tracking-wider text-[10px] font-bold">
                                <th className="p-4">Invoice / Date</th>
                                <th className="p-4">Entity & Material</th>
                                <th className="p-4">Transport Details</th>
                                <th className="p-4 text-right">Qty x Rate</th>
                                <th className="p-4 text-right">Total (+GST)</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-base-700/50">
                            {salesData.data.length === 0 ? (
                                <tr><td colSpan={7} className="p-12 text-center text-base-100/30">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search size={40} className="mb-2 opacity-10" />
                                        <p>No transactions found matching your criteria</p>
                                    </div>
                                </td></tr>
                            ) : (
                                salesData.data.map((s) => (
                                    <tr key={s.id} className="hover:bg-accent/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-data font-bold text-base-50 text-xs">#{s.invoice_number || 'N/A'}</div>
                                            <div className="text-[10px] text-base-100/40 flex items-center gap-1 mt-1">
                                                <Calendar size={10} /> {s.date?.split(' ')[0]}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-heading font-semibold text-base-100 group-hover:text-accent transition-colors">{s.factory_name}</div>
                                            <div className="text-[10px] text-base-100/50 uppercase tracking-tight">{s.material_name}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Truck size={14} className="text-base-100/30" />
                                                <span className="text-xs font-data text-base-50 font-medium">{s.vehicle_number || 'N/A'}</span>
                                            </div>
                                            <div className="text-[10px] text-base-100/40 mt-1 ml-5">{s.destination || 'Direct Site'}</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="font-data text-base-50 text-sm">{s.tonnes} MT</div>
                                            <div className="text-[10px] text-base-100/40">@ {fmt(s.selling_price_per_ton)}</div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="font-data text-accent text-sm font-bold">{fmt(s.total_sales_amount)}</div>
                                            <div className="text-[10px] text-status-success/60">Rec: {fmt(s.payment_received + (s.advanced_payment || 0))}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`px-2 py-1 rounded text-[9px] font-bold tracking-widest inline-block ${s.payment_status === 'PAID' ? 'bg-status-success/20 text-status-success' : s.payment_status === 'PARTIAL' ? 'bg-status-warning/20 text-status-warning' : 'bg-status-error/20 text-status-error'}`}>
                                                {s.payment_status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className={`font-data text-sm font-bold ${s.payment_pending > 0 ? 'text-status-error' : 'text-status-success opacity-40'}`}>
                                                {fmt(s.payment_pending)}
                                            </div>
                                            {s.payment_pending > 0 && <div className="text-[9px] text-base-100/40 mt-1">Due: {s.due_date || 'TBD'}</div>}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={salesData.current_page}
                    totalPages={salesData.total_pages}
                    onPageChange={(p) => setFilters({ ...filters, page: p })}
                />
            </div>
        </div>
    );
}
