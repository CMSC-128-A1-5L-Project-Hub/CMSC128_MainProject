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
                const user = response.data;
                console.log(user)
                if (user.role === 'unassigned') navigate('/auth/role');
                else if (user.account_status === 'pending') navigate('/pending-verification');
                else if (user.role === 'student') navigate('/student/dashboard');
                else if (user.role === 'manager') navigate('/manager/dashboard');
                else if (user.role === 'landlord') navigate('/landlord/manage/accommodations');
                else if (user.role === 'super_admin') navigate('/admin/dashboard');
                else navigate('/auth/signin');
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