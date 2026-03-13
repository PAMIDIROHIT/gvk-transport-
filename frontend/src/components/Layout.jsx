import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, LogOut, Truck, Package, Factory, FileText, CreditCard } from 'lucide-react';

const navItems = [
    { path: '/', name: 'Dashboard', icon: <Home size={20} /> },
    { path: '/mine', name: 'Mine Ops', icon: <Package size={20} /> },
    { path: '/factory', name: 'Factory Sales', icon: <Factory size={20} /> },
    { path: '/lorries', name: 'Transport', icon: <Truck size={20} /> },
    { path: '/expenses', name: 'Expenses', icon: <CreditCard size={20} /> },
    { path: '/reports', name: 'Reports', icon: <FileText size={20} /> },
];

export default function Layout() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-base-900 flex flex-col md:flex-row font-body">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 bg-base-800 border-r border-base-700 hidden md:flex flex-col">
                <div className="p-6 border-b border-base-700">
                    <h1 className="text-2xl font-heading font-bold text-accent tracking-wider">GVK</h1>
                    <p className="text-base-100 text-sm tracking-widest uppercase opacity-70">Transport</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-accent/10 border border-accent/20 text-accent'
                                    : 'text-base-100 hover:bg-base-700'
                                }`
                            }
                        >
                            {item.icon}
                            <span className="font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-base-700">
                    <div className="mb-4 text-xs tracking-wider text-base-100/50 uppercase">
                        Logged in as: <span className="text-accent font-bold">{user?.role}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 text-status-error hover:bg-status-error/10 w-full px-4 py-2 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Topbar */}
            <header className="md:hidden bg-base-800 border-b border-base-700 p-4 flex justify-between items-center sticky top-0 z-50">
                <div>
                    <h1 className="text-xl font-heading font-bold text-accent">GVK</h1>
                </div>
                <button onClick={handleLogout} className="text-base-100/70 p-2">
                    <LogOut size={20} />
                </button>
            </header>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 w-full bg-base-800 border-t border-base-700 flex justify-around p-3 z-50 pb-safe">
                {navItems.slice(0, 6).map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-accent' : 'text-base-100/50'}`
                        }
                    >
                        {item.icon}
                    </NavLink>
                ))}
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto mb-20 md:mb-0">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
