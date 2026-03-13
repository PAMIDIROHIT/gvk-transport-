import React, { useState, useEffect } from 'react';
import { TrendingUp, Truck, Package, Factory, AlertCircle, CreditCard, DollarSign } from 'lucide-react';

export default function Dashboard() {
    const [metrics, setMetrics] = useState({
        total_purchases: 0,
        total_sales: 0,
        total_pending_payments: 0,
        net_profit: 0,
        vehicle_expense_summary: 0
    });

    const [loading, setLoading] = useState(true);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        // Fetch Summary Metrics
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/dashboard/summary`)
            .then(res => res.json())
            .then(data => {
                setMetrics(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));

        // Fetch Financial Alerts
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/dashboard/alerts`)
            .then(res => res.json())
            .then(data => setAlerts(data))
            .catch(e => console.error("Alerts Error:", e));
    }, []);

    const fmt = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num || 0);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-heading font-bold text-base-50">Business Overview</h2>
                    <p className="text-base-100/60 font-medium">Real-time intelligent metrics for GVK Transport v2</p>
                </div>
                <select className="gvk-input !w-auto bg-base-800 border-base-700 font-semibold cursor-pointer">
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                    <option value="all">All Time</option>
                </select>
            </div>

            {alerts.length > 0 && (
                <div className="bg-status-warning/10 border border-status-warning/30 rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-status-warning font-bold flex items-center gap-2 uppercase tracking-widest text-sm">
                        <AlertCircle size={18} /> Action Required Issues
                    </h3>
                    <div className="space-y-2">
                        {alerts.map(alert => (
                            <div key={alert.id} className="flex items-center gap-3 bg-base-900/50 p-3 rounded border border-base-700">
                                <span className={`w - 2 h - 2 rounded - full ${alert.type === 'error' ? 'bg-status-error animate-pulse' : 'bg-status-warning'}`}></span>
                                <div>
                                    <div className="font-semibold text-base-50 text-sm">{alert.title}</div>
                                    <div className="text-base-100/60 text-xs">{alert.message}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="text-center py-20 animate-pulse text-base-100/50">Aggregating live data...</div>
            ) : (
                <>
                    {/* Top Level Financials */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="gvk-card p-6 border-accent/20 bg-gradient-to-br from-base-800 to-base-900 border space-y-2 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity"><Package size={80} /></div>
                            <div className="text-xs uppercase tracking-widest text-base-100/50 font-semibold">Total Purchases (Mines)</div>
                            <div className="text-3xl font-data font-bold text-base-50 tabular-nums">{fmt(metrics.total_purchases)}</div>
                        </div>

                        <div className="gvk-card p-6 border-accent/20 bg-gradient-to-br from-base-800 to-base-900 border space-y-2 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity"><Factory size={80} /></div>
                            <div className="text-xs uppercase tracking-widest text-base-100/50 font-semibold">Total Sales (Factory)</div>
                            <div className="text-3xl font-data font-bold text-base-50 tabular-nums">{fmt(metrics.total_sales)}</div>
                        </div>

                        <div className="gvk-card p-6 border-status-success/40 bg-status-success/10 space-y-2 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><TrendingUp size={80} /></div>
                            <div className="text-xs uppercase tracking-widest font-semibold flex items-center gap-2"><CreditCard size={14} /> Est. Gross Margin</div>
                            <div className="text-4xl font-data font-bold text-status-success tabular-nums">{fmt(metrics.net_profit)}</div>
                            <div className="text-[10px] text-base-100/40 uppercase tracking-widest">Calculated before operational expenses</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Pending Approvals / Accounts Receivable */}
                        <div className="gvk-card p-6 border-status-error/30 bg-status-error/5 flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-status-error"><AlertCircle size={100} /></div>
                            <div className="flex items-center gap-3 text-status-error/80 uppercase font-semibold text-sm tracking-widest mb-2">
                                <AlertCircle size={18} /> Accounts Receivable (Pending)
                            </div>
                            <div className="text-4xl font-data font-bold text-status-error tabular-nums">{fmt(metrics.total_pending_payments)}</div>
                            <div className="text-xs mt-2 text-status-error/60 font-medium tracking-wide">Money stuck in factory payments or unpaid invoices.</div>
                        </div>

                        {/* Vehicle Expense Rollup */}
                        <div className="gvk-card p-6 border-status-warning/30 bg-status-warning/5 flex flex-col justify-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-status-warning"><Truck size={100} /></div>
                            <div className="flex items-center gap-3 text-status-warning/80 uppercase font-semibold text-sm tracking-widest mb-2">
                                <DollarSign size={18} /> Fleet Operating Expenses
                            </div>
                            <div className="text-4xl font-data font-bold text-status-warning tabular-nums">{fmt(metrics.vehicle_expense_summary)}</div>
                            <div className="text-xs mt-2 text-status-warning/60 font-medium tracking-wide">Aggregated fuel, driver wages, maintenance, and rented brokers.</div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
