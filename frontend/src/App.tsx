import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import NotFound from "./pages/shared/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import SignIn from "./pages/shared/SignIn"
import SignUp from "./pages/shared/SignUp"
import SignUpForm from "./pages/shared/SignUpForm"
import ApplicationStatus from "./pages/student/ApplicationStatus"
import RoleSelection from "./pages/shared/RoleSelection"
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
import BillingDashboard from "./pages/student/BillingDashboard"
import LandlordDashboard from "./pages/landlord/Dashboard"
import NotificationsPage from "./pages/shared/Notifications"
import StudentApplicationsPage from "./pages/student/Applications"
import AdminDashboard from "./pages/admin/Dashboard"
import ProfilePage from "./pages/student/ProfilePage"
import RoomsPage from "./pages/landlord/RoomPage"
import AuthSuccess from "./pages/shared/AuthSuccess"
import PendingVerification from "./pages/shared/PendingVerification"
import ManagerApplicationsPage from "./pages/manager/ApplicationsPage"
import Waitlist from "./pages/manager/Waitlist"
import MoveinMoveout from "./pages/manager/MoveinMoveout"

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
        {/* Get rid of this once theres no more references to /landingpage in the pages */}
        <Route path="/landingpage" element={<Navigate to="/" replace />} /> 
        <Route path="/auth/signin" element={<SignIn/>}/>
        <Route path="/auth/signup" element={<SignUp/>}/>
        <Route path="/auth/signup/form" element={<SignUpForm/>}/>
        <Route path="/auth/success" element={<AuthSuccess />} />

        <Route path="/pending-verification" element={<PendingVerification />} />
        <Route path="/" element={<FullLandingPage />} /> 
        <Route path="/map" element={<InteractiveMap />} />
        <Route path="/browse" element={<BrowsePage />} />

        <Route path="/student/dashboard" element={<StudentDashboard/>}/>
        
        <Route path="/manager/dashboard/" element={<ManagerDashboard/>}/>
        <Route path="/manager/occupancy-records" element={<OccupancyRecords />}/>
        <Route path="/manager/room-assignment" element={<RoomAssignment />}/>
        <Route path="/manager/applications" element={<ManagerApplicationsPage />} />
        <Route path="/manager/waitlist" element={<Waitlist />} />
        <Route path="/manager/movein-moveout" element={<MoveinMoveout />} />

        {/* ── Manager routes ── */}
        <Route path="/manager/dashboard" element={<ProtectedRoute><ManagerDashboard/></ProtectedRoute>}/>
        <Route path="/manager/occupancy-records" element={<ProtectedRoute><OccupancyRecords /></ProtectedRoute>}/>
        <Route path="/manager/room-assignment" element={<ProtectedRoute><RoomAssignment /></ProtectedRoute>}/>
        <Route path="/manager/occupancy-records" element={<ProtectedRoute><OccupancyRecords /></ProtectedRoute>}/>
        <Route path="/manager/applications" element={<ProtectedRoute><ManagerApplicationsPage /></ProtectedRoute>}/>
        <Route path="/manager/movein-moveout" element={<ProtectedRoute><MoveinMoveout /></ProtectedRoute>}/>
        <Route path="/browse" element={<BrowsePage />} />


        {/* ── Landlord routes ── */}
        <Route path="/landlord/dashboard" element={<ProtectedRoute><LandlordDashboard /></ProtectedRoute>} />
        <Route path="/landlord/manage/accommodation" element={<ProtectedRoute><ManageAccommodationDashboard /></ProtectedRoute>} />
        <Route path="/landlord/rooms" element={<ProtectedRoute><RoomsPage /></ProtectedRoute>} />

        {/* ── Admin routes ── */}
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

        {/* ── Catch-all: 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
