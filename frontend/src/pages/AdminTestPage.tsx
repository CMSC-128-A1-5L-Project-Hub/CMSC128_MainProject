import React, { useState } from 'react';
import { api } from '../api/axios';

export default function AdminTestPage() {
    const [result, setResult] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const [userId, setUserId] = useState('');
    const [roleToAssign, setRoleToAssign] = useState('');

    const clearMessages = () => {
        setErrorMessage('');
        setResult(null);
    };

    const handleGetPendingUsers = async () => {
        clearMessages();

        try {
            const response = await api.get('/admin/users/pending');
            setResult(response.data);
        } catch (error: any) {
            console.error(error);
            setErrorMessage('Failed to fetch pending users.');
        }
    };

    const handleVerifyUser = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();

        try {
            const response = await api.patch(`/admin/users/${userId}/verify`, {
                roleToAssign,
            });

            setResult(response.data);
        } catch (error: any) {
            console.error(error);
            setErrorMessage('Failed to verify user.');
        }
    };

    return (
        <div
            style={{
                height: '100vh',
                overflowY: 'auto',
                padding: '2rem',
            }}
        >
            <h1>Admin Test Page</h1>
            <p>Temporary page for testing admin verification routes.</p>

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            <hr style={{ margin: '2rem 0' }} />

            <h2>GET /admin/users/pending</h2>
            <button onClick={handleGetPendingUsers}>
                Fetch Pending Users
            </button>

            <hr style={{ margin: '2rem 0' }} />

            <h2>PATCH /admin/users/:userId/verify</h2>
            <form onSubmit={handleVerifyUser}>
                <input
                    type="text"
                    placeholder="User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="student or landlord"
                    value={roleToAssign}
                    onChange={(e) => setRoleToAssign(e.target.value)}
                />
                <button type="submit">Verify User</button>
            </form>

            <hr style={{ margin: '2rem 0' }} />

            <h2>Result</h2>
            <pre
                style={{
                    backgroundColor: '#f4f4f4',
                    padding: '1rem',
                    borderRadius: '8px',
                    overflowX: 'auto',
                    maxHeight: '300px',
                    overflowY: 'auto',
                }}
            >
                {result ? JSON.stringify(result, null, 2) : 'No result yet.'}
            </pre>
        </div>
    );
}