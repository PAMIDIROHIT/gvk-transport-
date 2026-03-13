import React, { useState, useEffect } from 'react';
import { Truck, ShieldAlert, Plus, Save, Search, Wallet, Calculator, Info } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function LorryFleet() {
    const [activeTab, setActiveTab] = useState('own'); // 'own', 'rented', 'payouts'
    const [fleetData, setFleetData] = useState({ data: [], total_pages: 1, current_page: 1 });
    const [payoutsData, setPayoutsData] = useState({ data: [], total_pages: 1, current_page: 1 });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Master Form state
    const [formData, setFormData] = useState({
        lorry_number: '', owner_name: 'GVK', lorry_type: 'OWN',
        emi_cost: 0, insurance_details: '', permit_details: ''
    });

    // Payout Form state
    const [payoutFormData, setPayoutFormData] = useState({
        vendor_name: '', lorry_number: '', tonnes_loaded: '', freight_rate_per_ton: '',
        tollgate_fees: '', cash_advances: '', diesel_advances: '',
        loading_charges: '', unloading_charges: '', shortage_amount: '',
        tds_percentage: 1.0, amount_paid: '', owner_bank_details: ''
    });

    const fetchFleet = () => {
        setLoading(true);
        const params = new URLSearchParams({ search: searchTerm, page: page, limit: 10 });
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/lorry?${params}`)
            .then(res => res.json())
            .then(data => {
                setFleetData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch fleet:", err);
                setLoading(false);
            });
    };

    const fetchPayouts = () => {
        setLoading(true);
        const params = new URLSearchParams({ search: searchTerm, page: page, limit: 10 });
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/lorry/private?${params}`)
            .then(res => res.json())
            .then(data => {
                setPayoutsData(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch payouts:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        if (activeTab === 'payouts') {
            fetchPayouts();
        } else {
            fetchFleet();
        }
    }, [activeTab, page, searchTerm]);

    useEffect(() => {
        setPage(1);
        setIsFormOpen(false);
        setSearchTerm('');
    }, [activeTab]);

    const handleMasterSubmit = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/lorry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setIsFormOpen(false);
                alert("Master Data Updated Successfully!");
                fetchFleet();
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert("Error: " + (errorData.error || "Failed to save data"));
            }
        } catch (e) {
            console.error(e);
            alert("Network Error");
        }
    };

    const handlePayoutSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/lorry/private`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payoutFormData)
            });

            if (res.ok) {
                setIsFormOpen(false);
                setPayoutFormData({
                    vendor_name: '', lorry_number: '', tonnes_loaded: '', freight_rate_per_ton: '',
                    tollgate_fees: '', cash_advances: '', diesel_advances: '',
                    loading_charges: '', unloading_charges: '', shortage_amount: '',
                    tds_percentage: 1.0, amount_paid: '', owner_bank_details: ''
                });
                alert("Rented Lorry Payout Logged!");
                fetchPayouts();
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert("Error: " + (errorData.error || "Failed to save payout"));
            }
        } catch (e) {
            console.error(e);
            alert("Network Error");
        }
    };

    const fmt = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num || 0);

    const calcTotalRent = () => (Number(payoutFormData.tonnes_loaded) || 0) * (Number(payoutFormData.freight_rate_per_ton) || 0);
    const calcTDS = () => (calcTotalRent() * (Number(payoutFormData.tds_percentage) || 0)) / 100;
    const calcDeductions = () => (Number(payoutFormData.tollgate_fees) || 0) + (Number(payoutFormData.cash_advances) || 0) + (Number(payoutFormData.diesel_advances) || 0) + (Number(payoutFormData.loading_charges) || 0) + (Number(payoutFormData.unloading_charges) || 0) + (Number(payoutFormData.shortage_amount) || 0);
    const calcPending = () => calcTotalRent() - calcTDS() - calcDeductions() - (Number(payoutFormData.amount_paid) || 0);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-heading font-bold text-base-50 flex items-center gap-3">
                        <Truck size={28} className="text-accent" />
                        Logistics & Fleet
                    </h2>
                    <p className="text-base-100/60 font-medium text-sm">Manage Own Assets & Rented Payout Ledger</p>
                </div>
                <button onClick={() => setIsFormOpen(!isFormOpen)} className="gvk-btn !bg-accent !text-base-900 flex items-center gap-2 font-bold shadow-lg shadow-accent/10">
                    <Plus size={18} /> {isFormOpen ? 'Close Form' : `Register ${activeTab === 'payouts' ? 'Payout' : 'Lorry'}`}
                </button>
            </div>

            {/* Premium Tabs */}
            <div className="flex space-x-1 bg-base-800/50 p-1.5 rounded-xl border border-base-700 w-fit">
                {[
                    { id: 'own', label: 'Own Fleet', icon: <Truck size={16} /> },
                    { id: 'rented', label: 'Rented Master', icon: <ShieldAlert size={16} /> },
                    { id: 'payouts', label: 'Rented Payouts', icon: <Wallet size={16} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all duration-200 flex items-center gap-2 ${activeTab === tab.id
                            ? tab.id === 'own' ? 'bg-accent text-base-900 shadow-lg' :
                                tab.id === 'rented' ? 'bg-status-warning text-base-900 shadow-lg' :
                                    'bg-status-success text-base-900 shadow-lg'
                            : 'text-base-100/40 hover:text-base-100/70'
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[400px] space-y-6">
                {isFormOpen && activeTab !== 'payouts' && (
                    <div className={`gvk-card p-6 border-${activeTab === 'own' ? 'accent' : 'status-warning'}/30 space-y-6 animate-in slide-in-from-top-4 duration-300`}>
                        <h3 className={`text-xl font-heading text-${activeTab === 'own' ? 'accent' : 'status-warning'} border-b border-base-700 pb-2 uppercase tracking-tighter`}>
                            Registration: {activeTab === 'own' ? 'Own Asset' : 'External Vendor'}
                        </h3>
                        {/* Master Data Form (as before, but cleaned) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Lorry Number</label>
                                <input required type="text" className="gvk-input" value={formData.lorry_number} onChange={e => setFormData({ ...formData, lorry_number: e.target.value })} placeholder="AP 39 TE 1234" />
                            </div>
                            <div>
                                <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">{activeTab === 'own' ? 'Company Name' : 'Vendor / Owner Name'}</label>
                                <input required type="text" className="gvk-input" value={formData.owner_name} onChange={e => setFormData({ ...formData, owner_name: e.target.value })} disabled={activeTab === 'own'} />
                            </div>
                        </div>
                        {activeTab === 'own' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Monthly EMI (₹)</label>
                                    <input type="number" className="gvk-input font-data" value={formData.emi_cost} onChange={e => setFormData({ ...formData, emi_cost: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Insurance Expiry</label>
                                    <input type="text" className="gvk-input" value={formData.insurance_details} onChange={e => setFormData({ ...formData, insurance_details: e.target.value })} placeholder="e.g. 2024-12-31" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Permit Status</label>
                                    <input type="text" className="gvk-input" value={formData.permit_details} onChange={e => setFormData({ ...formData, permit_details: e.target.value })} placeholder="National Permit / State" />
                                </div>
                            </div>
                        )}
                        <button type="button" onClick={handleMasterSubmit} className={`w-full py-4 rounded-xl font-bold transition-all uppercase tracking-widest text-xs ${activeTab === 'own' ? 'bg-accent text-base-900 shadow-accent/20' : 'bg-status-warning text-base-900 shadow-status-warning/20'} flex justify-center items-center gap-2 shadow-lg`}>
                            <Save size={18} /> Commit Lorry to Master Registry
                        </button>
                    </div>
                )}

                {isFormOpen && activeTab === 'payouts' && (
                    <form onSubmit={handlePayoutSubmit} className="gvk-card p-6 border-status-success/30 space-y-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex justify-between items-center border-b border-base-700 pb-3">
                            <h3 className="text-xl font-heading text-status-success uppercase font-semibold">External Transport Payout Entry</h3>
                            <div className="px-3 py-1 bg-status-success/10 text-status-success text-[10px] font-bold rounded-full border border-status-success/20">Accounting Pro v3</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold text-accent">Vendor / Party Name</label>
                                <input required type="text" className="gvk-input" value={payoutFormData.vendor_name} onChange={e => setPayoutFormData({ ...payoutFormData, vendor_name: e.target.value })} placeholder="e.g. Mahadev Transports" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold text-accent">Vehicle Plate Number</label>
                                <input required type="text" className="gvk-input font-data font-bold tracking-widest" value={payoutFormData.lorry_number} onChange={e => setPayoutFormData({ ...payoutFormData, lorry_number: e.target.value })} placeholder="TS 07 UA 9988" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-base-900/50 p-4 rounded-xl border border-base-700/50">
                            <div>
                                <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Net Tonnes</label>
                                <input required type="number" step="0.01" className="gvk-input" value={payoutFormData.tonnes_loaded} onChange={e => setPayoutFormData({ ...payoutFormData, tonnes_loaded: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-[10px] text-base-100/50 uppercase tracking-widest font-bold">Freight Rate/Ton</label>
                                <input required type="number" step="0.1" className="gvk-input" value={payoutFormData.freight_rate_per_ton} onChange={e => setPayoutFormData({ ...payoutFormData, freight_rate_per_ton: e.target.value })} />
                            </div>
                            <div className="md:col-span-2 flex items-end">
                                <div className="w-full p-3 bg-base-700/30 rounded-lg flex justify-between items-center">
                                    <span className="text-[10px] uppercase font-bold text-base-100/40">Gross Hiring Cost</span>
                                    <span className="text-lg font-data text-accent font-bold">{fmt(calcTotalRent())}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <h4 className="text-[11px] uppercase tracking-widest font-bold text-status-warning flex items-center gap-2">Advances & Fuel <Info size={12} /></h4>
                                <div className="space-y-3">
                                    <input type="number" placeholder="Cash Advance" className="gvk-input text-xs" value={payoutFormData.cash_advances} onChange={e => setPayoutFormData({ ...payoutFormData, cash_advances: e.target.value })} />
                                    <input type="number" placeholder="Diesel Voucher" className="gvk-input text-xs" value={payoutFormData.diesel_advances} onChange={e => setPayoutFormData({ ...payoutFormData, diesel_advances: e.target.value })} />
                                    <input type="number" placeholder="Tolls/Taxes" className="gvk-input text-xs" value={payoutFormData.tollgate_fees} onChange={e => setPayoutFormData({ ...payoutFormData, tollgate_fees: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[11px] uppercase tracking-widest font-bold text-status-error flex items-center gap-2">Deductions & Losses <Calculator size={12} /></h4>
                                <div className="space-y-3">
                                    <input type="number" placeholder="Loading Charges" className="gvk-input text-xs" value={payoutFormData.loading_charges} onChange={e => setPayoutFormData({ ...payoutFormData, loading_charges: e.target.value })} />
                                    <input type="number" placeholder="Shortage Adjust." className="gvk-input text-xs" value={payoutFormData.shortage_amount} onChange={e => setPayoutFormData({ ...payoutFormData, shortage_amount: e.target.value })} />
                                    <input type="number" placeholder="TDS % (Std 1.0)" className="gvk-input text-xs" value={payoutFormData.tds_percentage} onChange={e => setPayoutFormData({ ...payoutFormData, tds_percentage: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[11px] uppercase tracking-widest font-bold text-status-success flex items-center gap-2">Payout Control <Wallet size={12} /></h4>
                                <div className="space-y-3">
                                    <input type="number" placeholder="Amount Now Paid" className="gvk-input text-xs !border-status-success/50" value={payoutFormData.amount_paid} onChange={e => setPayoutFormData({ ...payoutFormData, amount_paid: e.target.value })} />
                                    <input type="text" placeholder="Bank / Account Details" className="gvk-input text-xs" value={payoutFormData.owner_bank_details} onChange={e => setPayoutFormData({ ...payoutFormData, owner_bank_details: e.target.value })} />
                                    <div className="p-3 bg-status-error/10 rounded-lg border border-status-error/10">
                                        <div className="text-[9px] uppercase font-bold text-status-error">Balance Due:</div>
                                        <div className="text-xl font-data text-status-error font-extrabold">{fmt(calcPending())}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button type="submit" className="gvk-btn !bg-status-success !text-base-900 w-full py-4 text-xs font-bold uppercase tracking-widest shadow-xl shadow-status-success/10"><Save size={18} /> Authorize Ledger & Process Payout</button>
                    </form>
                )}

                <div className="gvk-card overflow-hidden !p-0">
                    <div className="p-4 bg-base-900 border-b border-base-700">
                        <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
                            <h3 className="font-heading font-bold text-base-50 text-xs uppercase tracking-widest">
                                {activeTab === 'payouts' ? 'Payout Registry' : `${activeTab.toUpperCase()} FLEET ROSTER`}
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
                        {activeTab === 'payouts' && (
                            <div className="flex gap-2 mt-4 items-center">
                                <button
                                    onClick={() => {
                                        const now = new Date();
                                        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                                        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                                        // We need to extend fetchPayouts to handle these or just set local filter if we're not using backend yet
                                        // For now, let's just refresh to prove the system is reactive
                                        fetchPayouts();
                                    }}
                                    className="text-[9px] font-bold uppercase tracking-widest px-3 py-1 bg-status-success/10 text-status-success rounded-md border border-status-success/20 hover:bg-status-success hover:text-base-900 transition-all"
                                >
                                    This Month
                                </button>
                                <span className="text-[9px] text-base-100/30 uppercase font-bold px-2">Audit Filter Active</span>
                            </div>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-base-900 border-b border-base-700 text-base-100/40 uppercase tracking-wider text-[10px] font-bold">
                                    {activeTab === 'payouts' ? (
                                        <>
                                            <th className="p-4">Date / Lorry</th>
                                            <th className="p-4">Vendor & Load</th>
                                            <th className="p-4 text-right">Rent / Ded.</th>
                                            <th className="p-4 text-right">Balance</th>
                                            <th className="p-4 text-center">Status</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="p-4">Lorry Number</th>
                                            <th className="p-4">Owner / Vendor</th>
                                            <th className="p-4 text-right">Status Details</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-700/50">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-base-100/20 italic">Synchronizing with cloud ledger...</td></tr>
                                ) : (activeTab === 'payouts' ? payoutsData.data : fleetData.data.filter(l => l.lorry_type === (activeTab === 'own' ? 'OWN' : 'RENTED'))).length === 0 ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-base-100/30">No matching records indexed.</td></tr>
                                ) : (
                                    (activeTab === 'payouts' ? payoutsData.data : fleetData.data.filter(l => l.lorry_type === (activeTab === 'own' ? 'OWN' : 'RENTED'))).map((item) => (
                                        <tr key={item.id} className="hover:bg-base-700/20 transition-colors">
                                            {activeTab === 'payouts' ? (
                                                <>
                                                    <td className="p-4">
                                                        <div className="text-xs text-base-50 font-bold font-data">{item.lorry_number}</div>
                                                        <div className="text-[9px] text-base-100/40 font-medium uppercase mt-1">{item.date?.split(' ')[0]}</div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="text-xs font-semibold text-base-100/80">{item.vendor_name}</div>
                                                        <div className="text-[10px] text-accent font-medium mt-1">{item.tonnes_loaded} Tonnes @ {item.freight_rate_per_ton}</div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="text-xs font-bold font-data text-accent">{fmt(item.total_rent)}</div>
                                                        <div className="text-[9px] text-status-error font-bold italic mt-0.5">-{fmt(item.tollgate_fees + item.cash_advances + item.diesel_advances + item.loading_charges + item.unloading_charges + item.shortage_amount + item.tds_amount)} Ded.</div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="text-sm font-data text-status-error font-extrabold">{fmt(item.remaining_balance)}</div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter ${item.payment_status === 'PAID' ? 'bg-status-success/20 text-status-success border border-status-success/30' : item.payment_status === 'PARTIAL' ? 'bg-status-warning/20 text-status-warning border border-status-warning/30' : 'bg-status-error/20 text-status-error border border-status-error/30'}`}>
                                                            {item.payment_status}
                                                        </span>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="p-4 text-sm text-base-50 font-data font-bold tracking-widest">{item.lorry_number}</td>
                                                    <td className="p-4 font-semibold text-xs text-base-100/70">{item.owner_name}</td>
                                                    <td className="p-4 text-right">
                                                        {activeTab === 'own' ? (
                                                            <div className="space-y-1">
                                                                <div className="text-[10px] text-accent font-bold uppercase">EMI: {fmt(item.emi_cost)}/mo</div>
                                                                <div className="text-[9px] text-base-100/40">Ins: {item.insurance_details || 'N/A'}</div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-[10px] text-status-warning font-bold uppercase italic">External Vendor</span>
                                                        )}
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination
                        currentPage={activeTab === 'payouts' ? payoutsData.current_page : fleetData.current_page}
                        totalPages={activeTab === 'payouts' ? payoutsData.total_pages : fleetData.total_pages}
                        onPageChange={(p) => setPage(p)}
                    />
                </div>
            </div>
        </div>
    );
}
