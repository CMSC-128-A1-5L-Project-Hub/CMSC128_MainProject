import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import NotFound from "./pages/shared/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import SignIn from "./pages/shared/SignIn"
import SignUp from "./pages/shared/SignUp"
import SignUpForm from "./pages/shared/SignUpForm"
import RoleSelection from "./pages/shared/RoleSelection"
import AuthSuccess from "./pages/shared/AuthSuccess"
import PendingVerification from "./pages/shared/PendingVerification"
import StudentDashboard from "./pages/student/Dashboard"
import ManagerDashboard from "./pages/manager/Dashboard"
import OccupancyRecords from "./pages/manager/OccupancyRecords"
import RoomAssignment from "./pages/manager/RoomAssignment"
import LandingPage from "./pages/shared/Landingpage"
import AboutSection from "./pages/shared/Aboutsection"
import FeaturesSection from "./pages/shared/Featuresection"
import ResidenceCarousel from "./pages/shared/Recommendedsection"
import UBLEFooter from "./pages/shared/SupportSection"
import InteractiveMap from "./pages/MapPage"
import BrowsePage from "./pages/student/Browse"
import ManageAccommodationDashboard from "./pages/landlord/manageAcommodation"
import LandlordDashboard from "./pages/landlord/Dashboard"
import NotificationsPage from "./pages/shared/Notifications"
import ApplicationsPage from "./pages/student/Applications"
import AdminDashboard from "./pages/admin/Dashboard"
import ProfilePage from "./pages/student/ProfilePage"

function FullLandingPage() {
  return (
    <>
      <LandingPage />
      <AboutSection />
      <FeaturesSection />
      <ResidenceCarousel />
      <UBLEFooter />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/" element={<FullLandingPage />} />
        <Route path="/landingpage" element={<Navigate to="/" replace />} />
        <Route path="/auth/signin" element={<SignIn/>}/>
        <Route path="/auth/signup" element={<SignUp/>}/>
        <Route path="/map" element={<InteractiveMap />} />
        <Route path="/browse" element={<BrowsePage />} />

        {/* ── Logged-in only (any role) ── */}
        <Route path="/auth/success" element={<AuthSuccess/>}/>
        <Route path="/auth/role" element={<ProtectedRoute><RoleSelection/></ProtectedRoute>}/>
        <Route path="/auth/signup/form" element={<SignUpForm/>}/>
        <Route path="/auth/signup/:role" element={<ProtectedRoute><SignUpForm/></ProtectedRoute>}/>
        <Route path="/pending-verification" element={<ProtectedRoute><PendingVerification/></ProtectedRoute>}/>
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

        {/* ── Student routes ── */}
        <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard/></ProtectedRoute>}/>
        <Route path="/student/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} />

        {/* ── Manager routes ── */}
        <Route path="/manager/dashboard" element={<ProtectedRoute><ManagerDashboard/></ProtectedRoute>}/>
        <Route path="/manager/occupancy-records" element={<ProtectedRoute><OccupancyRecords /></ProtectedRoute>}/>
        <Route path="/manager/room-assignment" element={<ProtectedRoute><RoomAssignment /></ProtectedRoute>}/>

        {/* ── Landlord routes ── */}
        <Route path="/landlord/dashboard" element={<ProtectedRoute><LandlordDashboard /></ProtectedRoute>} />
        <Route path="/landlord/manage/accommodation" element={<ProtectedRoute><ManageAccommodationDashboard /></ProtectedRoute>} />

        {/* ── Admin routes ── */}
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        {/* ── Catch-all: 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
