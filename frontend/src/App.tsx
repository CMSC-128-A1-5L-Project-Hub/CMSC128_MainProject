import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
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
import AdminDashboard from "./pages/admin/Dashboard"
import ProfilePage from "./pages/student/ProfilePage"
import RoomView from "./pages/student/RoomView"
import RoomsPage from "./pages/landlord/RoomPage"
import AuthSuccess from "./pages/shared/AuthSuccess"
import DevLogin from "./pages/shared/DevLogin"
import PendingVerification from "./pages/shared/PendingVerification"
import ManagerApplicationsPage from "./pages/manager/ApplicationsPage"
import Waitlist from "./pages/manager/Waitlist"
import MoveinMoveout from "./pages/manager/MoveinMoveout"
import ManagerProfile from "./pages/manager/Profile"
import FeesPage from './pages/landlord/FeesPage'
import LandlordProfile from './pages/landlord/LandlordProfile'
import Applications from "./pages/landlord/Applications"
import StudentVerificationsPage from "./pages/admin/StudentVerificationsPage"
import LandlordVerificationsPage from "./pages/admin/LandlordVerificationsPage"
import PendingAccommodationsPage from "./pages/admin/PendingAccommodationsPage"
import UbleLoader from "./pages/shared/LoadingPage"
import OccupancyReportPrint from "./pages/landlord/reports/OccupancyReportPrint"
import RevenueReportPrint from "./pages/landlord/reports/RevenueReportPrint"
import AccommodationHistoryReportPrint from "./pages/landlord/reports/AccommodationHistoryReportPrint"
import BillingStatementPrint from "./pages/student/reports/BillingStatementPrint"
import ActivityLogsPage from "./pages/admin/ActivityLogs"

import StudentLayout from "./layouts/StudentLayout"
import ManagerLayout from "./layouts/ManagerLayout"
import LandlordLayout from "./layouts/LandlordLayout"
import AdminLayout from "./layouts/AdminLayout"

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

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ── Public routes (guest-accessible) ── */}
        <Route path="/" element={<FullLandingPage />} />
        <Route path="/auth/signin" element={<SignIn/>}/>
        <Route path="/auth/signup" element={<SignUp/>}/>
        <Route path="/auth/success" element={<AuthSuccess/>}/>
        <Route path="/dev/login" element={<DevLogin/>}/>
        <Route path="/map" element={<InteractiveMap />} />
        <Route path="/loader" element = {<UbleLoader />} />

        {/* ── Print-only routes (rendered by backend Puppeteer; data passed via URL) ── */}
        <Route path="/reports/occupancy/print" element={<OccupancyReportPrint />} />
        <Route path="/reports/revenue/print" element={<RevenueReportPrint />} />
        <Route path="/reports/accommodation-history/print" element={<AccommodationHistoryReportPrint />} />
        <Route path="/reports/billing-statement/print" element={<BillingStatementPrint />} />

        {/* ── Post-OAuth onboarding (logged-in, any role) ── */}
        <Route path="/auth/role" element={<ProtectedRoute><RoleSelection/></ProtectedRoute>}/>
        <Route path="/auth/signup/form" element={<ProtectedRoute><SignUpForm/></ProtectedRoute>}/>
        <Route path="/auth/signup/:role" element={<ProtectedRoute><SignUpForm/></ProtectedRoute>}/>
        <Route path="/pending-verification" element={<ProtectedRoute><PendingVerification/></ProtectedRoute>}/>
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage/></ProtectedRoute>}/>

        {/* ── Student routes ── */}
        <Route element={<StudentLayout />}>
          <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard/></ProtectedRoute>}/>
          <Route path="/student/browse" element={<BrowsePage />} />
          <Route path="/student/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/student/applications" element={<ProtectedRoute><ApplicationStatus/></ProtectedRoute>}/>
          <Route path="/student/billingdashboard" element={<ProtectedRoute><BillingDashboard/></ProtectedRoute>}/>
          <Route path="/student/roomview/:id" element={<RoomView />} />
        </Route>

        {/* ── Manager routes ── */}
        <Route element={<ManagerLayout/>}>
          <Route path="/manager/dashboard" element={<ProtectedRoute><ManagerDashboard/></ProtectedRoute>}/>
          <Route path="/manager/occupancy-records" element={<ProtectedRoute><OccupancyRecords /></ProtectedRoute>}/>
          <Route path="/manager/room-assignment" element={<ProtectedRoute><RoomAssignment /></ProtectedRoute>}/>
          <Route path="/manager/movein-moveout" element={<ProtectedRoute><MoveinMoveout /></ProtectedRoute>}/>
          <Route path="/manager/applications" element={<ProtectedRoute><ManagerApplicationsPage /></ProtectedRoute>}/>
          <Route path="/manager/waitlist" element={<ProtectedRoute><Waitlist /></ProtectedRoute>} />
          <Route path="/manager/profile" element={<ProtectedRoute><ManagerProfile /></ProtectedRoute>} />
        </Route>

        {/* ── Landlord routes ── */}
        <Route element={<LandlordLayout />}>
          {/* Manage Accommodation (landing page for landlords) */}
          <Route path="/landlord/dashboard" element={<ProtectedRoute><ManageAccommodationDashboard /></ProtectedRoute>} />
          {/* Individual Accommodation Dashboard */}
          <Route path="/landlord/accommodation/:id" element={<ProtectedRoute><LandlordDashboard /></ProtectedRoute>} />
          <Route path="/landlord/rooms" element={<ProtectedRoute><RoomsPage /></ProtectedRoute>} />
          <Route path="/landlord/fees" element={<ProtectedRoute><FeesPage /></ProtectedRoute>} />
          <Route path="/landlord/profile" element={<ProtectedRoute><LandlordProfile /></ProtectedRoute>} />
          <Route path="/landlord/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
        </Route>

        {/* ── Admin routes ── */}
        <Route element={<AdminLayout/>}>
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/student-verifications" element={<ProtectedRoute> <StudentVerificationsPage /> </ProtectedRoute>} />
          <Route path="/admin/landlord-verifications" element={<ProtectedRoute> <LandlordVerificationsPage /> </ProtectedRoute>} />
          <Route path="/admin/pending-accommodations" element={<ProtectedRoute> <PendingAccommodationsPage /> </ProtectedRoute>} />
          <Route path="/admin/activity-logs" element={<ProtectedRoute> <ActivityLogsPage /> </ProtectedRoute>} />
        </Route>
        
        {/* ── Catch-all: 404 ── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes/>
    </BrowserRouter>
  )
}

export default App