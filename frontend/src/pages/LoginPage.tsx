import React from 'react';

export default function LoginPage() {
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:3333/auth/google/redirect';
    };

    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f5f5f5',
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                width: '100%',
                maxWidth: '420px',
                textAlign: 'center',
            }}>
                <h1>UPHAS</h1>
                <p>Sign in with Google to continue.</p>

                <button type="button" onClick={handleGoogleLogin}>
                    Continue with Google
                </button>
            </div>
        </main>
    );
}