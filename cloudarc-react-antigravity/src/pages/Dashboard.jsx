import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardHome from './dashboard/DashboardHome';
import KanbanBoard from './dashboard/KanbanBoard';
import MenuManagement from './dashboard/MenuManagement';
import TeamManagement from './dashboard/TeamManagement';
import Analytics from './dashboard/Analytics';
import Settings from './dashboard/Settings';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="dashboard-layout">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
      />
      
      <div className={`dashboard-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/orders" element={<KanbanBoard />} />
          <Route path="/menu" element={<MenuManagement />} />
          <Route path="/team" element={<TeamManagement />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
