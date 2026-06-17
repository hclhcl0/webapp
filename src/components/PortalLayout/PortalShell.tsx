'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Megaphone, Mail, MessageCircle, Users, LogOut, ShieldAlert, Edit, PenTool, User as UserIcon, Activity } from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { href: '/portal/broadcast',  icon: <Megaphone className="w-5 h-5" />, label: 'Gửi Tin Truyền Thông', roles: ['admin', 'moderator', 'editor'] },
  { href: '/portal/salary',     icon: <Mail className="w-5 h-5" />, label: 'Gửi Tin Nội Bộ',        roles: ['admin', 'moderator'] },
  { href: '/portal/chat',       icon: <MessageCircle className="w-5 h-5" />, label: 'Chat CSKH',             roles: ['admin', 'moderator', 'editor', 'author'] },
  { href: '/portal/followers',  icon: <Users className="w-5 h-5" />, label: 'Người quan tâm OA',     roles: ['admin', 'moderator'] },
];

interface User {
  name?: string;
  email: string;
  role: string;
  department?: string;
}

export default function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { if (data?.user) setUser(data.user); })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/users/logout', { method: 'POST', credentials: 'include' });
    router.push('/portal/login');
  };

  const filteredNav = NAV_ITEMS.filter(item =>
    !user || item.roles.includes(user.role)
  );

  const roleLabel: Record<string, { label: string, icon: React.ReactNode }> = {
    admin: { label: 'Quản trị viên', icon: <ShieldAlert className="w-3 h-3 text-amber-600" /> },
    moderator: { label: 'Kiểm duyệt viên', icon: <ShieldAlert className="w-3 h-3 text-blue-600" /> },
    editor: { label: 'Biên tập viên', icon: <Edit className="w-3 h-3 text-emerald-600" /> },
    author: { label: 'Tác giả', icon: <PenTool className="w-3 h-3 text-indigo-600" /> },
    user: { label: 'Người dùng', icon: <UserIcon className="w-3 h-3 text-slate-600" /> },
  };

  // Nếu là trang login thì không hiển thị shell
  if (pathname === '/portal/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-100">
      {/* Sidebar (Desktop) / Bottom Tab Bar (Mobile) */}
      <aside 
        className={`
          flex-shrink-0 bg-white z-[9999] flex
          fixed bottom-0 left-0 w-full h-16 flex-row items-center border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.1)]
          md:top-0 md:bottom-0 md:h-auto md:flex-col md:border-r md:border-t-0 md:shadow-[4px_0_24px_rgba(0,0,0,0.02)] md:transition-[width] md:duration-300 md:ease-[cubic-bezier(0.4,0,0.2,1)] md:overflow-hidden md:pb-0
          ${sidebarOpen ? 'md:w-[260px]' : 'md:w-[80px]'}
        `}
      >
        {/* Header sidebar (Chỉ hiện trên Desktop) */}
        <div className={`hidden md:flex p-5 ${sidebarOpen ? 'px-5' : 'px-4'} border-b border-slate-100 items-center gap-3`}>
          <div className="w-10 h-10 flex-shrink-0 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(37,99,235,0.3)] bg-gradient-to-br from-blue-500 to-indigo-600">
            <Activity className="w-5 h-5" />
          </div>
          {sidebarOpen && (
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 text-sm whitespace-nowrap overflow-hidden text-ellipsis tracking-tight">
                Cổng nhân viên
              </div>
              <div className="text-slate-500 text-xs font-medium">Zalo OA</div>
            </div>
          )}
        </div>

        {/* Nav (Bottom tabs trên mobile, Sidebar menu trên Desktop) */}
        <nav className="flex-1 w-full h-full px-1 flex flex-row justify-around items-center md:p-3 md:flex-col md:justify-start md:gap-1.5 md:overflow-y-auto">
          {filteredNav.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className="no-underline flex-1 flex justify-center md:flex-none">
                <div 
                  className={`
                    w-full max-w-[80px] flex flex-col items-center justify-center gap-[2px] rounded-xl transition-all duration-200 h-14
                    md:max-w-none md:flex-row md:h-auto md:justify-start
                    ${sidebarOpen ? 'md:px-3 md:py-2.5' : 'md:p-3 md:justify-center'}
                    ${active 
                      ? 'text-blue-600 md:bg-blue-50 md:text-blue-700 md:shadow-[inset_2px_0_0_0_#2563eb]' 
                      : 'text-slate-500 hover:text-slate-900 md:hover:bg-slate-50'
                    }
                  `}
                >
                  <span className={`flex items-center justify-center md:text-xl flex-shrink-0 transition-transform duration-200 ${active ? 'scale-110 md:scale-100 text-blue-600' : 'text-slate-500'}`}>
                    {item.icon}
                  </span>
                  <span className={`text-[10px] md:text-sm whitespace-nowrap ${active ? 'font-semibold md:font-semibold' : 'font-medium'} ${!sidebarOpen ? 'md:hidden' : ''}`}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User info + logout (Chỉ hiện trên Desktop) */}
        <div className="hidden md:block p-4 border-t border-slate-100 bg-white w-full">
          {user && sidebarOpen && (
            <div className="p-3 mb-3 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
              <div className="text-slate-800 font-semibold text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                {user.name || user.email}
              </div>
              <div className="text-slate-500 text-xs mt-1 font-medium flex items-center gap-1">
                {roleLabel[user.role]?.icon}
                {roleLabel[user.role]?.label || user.role}
              </div>
              {user.department && (
                <div className="text-slate-400 text-[0.65rem] mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap uppercase tracking-wider font-semibold">
                  {user.department}
                </div>
              )}
            </div>
          )}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={`
              w-full flex items-center gap-2 rounded-xl text-sm font-medium transition-all duration-200
              ${sidebarOpen ? 'px-3 py-2.5 justify-start' : 'p-3 justify-center'}
              bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-red-600 disabled:opacity-50
            `}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>{loggingOut ? 'Đang xuất...' : 'Đăng xuất'}</span>}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div 
        className={`
          flex-1 flex flex-col min-h-screen
          pb-16 md:pb-0
          md:transition-[margin] md:duration-300 md:ease-[cubic-bezier(0.4,0,0.2,1)]
          ${sidebarOpen ? 'md:ml-[260px]' : 'md:ml-[80px]'}
        `}
      >
        {/* Topbar (Glassmorphism) */}
        <header className="h-16 bg-white/80 backdrop-blur-lg border-b border-slate-200 flex items-center px-4 md:px-6 gap-4 sticky top-0 z-50">
          <button
            onClick={() => setSidebarOpen(p => !p)}
            className="hidden md:block p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-label="Toggle Sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg flex items-center justify-center shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
            <div className="font-semibold text-slate-900 text-sm">Zalo OA</div>
          </div>

          <div className="flex-1" />
          
          {user && (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline-flex bg-white border border-slate-200 shadow-sm rounded-full px-4 py-1.5 text-sm font-medium text-slate-700 items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-slate-400" />
                Chào, {user.name?.split(' ').pop() || user.email.split('@')[0]}
              </span>
              
              {/* Nút Đăng xuất trên Mobile */}
              <button 
                onClick={handleLogout}
                disabled={loggingOut}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-full bg-slate-50 text-slate-600 border border-slate-200 shadow-sm active:scale-95 transition-transform"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </header>

        {/* Page content */}
        <main className="flex-1 px-2 py-4 md:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
