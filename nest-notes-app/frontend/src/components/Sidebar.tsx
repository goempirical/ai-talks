import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiX, FiSearch } from 'react-icons/fi';
import { searchNotes } from '../services/api';
import { Note } from '../types/Note';

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
}

const Sidebar = ({ isOpen, closeSidebar }: SidebarProps) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);

  useEffect(() => {
    // Close sidebar on mobile when route changes
    closeSidebar();
  }, [location.pathname, closeSidebar]);

  const handleSearch = useCallback(async () => {
    if (searchTerm.trim().length > 0) {
      try {
        const results = await searchNotes(searchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching notes:', error);
      }
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm, handleSearch]);

  const sidebarStyle = {
    position: 'fixed' as const,
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 30,
    width: '16rem',
    backgroundColor: 'white',
    borderRight: '1px solid var(--gray-200)',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 300ms ease-in-out'
  };

  return (
    <div style={sidebarStyle} className={isOpen ? 'sidebar-open' : 'sidebar-closed'}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem',
          borderBottom: '1px solid var(--gray-200)'
        }} className="md-hidden">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--primary-600)' }}>Menu</h2>
          <button
            onClick={closeSidebar}
            style={{
              padding: '0.5rem',
              borderRadius: '9999px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
            aria-label="Close sidebar"
          >
            <FiX style={{ height: '1.25rem', width: '1.25rem', color: 'var(--gray-600)' }} />
          </button>
        </div>
        
        <div style={{ padding: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search notes..."
              className="input"
              style={{ paddingLeft: '2.5rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--gray-400)'
            }} />
          </div>
        </div>
        
        <nav style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>
              <Link
                to="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  textDecoration: 'none',
                  color: location.pathname === '/' ? 'var(--primary-600)' : 'var(--gray-700)',
                  backgroundColor: location.pathname === '/' ? 'var(--primary-50)' : 'transparent'
                }}
              >
                <FiHome style={{ marginRight: '0.75rem', height: '1.25rem', width: '1.25rem' }} />
                <span>All Notes</span>
              </Link>
            </li>
            
            {searchResults.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <h3 style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--gray-500)',
                  fontWeight: 600,
                  marginBottom: '0.5rem'
                }}>
                  Search Results
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {searchResults.map((note) => (
                    <li key={note.id} style={{ marginBottom: '0.25rem' }}>
                      <Link
                        to={`/notes/${note.id}`}
                        style={{
                          display: 'block',
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          textDecoration: 'none',
                          color: 'var(--gray-700)',
                          fontSize: '0.875rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {note.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </ul>
        </nav>
        
        <div style={{ padding: '1rem', borderTop: '1px solid var(--gray-200)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
            <p>© 2025 Notes App</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
