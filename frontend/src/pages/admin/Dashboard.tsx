import React, { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import Sidebar from "../../components/Sidebar"
import Button from "../../components/Button"
import { api } from "../../api/axios"

const AdminDashboard = () => {
  const queryClient = useQueryClient()

  const [academicYear, setAcademicYear] = useState("")
  const [semester, setSemester] = useState("")

  const navigate = useNavigate()

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isError,
  } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/me")
      console.log("GET /me:", res.data)
      return res.data.data
    },
  })

  useEffect(() => {
    if (isError) {
      navigate("/auth/signin")
    }
  }, [isError, navigate])

  useEffect(() => {
    if (
      user &&
      user.role !== "manager" &&
      user.role !== "super_admin"
    ) {
      navigate("/auth/signin")
    }
  }, [user, navigate])

  if (isUserLoading) {
    return(
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>  
    )
  }

  return <div>
    <h1>Admin Dashboard</h1>
  </div>
}

export default AdminDashboard