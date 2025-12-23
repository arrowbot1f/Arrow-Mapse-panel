"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Search, Plus, Trash2, Copy, Check, Shield,
    Terminal, Activity, Calendar, Globe, Smartphone, Mail
} from "lucide-react";

// Types
import { createLicense, fetchLicenses, removeLicenseAction, toggleBlockAction, logout } from "./actions";

// ... inside Dashboard component ...

// Add logout handler
const handleLogout = async () => {
    await logout();
    // Redirect handled by middleware/client logic usually, but here we can force refresh or use router
    window.location.href = '/login';
};

// ... inside the return JSX, find the Navbar ...

{/* Navbar */ }
<header className="flex items-center justify-between mb-8">
    <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
            <Shield className="w-6 h-6 text-black" />
        </div>
        <div>
            <h1 className="text-2xl font-bold">Arrow Admin</h1>
            <p className="text-zinc-400 text-xs">v3.0.0 Stable</p>
        </div>
    </div>

    <div className="flex items-center gap-4">
        <button onClick={handleLogout} className="text-zinc-500 hover:text-white text-sm font-medium transition-colors">
            Sign Out
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-zinc-400">System Online</span>
        </div>
    </div>
</header>
interface License {
    id: string;
    name: string;
    mobile: string;
    email: string;
    country: string;
    hwid: string;
    key: string;
    expiry: string;
    status: 'Active' | 'Expired' | 'Blocked';
    created: string;
}

export default function Dashboard() {
    const [licenses, setLicenses] = useState<License[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        name: '', mobile: '', email: '', country: 'Egypt', hwid: '', days: '365'
    });
    const [generatedKey, setGeneratedKey] = useState("");
    const [loading, setLoading] = useState(false);

    // Real Data Init
    useEffect(() => {
        fetchLicenses().then(data => setLicenses(data));
    }, []);

    const handleGenerate = async () => {
        setLoading(true);
        // Create FormData for the server action
        const fd = new FormData();
        fd.append('hwid', formData.hwid);
        fd.append('days', formData.days);
        fd.append('name', formData.name);
        fd.append('mobile', formData.mobile);
        fd.append('email', formData.email);
        fd.append('country', formData.country);

        // Simulate delay removed for speed

        const res = await createLicense(fd);
        setLoading(false);

        if (res.success && res.key && res.license) {
            setGeneratedKey(res.key);
            setLicenses(prev => [res.license!, ...prev]);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this license?')) {
            await removeLicenseAction(id);
            setLicenses(prev => prev.filter(l => l.id !== id));
        }
    };

    const handleBlock = async (id: string) => {
        const res = await toggleBlockAction(id);
        if (res.success && res.status) {
            setLicenses(prev => prev.map(l => l.id === id ? { ...l, status: res.status as any } : l));
        }
    };

    const handleEdit = (license: License) => {
        setFormData({
            name: license.name,
            mobile: license.mobile,
            email: license.email,
            country: license.country,
            hwid: license.hwid,
            days: '365' // Default reset or calc diff
        });
        setGeneratedKey(license.key); // Show current key
        setShowModal(true);
    };

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const filteredLicenses = licenses.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.mobile.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-green-500/30">

            {/* Navbar */}
            <nav className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center text-black font-bold shrink-0">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
                            <span className="font-bold tracking-tight text-lg">ARROW <span className="text-green-500">MAPSE</span></span>
                            <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-zinc-800 text-[10px] text-zinc-400 font-mono border border-zinc-700">ADMIN v2.0</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-medium text-zinc-400">System Online</span>
                        </div>
                        <button onClick={handleLogout} className="text-zinc-500 hover:text-white text-xs md:text-sm font-medium transition-colors">
                            Sign Out
                        </button>
                    </div>
                </div>
            </nav>

            {/* Check for Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="w-full max-w-4xl bg-[#111] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row my-auto"
                        >
                            {/* Left Side: Form */}
                            <div className="flex-1 p-6 md:p-8 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Plus className="w-5 h-5 text-green-500" /> New License
                                    </h2>
                                    <button onClick={() => setShowModal(false)} className="bg-zinc-900 w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors">✕</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500 font-mono ml-1">CLIENT NAME</label>
                                        <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:border-green-500/50 focus:outline-none transition-colors" placeholder="e.g. Ahmed Ali" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500 font-mono ml-1">MOBILE</label>
                                        <input value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:border-green-500/50 focus:outline-none transition-colors" placeholder="+20..." />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500 font-mono ml-1">EMAIL</label>
                                        <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:border-green-500/50 focus:outline-none transition-colors" placeholder="Optional" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-zinc-500 font-mono ml-1">COUNTRY</label>
                                        <select value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm focus:border-green-500/50 focus:outline-none transition-colors appearance-none">
                                            <option>Egypt</option>
                                            <option>Saudi Arabia</option>
                                            <option>UAE</option>
                                            <option>Global</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-green-500 font-bold font-mono ml-1">HARDWARE ID (REQ_KEY)</label>
                                    <div className="relative">
                                        <Terminal className="absolute left-3 top-3 w-4 h-4 text-zinc-600" />
                                        <input value={formData.hwid} onChange={e => setFormData({ ...formData, hwid: e.target.value })} className="w-full bg-black border border-green-900/30 rounded-lg pl-10 pr-4 py-3 text-sm font-mono text-green-400 placeholder:text-zinc-800 focus:border-green-500 focus:outline-none transition-colors" placeholder="Paste Client HWID here..." />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-zinc-500 font-mono ml-1">DURATION</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['30', '90', '365', '3650'].map(d => (
                                            <button
                                                key={d}
                                                onClick={() => setFormData({ ...formData, days: d })}
                                                className={`py-2 rounded-lg text-[10px] md:text-xs font-bold border transition-all ${formData.days === d ? 'bg-green-500 border-green-500 text-black' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                                            >
                                                {d === '365' ? '1 Year' : d === '3650' ? 'Lifetime' : `${d} Days`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button onClick={handleGenerate} disabled={loading || !formData.hwid || !formData.name} className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
                                    {loading && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />}
                                    GENERATE LICENSE
                                </button>
                            </div>

                            {/* Right Side: Result */}
                            <div className="w-full md:w-80 bg-zinc-950 border-t md:border-t-0 md:border-l border-zinc-800 p-8 flex flex-col justify-center relative overflow-hidden min-h-[200px]">
                                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

                                {!generatedKey ? (
                                    <div className="text-center text-zinc-600">
                                        <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="text-xs uppercase tracking-widest">Ready to Generate</p>
                                    </div>
                                ) : (
                                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6 relative z-10">
                                        <div className="text-center">
                                            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                                                <Check className="w-6 h-6 text-green-500" />
                                            </div>
                                            <h3 className="text-white font-bold">Success!</h3>
                                            <p className="text-xs text-zinc-500">License Generated</p>
                                        </div>

                                        <div onClick={() => copyToClipboard(generatedKey)} className="bg-black border border-green-500/30 rounded-xl p-4 cursor-pointer hover:border-green-500 transition-colors group">
                                            <label className="text-[10px] text-zinc-500 mb-1 block">ACTIVATION KEY</label>
                                            <p className="text-green-400 font-mono text-sm break-all leading-relaxed group-hover:text-green-300 transition-colors">
                                                {generatedKey}
                                            </p>
                                            <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-zinc-600 group-hover:text-green-500">
                                                <Copy className="w-3 h-3" /> Click to Copy
                                            </div>
                                        </div>

                                        <div className="bg-zinc-900 rounded-lg p-3 space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-zinc-500">Expiry</span>
                                                <span className="text-white font-mono">{new Date(new Date().setDate(new Date().getDate() + parseInt(formData.days))).toISOString().split('T')[0]}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-zinc-500">Type</span>
                                                <span className="text-white">Premium</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">

                {/* Header Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">License Management</h1>
                        <p className="text-zinc-400 text-sm">Manage, track, and generate user licenses.</p>
                    </div>
                    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search users..."
                                className="bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-zinc-700 w-full md:w-64 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => { setGeneratedKey(''); setShowModal(true); }}
                            className="bg-white hover:bg-zinc-200 text-black px-5 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add License
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
                    <div className="bg-zinc-900/50 border border-zinc-800 p-4 md:p-5 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-zinc-500 text-[10px] md:text-xs font-mono uppercase">Total Licenses</p>
                            <p className="text-xl md:text-2xl font-bold text-white mt-1">{licenses.length}</p>
                        </div>
                        <Activity className="w-6 h-6 md:w-8 md:h-8 text-zinc-700" />
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 p-4 md:p-5 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-zinc-500 text-[10px] md:text-xs font-mono uppercase">Active Now</p>
                            <p className="text-xl md:text-2xl font-bold text-green-500 mt-1">{licenses.filter(l => l.status === 'Active').length}</p>
                        </div>
                        <Shield className="w-6 h-6 md:w-8 md:h-8 text-green-900/50" />
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 p-4 md:p-5 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-zinc-500 text-[10px] md:text-xs font-mono uppercase">Expired</p>
                            <p className="text-xl md:text-2xl font-bold text-red-500 mt-1">{licenses.filter(l => l.status === 'Expired').length}</p>
                        </div>
                        <Trash2 className="w-6 h-6 md:w-8 md:h-8 text-red-900/50" />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-zinc-900/80 border-b border-zinc-800">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-mono text-zinc-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-mono text-zinc-500 uppercase">User Info</th>
                                    <th className="px-6 py-4 text-xs font-mono text-zinc-500 uppercase hidden md:table-cell">Contact</th>
                                    <th className="px-6 py-4 text-xs font-mono text-zinc-500 uppercase hidden sm:table-cell">Hardware ID</th>
                                    <th className="px-6 py-4 text-xs font-mono text-zinc-500 uppercase hidden lg:table-cell">Expiry</th>
                                    <th className="px-6 py-4 text-xs font-mono text-zinc-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50">
                                {filteredLicenses.map((license) => (
                                    <motion.tr
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        key={license.id}
                                        className="hover:bg-zinc-900/50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${license.status === 'Active'
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${license.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                {license.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                                                    {license.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white text-sm">{license.name}</p>
                                                    <p className="text-xs text-zinc-500 flex items-center gap-1"><Globe className="w-3 h-3" /> {license.country}</p>
                                                    {/* Mobile fallback for hidden cols */}
                                                    <p className="text-[10px] text-zinc-600 md:hidden mt-0.5">{license.mobile}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <div className="space-y-1">
                                                <p className="text-xs text-zinc-400 flex items-center gap-2"><Smartphone className="w-3 h-3" /> {license.mobile}</p>
                                                <p className="text-xs text-zinc-500 flex items-center gap-2"><Mail className="w-3 h-3" /> {license.email || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell">
                                            <div className="flex items-center gap-2">
                                                <code className="bg-black px-2 py-1 rounded text-[10px] font-mono text-zinc-400 border border-zinc-800">
                                                    {license.hwid.substring(0, 12)}...
                                                </code>
                                                <button onClick={() => copyToClipboard(license.hwid)} className="text-zinc-600 hover:text-white"><Copy className="w-3 h-3" /></button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <p className="text-sm text-zinc-300 font-mono">{license.expiry}</p>
                                            <p className="text-[10px] text-zinc-600">Created: {license.created}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => handleBlock(license.id)} className={`transition-colors p-2 rounded-lg ${license.status === 'Blocked' ? 'text-green-500 hover:bg-green-500/10' : 'text-zinc-500 hover:text-orange-500 hover:bg-orange-500/10'}`} title={license.status === 'Blocked' ? "Unblock" : "Block User"}>
                                                <Shield className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(license.id)} className="text-zinc-500 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg ml-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleEdit(license)} className="text-zinc-500 hover:text-blue-500 transition-colors p-2 hover:bg-blue-500/10 rounded-lg ml-1">
                                                <Terminal className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredLicenses.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900 mb-4">
                                <Search className="w-6 h-6 text-zinc-700" />
                            </div>
                            <h3 className="text-zinc-400 font-medium">No results found</h3>
                            <p className="text-zinc-600 text-sm mt-1">Try adjusting your search or add a new license.</p>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}

