import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { createNote, getNoteById, updateNote } from '../services/api';

const NoteForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditMode);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      if (!isEditMode) return;
      
      try {
        const note = await getNoteById(parseInt(id, 10));
        setTitle(note.title);
        setContent(note.content);
      } catch (err) {
        console.error('Error fetching note:', err);
        setError('Failed to fetch note for editing. It may have been deleted or does not exist.');
      } finally {
        setFetchLoading(false);
      }
    };

    if (isEditMode) {
      fetchNote();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditMode && id) {
        await updateNote(parseInt(id, 10), { title, content });
      } else {
        await createNote({ title, content });
      }
      navigate('/');
    } catch (err) {
      console.error('Error saving note:', err);
      setError('Failed to save note. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '16rem'
      }}>
        <div style={{
          color: 'var(--primary-600)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}>Loading note...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          color: 'var(--primary-600)',
          textDecoration: 'none'
        }} className="hover-primary-700">
          <FiArrowLeft style={{ marginRight: '0.5rem' }} />
          Back to notes
        </Link>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        border: '1px solid var(--gray-200)',
        padding: '1.5rem'
      }}>
        <h1 style={{
          fontSize: '1.875rem',
          fontWeight: 'bold',
          color: 'var(--gray-900)',
          marginBottom: '1.5rem'
        }}>
          {isEditMode ? 'Edit Note' : 'Create New Note'}
        </h1>

        {error && (
          <div style={{
            backgroundColor: 'var(--red-50)',
            border: '1px solid var(--red-200)',
            color: 'var(--red-700)',
            padding: '0.75rem 1rem',
            borderRadius: '0.375rem',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="title" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--gray-700)',
              marginBottom: '0.25rem'
            }}>
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
              className="input"
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="content" style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--gray-700)',
              marginBottom: '0.25rem'
            }}>
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter note content"
              className="input"
              style={{ minHeight: '200px' }}
              rows={8}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center' }}
              disabled={loading}
            >
              {loading ? (
                <span style={{
                  display: 'inline-block',
                  height: '1rem',
                  width: '1rem',
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                  borderRadius: '9999px',
                  animation: 'spin 1s linear infinite',
                  marginRight: '0.5rem'
                }}></span>
              ) : (
                <FiSave style={{ marginRight: '0.5rem' }} />
              )}
              {loading ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm;
