import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: 'var(--gray-50)'
    }}>
      <Header toggleSidebar={toggleSidebar} />
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar isOpen={sidebarOpen} closeSidebar={closeSidebar} />
        
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <button 
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 20,
              border: 'none',
              cursor: 'pointer'
            }}
            className="md-hidden"
            onClick={closeSidebar}
            aria-label="Close sidebar"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                closeSidebar();
              }
            }}
          />
        )}
        
        <main style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem'
        }} className="md-p-6">
          <div style={{
            width: '100%',
            maxWidth: '1024px',
            margin: '0 auto'
          }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
