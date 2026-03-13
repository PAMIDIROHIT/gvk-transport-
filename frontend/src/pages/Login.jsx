import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Truck } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        const result = await login(username, password);
        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="min-h-screen bg-base-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">

                {/* Brand Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 mb-4 text-accent">
                        <Truck size={32} />
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-base-50 tracking-tight">GVK Transport</h1>
                    <p className="text-base-100/60 mt-2 font-medium">Logistics & Resource Management</p>
                </div>

                {/* Login Card */}
                <form onSubmit={handleLogin} className="gvk-card space-y-6">
                    {error && (
                        <div className="p-3 bg-status-error/10 border border-status-error/30 text-status-error rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-base-100/70 mb-1">Username</label>
                        <input
                            type="text"
                            className="gvk-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="warner or accountant"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-base-100/70 mb-1">Password</label>
                        <input
                            type="password"
                            className="gvk-input font-data tracking-widest"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button type="submit" className="gvk-btn w-full mt-8">
                        Access System
                    </button>
                </form>

                <p className="text-center text-xs text-base-100/40 mt-8 data-text">
                    V1.0.0 &copy; 2026 GVK Transport
                </p>

            </div>
        </div>
    );
}
