
import React, { useState } from 'react';
import { api } from '../lib/api/client';
// No Header for Admin Dashboard

const Admin = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [refresh, setRefresh] = useState(0); // Trigger to reload list

    // Fetch users on load
    React.useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.admin.getUsers();
                setUsers(data);
            } catch (error) {
                console.error("Failed to fetch users");
            }
        };
        fetchUsers();
    }, [refresh]);

    const handleUpgrade = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            await api.admin.upgradeUser(email.trim());
            setMessage(`✅ Success! ${email} upgraded to Premium.`);
            setEmail('');
            setRefresh(prev => prev + 1); // Reload list
        } catch (error) {
            setMessage('❌ Error: ' + (error.response?.data?.message || 'Upgrade failed'));
        } finally {
            setLoading(false);
        }
    };

    const handleDowngrade = async (userEmail) => {
        if (!window.confirm(`Are you sure you want to REVOKE premium from ${userEmail}?`)) return;
        try {
            await api.admin.downgradeUser(userEmail.trim());
            setRefresh(prev => prev + 1);
        } catch (e) { alert("Failed to downgrade"); }
    };

    const handleDelete = async (userEmail) => {
        if (!window.confirm(`⚠️ DANGER: Are you sure you want to DELETE ${userEmail}? This cannot be undone.`)) return;
        try {
            await api.admin.deleteUser(userEmail.trim());
            setRefresh(prev => prev + 1);
        } catch (e) { alert("Failed to delete user"); }
    };

    const getDaysRemaining = (endDate) => {
        if (!endDate) return 0;
        const diff = new Date(endDate) - new Date();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    };

    return (
        <div className="min-h-screen bg-[#0a0f1c] text-white font-sans selection:bg-yellow-500/30">
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8 text-center text-red-500">Admin Control Panel</h1>

                {/* Upgrade Form */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm mb-12">
                    <h2 className="text-xl font-semibold mb-4 text-center">Add Premium User</h2>
                    <form onSubmit={handleUpgrade} className="space-y-4 max-w-lg mx-auto">
                        <div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="user@gmail.com"
                                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${loading
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700'
                                }`}
                        >
                            {loading ? 'Processing...' : 'Activate Premium (30 Days)'}
                        </button>
                    </form>

                    {message && (
                        <div className={`mt-4 p-3 rounded-lg text-sm text-center font-medium ${message.includes('Success') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                            {message}
                        </div>
                    )}
                </div>

                {/* User List */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Active Premium Users ({users.length})
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-gray-400 text-sm border-b border-white/10">
                                    <th className="p-3">Email</th>
                                    <th className="p-3">Expires In</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map(user => {
                                    const daysLeft = getDaysRemaining(user.subscriptionEnd);
                                    return (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-3 font-medium">{user.email}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${daysLeft < 5 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                                    }`}>
                                                    {daysLeft} Days
                                                </span>
                                            </td>
                                            <td className="p-3 text-right space-x-2">
                                                <button
                                                    onClick={() => handleDowngrade(user.email)}
                                                    className="px-3 py-1 text-xs border border-yellow-500/50 text-yellow-500 rounded hover:bg-yellow-500/10"
                                                >
                                                    Revoke
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.email)}
                                                    className="px-3 py-1 text-xs border border-red-500/50 text-red-500 rounded hover:bg-red-500/10"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="p-8 text-center text-gray-500">
                                            No premium users yet. Add one above!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;
