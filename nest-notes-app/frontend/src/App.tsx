import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import NotesList from './components/NotesList';
import NoteDetail from './components/NoteDetail';
import NoteForm from './components/NoteForm';
import NotFound from './components/NotFound';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<NotesList />} />
          <Route path="notes/:id" element={<NoteDetail />} />
          <Route path="create" element={<NoteForm />} />
          <Route path="edit/:id" element={<NoteForm />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
