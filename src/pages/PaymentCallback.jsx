
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Verifying...');

    useEffect(() => {
        const verify = async () => {
            const reference = searchParams.get('reference'); // Paystack sends ?reference=...
            if (!reference) {
                setStatus('Failed: No reference found.');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:5000/api/paystack/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ reference })
                });

                const data = await res.json();

                if (res.ok && data.success) {
                    setStatus('Success! Upgrading your account...');
                    setTimeout(() => navigate('/dashboard'), 2000);
                } else {
                    setStatus('Verification Failed: ' + (data.error || 'Unknown Error'));
                    setTimeout(() => navigate('/upgrade'), 3000);
                }

            } catch (err) {
                setStatus('Error: ' + err.message);
            }
        };

        verify();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
            <h2 className="text-xl font-semibold">{status}</h2>
        </div>
    );
};

export default PaymentCallback;
