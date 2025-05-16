import React from 'react'
import { Routes, Route } from 'react-router-dom'
import ChatPage from './pages/ChatPage'
import TasksPage from './pages/TasksPage'
import Header from './components/Header'
import { ChatProvider } from './contexts/ChatContext'

function App() {
  return (
    <ChatProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/tasks" element={<TasksPage />} />
          </Routes>
        </main>
      </div>
    </ChatProvider>
  )
}

export default App
