import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, FileText, CalendarCheck, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const navItems = [
  { path: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { path: '/companies', label: '企業管理', icon: Building2 },
  { path: '/es', label: 'ES管理', icon: FileText },
  { path: '/schedule', label: 'スケジュール', icon: CalendarCheck },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`app-sidebar glass-panel ${isOpen ? '' : 'collapsed'}`}>
      {/* Toggle Button for Desktop */}
      <button 
        onClick={toggle} 
        className="sidebar-toggle-btn glass-panel"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className="sidebar-header">
        <div className="logo-icon glass-panel">JH</div>
        <h2 className="app-title sidebar-logo"><span>JobHub</span></h2>
      </div>

      <nav className="nav-links">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            title={!isOpen ? item.label : undefined}
          >
            <item.icon className="nav-icon" size={24} />
            <span className="nav-title">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-link" title={!isOpen ? '設定' : undefined}>
          <Settings className="nav-icon" size={20} />
          <span className="nav-title">設定</span>
        </button>
        <button className="nav-link text-danger" onClick={handleLogout} title={!isOpen ? 'ログアウト' : undefined}>
          <LogOut className="nav-icon" size={20} />
          <span className="nav-title">ログアウト</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
