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
import ExerciseListPage from './pages/ExerciseListPage';
import RoutineCreatePage from './pages/RoutineCreatePage';
import RoutineDetailPage from './pages/RoutineDetailPage';
import RoutineEditPage from './pages/RoutineEditPage';
import ExerciseDetailPage from './pages/ExerciseDetailPage';
import PhotoUploadLoading from './pages/PhotoUploadLoading';

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
        <Route path="/exercises" element={<ExerciseListPage />} />
        <Route path="/routines/new" element={<RoutineCreatePage />} />
        <Route path="/routines/:routineId" element={<RoutineDetailPage />} />
        <Route path="/routines/edit/:routineId" element={<RoutineEditPage />} />
        <Route path="/exercises/:exerciseId" element={<ExerciseDetailPage />} />
        <Route path="/photoanalysis-loading" element={<PhotoUploadLoading />} />
        
      </Routes>
  )
}

export default App;