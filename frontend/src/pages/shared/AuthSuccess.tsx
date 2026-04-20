import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';

interface User {
    id: number;
    email: string;
    role: 'unassigned' | 'student' | 'manager' | 'landlord' | 'super_admin';
    account_status: 'pending' | 'active' | 'suspended' | 'initial'
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
                if (user.role === 'unassigned') navigate('/auth/role');
                else if (user.account_status === 'pending') navigate('/pending-verification');
                else if (user.role === 'student') navigate('/dashboard/student');
                else if (user.role === 'manager') navigate('/dashboard/manager');
                else if (user.role === 'super_admin') navigate ('/dashboard/super_admin');
                else navigate('/login'); // Fallback jic
            } catch (error) {
                console.error("Failed to fetch user profile:", error);
                navigate('/login');
            }
        };

        fetchUserAndRedirect();
    }, [navigate]);

    return ( 
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p className="text-gray-500 font-medium animate-pulse">Authenticating...</p>
        </div>
    );
}