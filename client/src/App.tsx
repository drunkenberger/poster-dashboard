import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.tsx'
import Dashboard from './pages/Dashboard.tsx'
import CreatePost from './pages/CreatePost.tsx'
import Posts from './pages/Posts.tsx'
import Accounts from './pages/Accounts.tsx'
import MediaGallery from './pages/MediaGallery.tsx'
import SettingsPage from './pages/SettingsPage.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/media" element={<MediaGallery />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
