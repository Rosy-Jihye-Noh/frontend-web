import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Signup2 from './pages/Signup2';
import FindCredentials from './pages/FindCredentials';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import SocialSignupPage from './pages/SocialSignupPage';
import MyPage from './pages/MyPage';
import EditProfilePage from './pages/EditProfilePage';
import AnalysisResultPage from './pages/AnalysisResultPage';
import Dashboard from './pages/Dashboard';
import PhotoUpload from './pages/PhotoUpload';

const App = () => {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signup2" element={<Signup2 />} />
        <Route path="/find-credentials" element={<FindCredentials />} />
        <Route path="/oauth/redirect" element={<OAuth2RedirectHandler />} />
        <Route path="/social-signup" element={<SocialSignupPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/mypage/edit" element={<EditProfilePage />} />
        <Route path="/analysis-result/:historyId" element={<AnalysisResultPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/photoupload" element={<PhotoUpload />} />
      </Routes>
  )
}

export default App;