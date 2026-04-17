import React, { useState } from 'react';
import { api } from '../api/axios';

export default function AccommodationTestPage() {
    const [result, setResult] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const [accommodationId, setAccommodationId] = useState('');
    const [imageAccommodationId, setImageAccommodationId] = useState('');
    const [deleteAccommodationId, setDeleteAccommodationId] = useState('');
    const [deleteImageId, setDeleteImageId] = useState('');

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const [createForm, setCreateForm] = useState({
        accommodation_name: '',
        accommodation_location: '',
        accommodation_type: '',
        accommodation_capacity: '',
        tenant_restriction: '',
        application_start_date: '',
        application_end_date: '',
        manager_id: '',
        business_permit_id: '',
        latitude: '',
        longitude: '',
    });

    const [updateForm, setUpdateForm] = useState({
        id: '',
        accommodation_name: '',
        accommodation_location: '',
        accommodation_type: '',
        accommodation_capacity: '',
        tenant_restriction: '',
        application_start_date: '',
        application_end_date: '',
        latitude: '',
        longitude: '',
    });

    const clearMessages = () => {
        setErrorMessage('');
        setResult(null);
    };

    const handleGetAll = async () => {
        clearMessages();

        try {
            const response = await api.get('/accommodations');
            setResult(response.data);
        } catch (error: any) {
            console.error(error);
            setErrorMessage('Failed to fetch accommodations.');
        }
    };

    const handleGetOne = async () => {
        clearMessages();

        try {
            const response = await api.get(`/accommodations/${accommodationId}`);
            setResult(response.data);
        } catch (error: any) {
            console.error(error);
            setErrorMessage('Failed to fetch accommodation.');
        }
    };

    const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCreateForm({
            ...createForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdateForm({
            ...updateForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();

        try {
            const response = await api.post('/landlord/accommodations', createForm);
            setResult(response.data);
        } catch (error: any) {
            console.error(error);
            setErrorMessage('Failed to create accommodation.');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();

        try {
            const { id, ...payload } = updateForm;
            const response = await api.put(`/landlord/accommodations/${id}`, payload);
            setResult(response.data);
        } catch (error: any) {
            console.error(error);
            setErrorMessage('Failed to update accommodation.');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(Array.from(e.target.files));
        }
    };

    const handleUploadImages = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();

        try {
            const payload = new FormData();

            selectedFiles.forEach((file) => {
                payload.append('images', file);
            });

            const response = await api.post(
                `/landlord/accommodations/${imageAccommodationId}/images`,
                payload
            );

            setResult(response.data);
        } catch (error: any) {
            console.error(error);
            setErrorMessage('Failed to upload images.');
        }
    };

    const handleDeleteImage = async () => {
        clearMessages();

        try {
            const response = await api.delete(
                `/landlord/accommodations/${deleteAccommodationId}/images/${deleteImageId}`
            );
            setResult(response.data);
        } catch (error: any) {
            console.error(error);
            setErrorMessage('Failed to delete image.');
        }
    };

    return (
        <div style={{ height: '100vh',
            overflowY: 'auto',
            padding: '2rem',
        }}
        >
            <h1>Accommodation Test Page</h1>
            <p>Temporary page for testing accommodation backend routes.</p>

            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            <hr />

            <h2>GET /accommodations</h2>
            <button onClick={handleGetAll}>Fetch All Accommodations</button>

            <hr />

            <h2>GET /accommodations/:id</h2>
            <input
                type="text"
                placeholder="Accommodation ID"
                value={accommodationId}
                onChange={(e) => setAccommodationId(e.target.value)}
            />
            <button onClick={handleGetOne}>Fetch One Accommodation</button>

            <hr />

            <h2>POST /landlord/accommodations</h2>
            <form onSubmit={handleCreate}>
                <input type="text" name="accommodation_name" placeholder="Accommodation Name" onChange={handleCreateChange} />
                <input type="text" name="accommodation_location" placeholder="Accommodation Location" onChange={handleCreateChange} />
                <input type="text" name="accommodation_type" placeholder="Accommodation Type" onChange={handleCreateChange} />
                <input type="text" name="accommodation_capacity" placeholder="Accommodation Capacity" onChange={handleCreateChange} />
                <input type="text" name="tenant_restriction" placeholder="Tenant Restriction" onChange={handleCreateChange} />
                <input type="date" name="application_start_date" onChange={handleCreateChange} />
                <input type="date" name="application_end_date" onChange={handleCreateChange} />
                <input type="text" name="manager_id" placeholder="Manager ID" onChange={handleCreateChange} />
                <input type="text" name="business_permit_id" placeholder="Business Permit ID" onChange={handleCreateChange} />
                <input type="text" name="latitude" placeholder="Latitude" onChange={handleCreateChange} />
                <input type="text" name="longitude" placeholder="Longitude" onChange={handleCreateChange} />
                <button type="submit">Create Accommodation</button>
            </form>

            <hr />

            <h2>PUT /landlord/accommodations/:id</h2>
            <form onSubmit={handleUpdate}>
                <input type="text" name="id" placeholder="Accommodation ID" onChange={handleUpdateChange} />
                <input type="text" name="accommodation_name" placeholder="Accommodation Name" onChange={handleUpdateChange} />
                <input type="text" name="accommodation_location" placeholder="Accommodation Location" onChange={handleUpdateChange} />
                <input type="text" name="accommodation_type" placeholder="Accommodation Type" onChange={handleUpdateChange} />
                <input type="text" name="accommodation_capacity" placeholder="Accommodation Capacity" onChange={handleUpdateChange} />
                <input type="text" name="tenant_restriction" placeholder="Tenant Restriction" onChange={handleUpdateChange} />
                <input type="date" name="application_start_date" onChange={handleUpdateChange} />
                <input type="date" name="application_end_date" onChange={handleUpdateChange} />
                <input type="text" name="latitude" placeholder="Latitude" onChange={handleUpdateChange} />
                <input type="text" name="longitude" placeholder="Longitude" onChange={handleUpdateChange} />
                <button type="submit">Update Accommodation</button>
            </form>

            <hr />

            <h2>POST /landlord/accommodations/:id/images</h2>
            <form onSubmit={handleUploadImages}>
                <input
                    type="text"
                    placeholder="Accommodation ID"
                    value={imageAccommodationId}
                    onChange={(e) => setImageAccommodationId(e.target.value)}
                />
                <input type="file" multiple onChange={handleFileChange} />
                <button type="submit">Upload Images</button>
            </form>

            <hr />

            <h2>DELETE /landlord/accommodations/:id/images/:imageId</h2>
            <input
                type="text"
                placeholder="Accommodation ID"
                value={deleteAccommodationId}
                onChange={(e) => setDeleteAccommodationId(e.target.value)}
            />
            <input
                type="text"
                placeholder="Image ID"
                value={deleteImageId}
                onChange={(e) => setDeleteImageId(e.target.value)}
            />
            <button onClick={handleDeleteImage}>Delete Image</button>

            <hr />

            <h2>Result</h2>
            <pre
                style={{
                    backgroundColor: '#f4f4f4',
                    padding: '1rem',
                    borderRadius: '8px',
                    overflowX: 'auto',
                }}
            >
                {result ? JSON.stringify(result, null, 2) : 'No result yet.'}
            </pre>
        </div>
    );
}