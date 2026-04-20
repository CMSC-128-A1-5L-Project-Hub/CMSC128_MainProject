import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import SignIn from "./pages/shared/SignIn"
import SignUp from "./pages/shared/SignUp"
import SignUpForm from "./pages/shared/SignUpForm"
import RoleSelection from "./pages/shared/RoleSelection"
import AuthSuccess from "./pages/shared/AuthSuccess"
import PendingVerification from "./pages/shared/PendingVerification"
import StudentDashboard from "./pages/student/Dashboard"
import FullRoomView from "./pages/student/FullRoomView"
import LandingPage from "./pages/shared/Landingpage"
import AboutSection from "./pages/shared/Aboutsection"
import FeaturesSection from "./pages/shared/Featuresection"
import ResidenceCarousel from "./pages/shared/Recommendedsection"
import UBLEFooter from "./pages/shared/SupportSection"
import InteractiveMap from "./pages/MapPage"
import ManageAccommodationDashboard from "./pages/landlord/manageAcommodation"
import NotificationsPage from "./pages/shared/Notifications"
import ApplicationsPage from "./pages/student/Applications"
import AdminDashboard from "./pages/admin/Dashboard"
import ProfilePage from "./pages/student/ProfilePage"
import LandlordDashboard from "./pages/landlord/Dashboard"

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
        {/* Auth Routes */}
        <Route path="/auth/signin" element={<SignIn/>}/>
        <Route path="/auth/signup" element={<SignUp/>}/>
        <Route path="/auth/success" element={<AuthSuccess/>}/>
        <Route path="/auth/role" element={<RoleSelection/>}/>
        <Route path="/auth/signup/:role" element={<SignUpForm/>}/>
        <Route path="/pending-verification" element={<PendingVerification/>}/>
        <Route path="/student/dashboard" element={<StudentDashboard/>}/>
        <Route path="/" element={<FullLandingPage />} />
        <Route path="/landingpage" element={<Navigate to="/" replace />} />
        <Route path="/map" element={<InteractiveMap />} />
        <Route path="/landlord/manage/accommodation" element = {<ManageAccommodationDashboard />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/pending-verification" element={<PendingVerification />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/student/profile" element={<ProfilePage />} />
        <Route path="/accommodations/:id" element={<FullRoomView />} />
        <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
