import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getPaginatedNotes, deleteNote } from '../services/api';
import { Note } from '../types/Note';
import { PaginatedResult } from '../types/PaginatedResult';

const NotesList = () => {
  const [notesData, setNotesData] = useState<PaginatedResult<Note> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const data = await getPaginatedNotes(currentPage, itemsPerPage);
      setNotesData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Failed to fetch notes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [currentPage, itemsPerPage]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(id);
        fetchNotes(); // Refresh the list after deletion
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
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading && !notesData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-primary-600">Loading notes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
        <button 
          onClick={fetchNotes}
          className="mt-2 text-sm underline hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
        <Link to="/create" className="btn btn-primary">
          Create Note
        </Link>
      </div>

      {notesData?.items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-600 mb-4">You don't have any notes yet.</p>
          <Link to="/create" className="btn btn-primary inline-block">
            Create your first note
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notesData?.items.map((note) => (
              <div key={note.id} className="card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <Link to={`/notes/${note.id}`} className="block">
                    <h2 className="text-xl font-semibold text-gray-900 hover:text-primary-600 truncate">
                      {note.title}
                    </h2>
                  </Link>
                  <div className="flex space-x-2">
                    <Link
                      to={`/edit/${note.id}`}
                      className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-primary-600"
                      title="Edit note"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-600"
                      title="Delete note"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {note.content || 'No content'}
                </p>
                <div className="text-xs text-gray-500">
                  {formatDate(note.createdAt)}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {notesData && notesData.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!notesData.hasPrevious}
                  className={`p-2 rounded-md ${
                    notesData.hasPrevious
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                
                {Array.from({ length: notesData.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!notesData.hasNext}
                  className={`p-2 rounded-md ${
                    notesData.hasNext
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NotesList;
