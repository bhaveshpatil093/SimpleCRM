
import React, { useState } from 'react';
import { useCRMStore } from '../lib/store';
import { useAuth } from '../lib/auth';
import { User, UserRole } from '../types';
import {
    Users,
    UserPlus,
    Trash2,
    Search,
    Shield,
    Briefcase,
    Mail,
    Phone,
    MoreVertical,
    X,
    Check,
    ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TeamManagement: React.FC = () => {
    const { users, addUser, deleteUser, userProfile } = useCRMStore();
    const { user: currentUser } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter users based on search
    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteUser = (email: string) => {
        if (email === currentUser?.email) {
            alert("You cannot delete yourself.");
            return;
        }
        if (confirm(`Are you sure you want to remove ${email}?`)) {
            deleteUser(email);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white">Team Management</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your team members and their access permissions.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                    <UserPlus size={20} />
                    <span>Add Member</span>
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Toolbar */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search team members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
                        />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <Users size={16} />
                        <span>{users.length} Active Members</span>
                    </div>
                </div>

                {/* Users List */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-xs uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                                <th className="p-6">Member</th>
                                <th className="p-6">Role</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredUsers.map((user) => (
                                <tr key={user.email} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-2xl object-cover shadow-sm bg-slate-100" />
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                    <Mail size={12} />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${user.role === 'Owner' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' :
                                                user.role === 'Manager' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' :
                                                    'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300'
                                            }`}>
                                            {user.role === 'Owner' && <ShieldAlert size={14} />}
                                            {user.role === 'Manager' && <Shield size={14} />}
                                            {user.role === 'Sales' && <Briefcase size={14} />}
                                            {user.role}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 animate-pulse"></div>
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Active</span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-right">
                                        {user.role !== 'Owner' && currentUser?.role === 'Owner' && (
                                            <button
                                                onClick={() => handleDeleteUser(user.email)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                title="Remove User"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                        <Users size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-bold">No members found</p>
                        <p className="text-sm">Try searching for a different name or email.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isAddModalOpen && (
                    <AddUserModal onClose={() => setIsAddModalOpen(false)} onAdd={(u) => addUser(u)} />
                )}
            </AnimatePresence>
        </div>
    );
};

interface AddUserModalProps {
    onClose: () => void;
    onAdd: (user: User) => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'Sales' as UserRole,
        password: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            ...formData,
            avatar: `https://i.pravatar.cc/150?u=${formData.email}`, // Generate deterministic avatar
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden"
            >
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl">
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-heading font-bold dark:text-white">Add Team Member</h2>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Expand your workforce</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative group">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                required
                                className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-900 dark:text-white"
                                placeholder="e.g. Rahul Sharma"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    required
                                    type="email"
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-900 dark:text-white"
                                    placeholder="rahul@business.com"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Role</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                <select
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 appearance-none font-bold text-slate-900 dark:text-white cursor-pointer"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                                >
                                    <option value="Sales">Sales Agent</option>
                                    <option value="Manager">Manager</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Temporary Password</label>
                        <input
                            required
                            type="text"
                            className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm text-slate-900 dark:text-white"
                            placeholder="Enter temporary password..."
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                        <p className="text-[10px] text-slate-400 ml-1 font-medium">Ideally, the user would receive an invitation email to set this.</p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/25 hover:bg-blue-700 active:scale-95 transition-all"
                        >
                            Create Account
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default TeamManagement;
