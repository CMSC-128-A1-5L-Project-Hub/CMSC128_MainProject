import React, { useState } from 'react';
import { api } from '../api/axios';

export default function ApplicationTestPage() {
    const [result, setResult] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const [applicationId, setApplicationId] = useState('');
    const [reviewApplicationId, setReviewApplicationId] = useState('');
    const [cancelApplicationId, setCancelApplicationId] = useState('');

    const [submitForm, setSubmitForm] = useState({
        accommodationId: '',
        applicationRoomType: '',
        applicationStayType: '',
        durationOfStayDays: '',
    });

    const [reviewForm, setReviewForm] = useState({
        action: '',
        rejection_reason: '',
    });

    const clearMessages = () => {
        setErrorMessage('');
        setResult(null);
    };

    const handleSubmitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSubmitForm({
            ...submitForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReviewForm({
            ...reviewForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmitApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();

        try {
            const response = await api.post('/applications', {
                ...submitForm,
                durationOfStayDays: Number(submitForm.durationOfStayDays),
            });
            setResult(response.data);
        } catch (error: any) {
            console.error(error);
            setErrorMessage('Failed to submit application.');
        }
    };

    const handleGetMyApplications = async () => {
        clearMessages();

        try {
            const response = await api.get('/applications');
            setResult(response.data);
        } catch (error: any) {
            console.error(error);
            setErrorMessage('Failed to fetch applications.');
        }
    };

    const handleGetIncomingApplications = async () => {
        clearMessages();

        try {
            const response = await api.get('/applications/incoming');
            setResult(response.data);
        } catch (error: any) {
            console.error(error);
            setErrorMessage('Failed to fetch incoming applications.');
        }
    };

    const handleReviewApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();

        try {
            const response = await api.patch(
                `/applications/${reviewApplicationId}/review`,
                reviewForm
            );
            setResult(response.data);
        } catch (error: any) {
            console.error(error);
            setErrorMessage('Failed to review application.');
        }
    };

    const handleCancelApplication = async () => {
        clearMessages();

        try {
            const response = await api.delete(`/applications/${cancelApplicationId}`);
            setResult(response.data);
        } catch (error: any) {
            console.error(error);
            setErrorMessage('Failed to cancel application.');
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
            <h1>Application Test Page</h1>
            <p>Temporary page for testing application backend routes.</p>

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            <hr style={{ margin: '2rem 0' }} />

            <h2>POST /applications</h2>
            <form onSubmit={handleSubmitApplication}>
                <input
                    type="text"
                    name="accommodationId"
                    placeholder="Accommodation ID"
                    onChange={handleSubmitChange}
                />
                <input
                    type="text"
                    name="applicationRoomType"
                    placeholder="Room Type"
                    onChange={handleSubmitChange}
                />
                <input
                    type="text"
                    name="applicationStayType"
                    placeholder="Stay Type"
                    onChange={handleSubmitChange}
                />
                <input
                    type="text"
                    name="durationOfStayDays"
                    placeholder="Duration of Stay (Days)"
                    onChange={handleSubmitChange}
                />
                <button type="submit">Submit Application</button>
            </form>

            <hr style={{ margin: '2rem 0' }} />

            <h2>GET /applications</h2>
            <button onClick={handleGetMyApplications}>Fetch My Applications</button>

            <hr style={{ margin: '2rem 0' }} />

            <h2>GET /applications/incoming</h2>
            <button onClick={handleGetIncomingApplications}>Fetch Incoming Applications</button>

            <hr style={{ margin: '2rem 0' }} />

            <h2>PATCH /applications/:id/review</h2>
            <form onSubmit={handleReviewApplication}>
                <input
                    type="text"
                    placeholder="Application ID"
                    value={reviewApplicationId}
                    onChange={(e) => setReviewApplicationId(e.target.value)}
                />
                <input
                    type="text"
                    name="action"
                    placeholder="approve or reject"
                    onChange={handleReviewChange}
                />
                <input
                    type="text"
                    name="rejection_reason"
                    placeholder="Rejection Reason"
                    onChange={handleReviewChange}
                />
                <button type="submit">Review Application</button>
            </form>

            <hr style={{ margin: '2rem 0' }} />

            <h2>DELETE /applications/:id</h2>
            <input
                type="text"
                placeholder="Application ID"
                value={cancelApplicationId}
                onChange={(e) => setCancelApplicationId(e.target.value)}
            />
            <button onClick={handleCancelApplication}>Cancel Application</button>

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