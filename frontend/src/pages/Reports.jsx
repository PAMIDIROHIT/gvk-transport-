import React, { useState, useEffect } from 'react';
import { FileText, Download, Target, Printer, Search } from 'lucide-react';
import Pagination from '../components/Pagination';

export default function Reports() {
    const [salesData, setSalesData] = useState({ data: [], total_pages: 1, current_page: 1 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSales = () => {
        setLoading(true);
        const params = new URLSearchParams({
            page: page,
            limit: 10,
            search: searchTerm
        });
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/factory/sale?${params}`)
            .then(res => res.json())
            .then(data => {
                setSalesData(data);
                setLoading(false);
            })
            .catch(e => {
                console.error("Error fetching sales:", e);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchSales();
    }, [page, searchTerm]);

    const fmt = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num || 0);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-heading font-bold text-base-50 flex items-center gap-3">
                        <FileText size={28} className="text-accent" />
                        Intelligence & Assets
                    </h2>
                    <p className="text-base-100/60 font-medium text-sm">Automated tax reporting and financial data export engine</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a href={`${import.meta.env.VITE_API_BASE_URL}/api/v1/reports/export/mine`} target="_blank" rel="noreferrer" className="gvk-card p-6 border-accent/20 flex items-center gap-6 hover:border-accent transition-all cursor-pointer group bg-gradient-to-br from-base-800 to-base-900 shadow-xl shadow-black/20">
                    <div className="h-16 w-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-base-900 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                        <Download size={32} />
                    </div>
                    <div>
                        <h3 className="font-heading text-lg font-bold text-base-50">Mine Ledger Export</h3>
                        <p className="text-xs text-base-100/50 mt-1 uppercase tracking-tight">CSV formatted for Tally/Excel ingestion</p>
                    </div>
                </a>

                <a href={`${import.meta.env.VITE_API_BASE_URL}/api/v1/reports/export/factory`} target="_blank" rel="noreferrer" className="gvk-card p-6 border-accent/20 flex items-center gap-6 hover:border-accent transition-all cursor-pointer group bg-gradient-to-br from-base-800 to-base-900 shadow-xl shadow-black/20">
                    <div className="h-16 w-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-base-900 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-110">
                        <Target size={32} />
                    </div>
                    <div>
                        <h3 className="font-heading text-lg font-bold text-base-50">Sales Analytics Export</h3>
                        <p className="text-xs text-base-100/50 mt-1 uppercase tracking-tight">Complete sales and tax collection historical data</p>
                    </div>
                </a>
            </div>

            <div className="space-y-4 pt-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-heading font-bold flex items-center gap-2"><Printer className="text-status-warning" /> Print Tax Invoices</h3>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-100/40" size={14} />
                        <input
                            type="text"
                            placeholder="Invoice # or Factory..."
                            className="search-input-fixed !py-1.5 text-xs"
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>

                <div className="gvk-card overflow-hidden !p-0 border-status-warning/10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-base-900 border-b border-base-700 text-base-100/40 uppercase tracking-wider text-[10px] font-bold">
                                    <th className="p-4">Serial / Invoice</th>
                                    <th className="p-4">Entity & Material</th>
                                    <th className="p-4 text-right">Taxable Amount</th>
                                    <th className="p-4 text-center">Documentation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-base-700/50">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-base-100/20 italic">Generating secure cloud links...</td></tr>
                                ) : salesData.data.length === 0 ? (
                                    <tr><td colSpan={5} className="p-12 text-center text-base-100/30">No transaction records found for the selected filter.</td></tr>
                                ) : (
                                    salesData.data.map((s) => (
                                        <tr key={s.id} className="hover:bg-base-700/30 transition-colors group">
                                            <td className="p-4">
                                                <div className="font-data font-black text-status-warning text-sm tracking-tighter">INV-{s.id.toString().padStart(5, '0')}</div>
                                                <div className="text-[10px] text-base-100/40 font-data mt-0.5">{s.date?.split(' ')[0] || '-'}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-bold text-base-50 text-sm group-hover:text-accent transition-colors">{s.factory_name}</div>
                                                <div className="text-[10px] text-base-100/40 uppercase tracking-tight">{s.material_name}</div>
                                            </td>
                                            <td className="p-4 text-right font-data text-accent font-black text-sm tracking-tighter">
                                                {fmt(s.total_sales_amount)}
                                            </td>
                                            <td className="p-4 text-center">
                                                <a href={`${import.meta.env.VITE_API_BASE_URL}/api/v1/reports/invoice/pdf/${s.id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-status-warning/10 text-status-warning hover:bg-status-warning hover:text-base-900 font-bold tracking-widest text-[10px] rounded-lg uppercase transition-all duration-300 border border-status-warning/20 hover:scale-105 active:scale-95 shadow-lg shadow-status-warning/5">
                                                    <Download size={14} /> Download PDF
                                                </a>
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
                        onPageChange={(p) => setPage(p)}
                    />
                </div>
            </div>
        </div>
    );
}
