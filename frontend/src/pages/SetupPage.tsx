import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/axios';

export default function Setup() {
    const navigate = useNavigate();
    
    // 1. Manage the UI state
    const [role, setRole] = useState<'Student' | 'Landlord'>('Student');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [form5Files, setForm5Files] = useState<File[]>([]);

    // 2. Manage the Form Data
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone_number: '',
        // Student specific
        studentNumber: '',
        course: '',
        college: 'UPLB',
        emergencyContactName: '',
        emergencyContactNumber: '',
        gender: '',
        form5: '',
        // Landlord specific
        company_name: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            // Convert the FileList object into a standard JavaScript Array
            setForm5Files(Array.from(e.target.files));
        }
    };

    // 3. The Submission Handler
    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        try {
            // 1. Create a native FormData object
            const payload = new FormData();
            
            // 2. Append the role
            payload.append('role', role);

            // 3. Loop through text formData and append each one
            Object.entries(formData).forEach(([key, value]) => {
                // Only append if there's an actual value (handles optional fields)
                if (value) payload.append(key, value); 
            });

            // 4. Loop through the files and append them as an array.
            // AdonisJS requires the "[]" in the key name to recognize it as an array
            form5Files.forEach((file) => {
                payload.append('form5[]', file); 
            });

            // 5. Send it to the backend. Axios will automatically set the 
            // Content-Type to 'multipart/form-data' because we passed a FormData object.
            await api.post('/setup', payload);
            
            if (role === 'Student') navigate('/dashboard/student');
            if (role === 'Landlord') navigate('/dashboard/landlord');
            
        } catch (error: any) {
            console.error("Setup error:", error);

            // 422 error for when backend rejects the frontend (aww)
            if (error.response?.status === 422) {
                const validationErrors = error.response.data.errors;
                if (validationErrors && validationErrors.length > 0) {
                    setErrorMessage(`Validation Failed: ${validationErrors[0].message} (Field: ${validationErrors[0].field})`);
                    return;
                }
            }
            setErrorMessage('Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Complete Your Profile</h2>

            {/* Error Display */}
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

            {/* Role Toggle */}
            <button type="button" onClick={() => setRole('Student')}>I am a Student</button>
            <button type="button" onClick={() => setRole('Landlord')}>I am a Landlord</button>

            {/* ─── SHARED FIELDS ─── */}
            <br /><br />
            <input type="text" name="first_name" placeholder="First Name" required onChange={handleChange} />
            <input type="text" name="last_name" placeholder="Last Name" required onChange={handleChange} />
            <input type="text" name="phone_number" placeholder="Phone Number" required onChange={handleChange} />

            {/* ─── STUDENT ONLY FIELDS ─── */}
            {role === 'Student' && (
                <>
                    <hr />
                    <h3>Student Details</h3>
                    <input type="text" name="studentNumber" placeholder="Student Number" required onChange={handleChange} />
                    <input type="text" name="course" placeholder="Degree Program" required onChange={handleChange} />
                    <input type="text" name="emergencyContactName" placeholder="Emergency Contact Name" required onChange={handleChange} />
                    <input type="text" name="emergencyContactNumber" placeholder="Emergency Contact Number" required onChange={handleChange} />
                    <input type="text" name="gender" placeholder="Gender" required onChange={handleChange} />
                    <input type="file" name="form5" placeholder="Form5 idk" required onChange={handleFileChange} />
                </>
            )}

            {/* ─── LANDLORD ONLY FIELDS ─── */}
            {role === 'Landlord' && (
                <>
                    <hr />
                    <h3>Landlord Details</h3>
                    <input type="text" name="company_name" placeholder="Company Name (Optional)" onChange={handleChange} />
                </>
            )}

            {/* ─── SUBMIT ─── */}
            <br /><br />
            <button type="submit" disabled={loading}>
                {loading ? 'Saving Profile...' : 'Complete Setup'}
            </button>
        </form>
    );
}