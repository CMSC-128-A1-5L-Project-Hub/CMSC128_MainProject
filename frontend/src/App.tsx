import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import SignIn from "./pages/shared/SignIn"
import SignUp from "./pages/shared/SignUp"
import SignUpForm from "./pages/shared/SignUpForm"
import ApplicationStatus from "./pages/student/ApplicationStatus"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Sign In Route */}
        <Route path="/auth/signin" element={<SignIn/>}/>
        <Route path="/auth/signup" element={<SignUp/>}/>
        <Route path="/auth/signup/form" element={<SignUpForm/>}/>
        <Route path="/student/applicationstatus" element={<ApplicationStatus/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
