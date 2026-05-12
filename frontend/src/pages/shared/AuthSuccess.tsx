import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/axios';
import UbleLoader from './LoadingPage';

interface User {
    id: number;
    email: string;
    role: 'unassigned' | 'student' | 'manager' | 'landlord' | 'super_admin';
    accountStatus: 'pending' | 'active' | 'suspended' | 'initial';
}

const ROLE_ROUTES: Record<string, string> = {
    student: '/student/dashboard',
    manager: '/manager/dashboard',
    landlord: '/landlord/dashboard',
    super_admin: '/admin/dashboard',
};

export default function AuthSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserAndRedirect = async () => {
            try {
                const user = (await api.get<User>('/me')).data;
                let route: string;
                if (user.accountStatus === 'pending') route = '/pending-verification';
                else if (user.role === 'unassigned') route = '/auth/role';
                else route = ROLE_ROUTES[user.role] ?? '/auth/signin';
                navigate(route, { replace: true });
            } catch {
                navigate('/auth/signin', { replace: true });
            }
        };

        fetchUserAndRedirect();
    }, [navigate]);

    return null
}