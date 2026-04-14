import { AnimatePresence } from "framer-motion"
import { Routes, Route, useLocation } from "react-router-dom"
import SignIn from "./pages/shared/SignIn"
import SignUp from "./pages/shared/SignUp"
import SignUpForm from "./pages/shared/SignUpForm"
import RoleSelection from "./pages/shared/RoleSelection"
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
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Sign In Route */}
        <Route path="/auth/signin" element={<SignIn/>}/>
        <Route path="/auth/signup" element={<SignUp/>}/>
        <Route path="/auth/role" element={<RoleSelection/>}/>
        <Route path="/auth/signup/:role" element={<SignUpForm/>}/>
        <Route path="/student/dashboard" element={<StudentDashboard/>}/>
        <Route path="/landingpage" element={<FullLandingPage />} /> 
        <Route path="/map" element={<InteractiveMap />} />
        <Route path="/landlord/manage/accommodation" element = {<ManageAccommodationDashboard />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/pending-verification" element={<PendingVerification />} />
      </Routes>
    </AnimatePresence>
  )
}

export default App
