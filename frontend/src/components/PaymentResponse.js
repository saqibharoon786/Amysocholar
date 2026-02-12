import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const PaymentResponse = () => {
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    
    useEffect(() => {
        const handleResponse = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const responseData = {};
                
                // Convert URL params to object
                for (const [key, value] of params.entries()) {
                    responseData[key] = value;
                }
                
                // Send to backend for verification
                const res = await axios.post(
                    'http://localhost:5000/api/jazzcash/response',
                    responseData
                );
                
                setResponse(res.data);
            } catch (error) {
                console.error('Error processing response:', error);
                setResponse({
                    success: false,
                    message: 'Error processing payment response'
                });
            } finally {
                setLoading(false);
            }
        };
        
        handleResponse();
    }, [location]);
    
    if (loading) return <div>Processing payment...</div>;
    
    return (
        <div className="payment-response">
            {response.success ? (
                <div className="success">
                    <h2>Payment Successful!</h2>
                    <p>{response.message}</p>
                    <p>Transaction ID: {response.data.pp_TxnRefNo}</p>
                </div>
            ) : (
                <div className="error">
                    <h2>Payment Failed</h2>
                    <p>{response.message}</p>
                </div>
            )}
        </div>
    );
};

export default PaymentResponse;