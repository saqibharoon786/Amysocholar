import React, { useState } from 'react';
import axios from 'axios';

const PaymentForm = () => {
    const [formData, setFormData] = useState({
        amount: '',
        phoneNumber: '',
        billRef: ''
    });
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await axios.post(
                'http://localhost:5000/api/jazzcash/initiate',
                formData
            );
            
            if (response.data.success) {
                // Create a form to submit to JazzCash
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = response.data.redirectUrl;
                
                Object.keys(response.data.data).forEach(key => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = response.data.data[key];
                    form.appendChild(input);
                });
                
                document.body.appendChild(form);
                form.submit();
            }
        } catch (error) {
            console.error('Payment initiation failed:', error);
            alert('Payment initiation failed');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="payment-form">
            <h2>JazzCash Payment</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Amount (PKR):</label>
                    <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({
                            ...formData,
                            amount: e.target.value
                        })}
                        required
                    />
                </div>
                <div>
                    <label>Phone Number:</label>
                    <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({
                            ...formData,
                            phoneNumber: e.target.value
                        })}
                        required
                    />
                </div>
                <div>
                    <label>Bill Reference:</label>
                    <input
                        type="text"
                        value={formData.billRef}
                        onChange={(e) => setFormData({
                            ...formData,
                            billRef: e.target.value
                        })}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : 'Pay with JazzCash'}
                </button>
            </form>
        </div>
    );
};

export default PaymentForm;