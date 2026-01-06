import { Link, useLocation, Outlet } from 'react-router-dom';
import { UserButton } from "@clerk/clerk-react";
import { LayoutDashboard, Wallet, PiggyBank, PieChart, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from 'react';
import api from '../services/api';

const Layout = () => {
    const { pathname } = useLocation();
    const { getToken } = useAuth();
    const { user, isLoaded } = useUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Sync user with backend on mount
    useEffect(() => {
        const syncUser = async () => {
            // Wait until Clerk has fully loaded the user object
            if (!isLoaded || !user) return;

            const fullName = user.fullName;
            const email = user.primaryEmailAddress?.emailAddress;

            // Ensure we have the required fields before syncing
            if (!fullName || !email) {
                console.warn("Clerk user data incomplete: missing name or email. Delaying sync.");
                return;
            }

            try {
                const token = await getToken();
                if (token) {
                    await api.post('/users/sync', {
                        name: fullName,
                        email: email,
                        clerkId: user.id
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log("User synced successfully with backend.");
                }
            } catch (err) {
                console.error("Failed to sync user", err);
            }
        };
        syncUser();
    }, [user, isLoaded, getToken]);

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Transactions', path: '/transactions', icon: Wallet },
        { name: 'Budgets', path: '/budgets', icon: PieChart },
        { name: 'Savings', path: '/savings', icon: PiggyBank },
    ];

    const NavContent = () => (
        <>
            <div className="p-6 border-b border-border flex items-center gap-3">
                <img src="/logo.svg" alt="BudgetWise Logo" className="w-10 h-10 object-contain rounded-full" />
                <span className="text-lg font-bold tracking-tight">BudgetWise</span>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                            pathname === item.path
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                    </Link>
                ))}

                <div className="pt-4 mt-auto">
                    <div className="flex items-center justify-between px-4">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Theme</span>
                        <ThemeToggle />
                    </div>
                </div>
            </nav>

            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-lg">
                    <UserButton afterSignOutUrl="/" />
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate">
                            {user?.fullName || "User"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                            {user?.primaryEmailAddress?.emailAddress}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Desktop Sidebar */}
            <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
                <NavContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <aside className="relative w-64 bg-card border-r border-border flex flex-col h-full animate-in slide-in-from-left duration-200">
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="absolute right-4 top-4 p-2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <NavContent />
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden relative flex items-center h-16 px-4 bg-card border-b border-border z-10">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -ml-2 text-muted-foreground hover:text-foreground"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                        <img src="/logo.svg" alt="BudgetWise Logo" className="w-10 h-10 object-contain rounded-full" />
                        <span className="font-bold text-lg tracking-tight">BudgetWise</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto bg-background/50">
                    <div className="container mx-auto max-w-7xl animate-in fade-in duration-500 p-4 md:p-8">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
