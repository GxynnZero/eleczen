"use client";

import { useState, useEffect } from "react";
import { Loader2, User, Shield, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { AdminService } from "@/services/admin";

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await AdminService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error(error);
            toast.error("Could not load users");
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
                    <p className="text-gray-400">View and manage platform users</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-blue w-64"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-neon-blue animate-spin" />
                </div>
            ) : (
                <div className="glass-panel rounded-xl overflow-hidden border border-white/10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gray-700 flex-shrink-0 overflow-hidden">
                                                    {user.image ? (
                                                        <img
                                                            className="h-10 w-10 object-cover"
                                                            src={user.image}
                                                            alt=""
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-300 font-bold">
                                                            {user.name[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-white">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-sm text-gray-400">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === "admin"
                                                    ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30"
                                                    : "bg-gray-700 text-gray-300"
                                                    }`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button className="text-gray-400 hover:text-red-400 transition-colors">
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No users found matching your search.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
