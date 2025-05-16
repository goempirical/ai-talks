import { FiMenu, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  return (
    <header style={{
      backgroundColor: 'white',
      borderBottom: '1px solid var(--gray-200)',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
    }}>
      <div className="container" style={{
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={toggleSidebar}
            style={{
              marginRight: '1rem',
              padding: '0.5rem',
              borderRadius: '9999px',
              cursor: 'pointer',
              border: 'none',
              backgroundColor: 'transparent'
            }}
            aria-label="Toggle sidebar"
            className="md-hidden"
          >
            <FiMenu style={{ height: '1.25rem', width: '1.25rem', color: 'var(--gray-600)' }} />
          </button>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <span style={{ color: 'var(--primary-600)', fontWeight: 'bold', fontSize: '1.25rem' }}>Notes App</span>
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link
            to="/create"
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <FiPlus style={{ marginRight: '0.25rem' }} />
            <span>New Note</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
