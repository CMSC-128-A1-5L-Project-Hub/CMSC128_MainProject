import React from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import SignIn from "./pages/shared/SignIn"
import SignUp from "./pages/shared/SignUp"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Sign In Route */}
        <Route path="/auth/signin" element={<SignIn/>}/>
        <Route path="/auth/signup" element={<SignUp/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
