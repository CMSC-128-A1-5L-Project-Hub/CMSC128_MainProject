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
import StudentApplicationsPage from "./pages/student/ApplicationStatus"
import AdminDashboard from "./pages/admin/Dashboard"
import ProfilePage from "./pages/student/ProfilePage"
import FullRoomView from "./pages/student/FullRoomView"
import RoomView from "./pages/student/RoomView"
import RoomsPage from "./pages/landlord/RoomPage"
import AuthSuccess from "./pages/shared/AuthSuccess"
import PendingVerification from "./pages/shared/PendingVerification"
import ManagerApplicationsPage from "./pages/manager/ApplicationsPage"
import Waitlist from "./pages/manager/Waitlist"
import MoveinMoveout from "./pages/manager/MoveinMoveout"
import ManagerProfile from "./pages/manager/Profile"
import FeesPage from "./pages/landlord/FeesPage"
import StudentVerificationsPage from "./pages/admin/StudentVerificationsPage"
import LandlordVerificationsPage from "./pages/admin/LandlordVerificationsPage"
// import ApplicationTestPage from "./pages/ApplicationTestPage"
function FullLandingPage() {
  return (
    <>
      <LandingPage />
      <AboutSection />
      <FeaturesSection />
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
        <Route path="/landlord/rooms" element={<RoomsPage />} />

        {/* ── Post-OAuth onboarding (logged-in, any role) ── */}
        <Route path="/auth/role" element={<ProtectedRoute><RoleSelection/></ProtectedRoute>}/>
        <Route path="/auth/signup/form" element={<ProtectedRoute><SignUpForm/></ProtectedRoute>}/>
        <Route path="/auth/signup/:role" element={<ProtectedRoute><SignUpForm/></ProtectedRoute>}/>
        <Route path="/pending-verification" element={<ProtectedRoute><PendingVerification/></ProtectedRoute>}/>
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage/></ProtectedRoute>}/>

        {/* ── Student routes ── */}
        <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard/></ProtectedRoute>}/>
        <Route path="/student/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/student/applications" element={<ProtectedRoute><ApplicationStatus/></ProtectedRoute>}/>
        <Route path="/student/billingdashboard" element={<ProtectedRoute><BillingDashboard/></ProtectedRoute>}/>
        <Route path="/student/roomview" element={<RoomView />} />
        {/* <Route path="/student/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>} /> */}

        {/* ── Manager routes ── */}
        <Route path="/manager/dashboard" element={<ProtectedRoute><ManagerDashboard/></ProtectedRoute>}/>
        <Route path="/manager/occupancy-records" element={<ProtectedRoute><OccupancyRecords /></ProtectedRoute>}/>
        <Route path="/manager/room-assignment" element={<ProtectedRoute><RoomAssignment /></ProtectedRoute>}/>
        <Route path="/manager/movein-moveout" element={<ProtectedRoute><MoveinMoveout /></ProtectedRoute>}/>
        <Route path="/manager/application" element={<ProtectedRoute><ManagerApplicationsPage /></ProtectedRoute>}/>
        <Route path="/manager/waitlist" element={<ProtectedRoute><Waitlist /></ProtectedRoute>} />
        <Route path="/manager/profile" element={<ProtectedRoute><ManagerProfile /></ProtectedRoute>} />

        {/* ── Landlord routes ── */}
        <Route path="/landlord/accommodations/:id" element={<ProtectedRoute><LandlordDashboard /></ProtectedRoute>} />
        <Route path="/landlord/dashboard" element={<ProtectedRoute><ManageAccommodationDashboard /></ProtectedRoute>} />
        
        <Route path="/landlord/fees" element={<ProtectedRoute><FeesPage /></ProtectedRoute>} />

        {/* ── Admin routes ── */}
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/student-verifications" element={<ProtectedRoute> <StudentVerificationsPage /> </ProtectedRoute>} />
        <Route path="/admin/landlord-verifications" element={<ProtectedRoute> <LandlordVerificationsPage /> </ProtectedRoute>} />
        {/* ── Catch-all: 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
