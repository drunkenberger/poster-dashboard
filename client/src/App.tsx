import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.tsx'
import ToastContainer from './components/ui/Toast.tsx'
import Dashboard from './pages/Dashboard.tsx'
import CreatePost from './pages/CreatePost.tsx'
import Posts from './pages/Posts.tsx'
import Accounts from './pages/Accounts.tsx'
import MediaGallery from './pages/MediaGallery.tsx'
import PostDetail from './pages/PostDetail.tsx'
import SettingsPage from './pages/SettingsPage.tsx'
import DriveVideoBrowser from './pages/DriveVideoBrowser.tsx'
import BulkCreate from './pages/BulkCreate.tsx'
import ShortsEditor from './pages/ShortsEditor.tsx'
import AutoSchedule from './pages/AutoSchedule.tsx'
import CarouselCreator from './pages/CarouselCreator.tsx'
import BulkCarouselCreator from './pages/BulkCarouselCreator.tsx'
import Analytics from './pages/Analytics.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/media" element={<MediaGallery />} />
          <Route path="/drive" element={<DriveVideoBrowser />} />
          <Route path="/bulk" element={<BulkCreate />} />
          <Route path="/shorts" element={<ShortsEditor />} />
          <Route path="/auto-schedule" element={<AutoSchedule />} />
          <Route path="/carousel" element={<CarouselCreator />} />
          <Route path="/carousel-series" element={<BulkCarouselCreator />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  )
}
