import { BrowserRouter, Routes, Route } from "react-router-dom"
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
import ApplicationsPage from "./pages/student/Applications"
import AdminDashboard from "./pages/admin/Dashboard"
import ProfilePage from "./pages/student/ProfilePage"
import FullRoomView from "./pages/student/FullRoomView"
import RoomsPage from "./pages/landlord/RoomPage"
import AuthSuccess from "./pages/shared/AuthSuccess"
import PendingVerification from "./pages/shared/PendingVerification"
import ApplicationsScreen from "./pages/manager/ApplicationsPage"
import Applications from "./pages/landlord/Applications"

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
        {/* ── Public routes (guest-accessible) ── */}
        <Route path="/" element={<FullLandingPage />} />
        <Route path="/auth/signin" element={<SignIn/>}/>
        <Route path="/auth/signup" element={<SignUp/>}/>
        <Route path="/auth/success" element={<AuthSuccess/>}/>
        <Route path="/map" element={<InteractiveMap />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/accommodations/:id" element={<FullRoomView />} />

       {/* ── Post-OAuth onboarding (logged-in, any role) ── */}
<Route path="/auth/role" element={<RoleSelection/>}/>
<Route path="/auth/signup/form" element={<SignUpForm/>}/>
<Route path="/auth/signup/:role" element={<SignUpForm/>}/>
<Route path="/pending-verification" element={<PendingVerification/>}/>
<Route path="/notifications" element={<NotificationsPage />} />

{/* ── Student routes ── */}
<Route path="/student/dashboard" element={<StudentDashboard/>}/>
<Route path="/student/profile" element={<ProfilePage />} />
<Route path="/student/applicationstatus" element={<ApplicationStatus/>}/>
<Route path="/student/billingdashboard" element={<BillingDashboard/>}/>
<Route path="/applications" element={<ApplicationsPage />} />

{/* ── Manager routes ── */}
<Route path="/manager/dashboard" element={<ManagerDashboard/>}/>
<Route path="/manager/occupancy-records" element={<OccupancyRecords />}/>
<Route path="/manager/room-assignment" element={<RoomAssignment />}/>
<Route path="/manager/application" element={<ApplicationsPage />}/>

{/* ── Landlord routes ── */}
<Route path="/landlord/dashboard" element={<LandlordDashboard />} />
<Route path="/landlord/manage/accommodation" element={<ManageAccommodationDashboard />} />
<Route path="/landlord/rooms" element={<RoomsPage />} />
<Route path="/landlord/application" element={<Applications />} />

{/* ── Admin routes ── */}
<Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
