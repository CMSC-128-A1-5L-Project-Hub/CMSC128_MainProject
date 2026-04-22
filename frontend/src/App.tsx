import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import SignIn from "./pages/shared/SignIn"
import SignUp from "./pages/shared/SignUp"
import SignUpForm from "./pages/shared/SignUpForm"
import StudentDashboard from "./pages/student/Dashboard"
import LandingPage from "./pages/shared/Landingpage"
import AboutSection from "./pages/shared/Aboutsection"
import FeaturesSection from "./pages/shared/Featuresection"
import ResidenceCarousel from "./pages/shared/Recommendedsection"
import UBLEFooter from "./pages/shared/SupportSection"
import InteractiveMap from "./pages/MapPage"
import AuthSuccess from "./pages/shared/AuthSuccess"
import PendingVerification from "./pages/shared/PendingVerification"
import ManageAccommodationDashboard from "./pages/landlord/manageAcommodation"
import LandlordDashboard from "./pages/landlord/Dashboard"
import Profile from "./pages/manager/Profile"

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
        {/* Sign In Route */}
        <Route path="/auth/signin" element={<SignIn/>}/>
        <Route path="/auth/signup" element={<SignUp/>}/>
        <Route path="/auth/signup/form" element={<SignUpForm/>}/>
        <Route path="/student/dashboard" element={<StudentDashboard/>}/>
        <Route path="/landingpage" element={<FullLandingPage />} /> 
        <Route path="/map" element={<InteractiveMap />} />
        <Route path="/landlord/manage/accommodation" element = {<ManageAccommodationDashboard />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/pending-verification" element={<PendingVerification />} />
        <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
        <Route path="/manager/profile" element={<Profile />} />
        <Route path="/SignUpForm" element={<SignUpForm />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
