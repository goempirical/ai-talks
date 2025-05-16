import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { getNoteById, deleteNote } from '../services/api';
import { Note } from '../types/Note';

const NoteDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await getNoteById(parseInt(id, 10));
        setNote(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching note:', err);
        setError('Failed to fetch note. It may have been deleted or does not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  const handleDelete = async () => {
    if (!note) return;
    
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(note.id);
        navigate('/');
      } catch (err) {
        console.error('Error deleting note:', err);
        setError('Failed to delete note. Please try again later.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-primary-600">Loading note...</div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error || 'Note not found'}</p>
        <Link to="/" className="mt-2 text-sm underline hover:text-red-800 inline-block">
          Back to notes
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700">
          <FiArrowLeft className="mr-2" />
          Back to notes
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{note.title}</h1>
          <div className="flex space-x-2">
            <Link
              to={`/edit/${note.id}`}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-primary-600"
              title="Edit note"
            >
              <FiEdit2 className="h-5 w-5" />
            </Link>
            <button
              onClick={handleDelete}
              className="p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-red-600"
              title="Delete note"
            >
              <FiTrash2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-6">
          Created on {formatDate(note.createdAt)}
        </div>

        <div className="prose max-w-none">
          {note.content ? (
            <div className="whitespace-pre-wrap">{note.content}</div>
          ) : (
            <p className="text-gray-500 italic">No content</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteDetail;
