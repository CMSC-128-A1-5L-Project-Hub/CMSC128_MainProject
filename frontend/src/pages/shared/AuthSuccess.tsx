import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';

interface User {
    id: number;
    email: string;
    role: 'unassigned' | 'student' | 'manager' | 'landlord' | 'super_admin';
    account_status: 'pending' | 'active' | 'suspended' | 'initial';
}

const ROLE_ROUTES: Record<string, string> = {
    student: '/student/dashboard',
    manager: '/manager/dashboard',
    landlord: '/landlord/manage/accommodations',
    super_admin: '/admin/dashboard',
};

export default function AuthSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserAndRedirect = async () => {
            try {
                const user = (await api.get<User>('/me')).data;
                let route: string;
                if (user.role === 'unassigned') route = '/auth/role';
                else if (user.account_status === 'pending') route = '/pending-verification';
                else route = ROLE_ROUTES[user.role] ?? '/auth/signin';
                navigate(route, { replace: true });
            } catch {
                navigate('/auth/signin', { replace: true });
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