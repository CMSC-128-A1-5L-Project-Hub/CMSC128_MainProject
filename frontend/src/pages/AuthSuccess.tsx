import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';

interface User {
    id: number;
    email: string;
    role: 'unassigned' | 'student' | 'manager' | 'landlord' | 'super_admin';
}

interface ApiResponse {
    data: User;
}

export default function AuthSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserAndRedirect = async () => {
            try {
                const response = await api.get<ApiResponse>('/me');
                console.log("Hello? This is the response data: ", response)
                const user = response.data.data;
                console.log(user)
                if (user.role === 'unassigned') navigate ('/setup');
                else if (user.role === 'student') navigate('/dashboard/student');
                else if (user.role === 'manager') navigate('/dashboard/manager');
                else if (user.role === 'super_admin') navigate ('/dashboard/super_admin');
                else { // Fallback jic
                    navigate('/login');
                }
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
                navigate('/login');
            }
        };

        fetchUserAndRedirect();
    }, [navigate]);

    return <div>Loading your dashboard...</div>;
}