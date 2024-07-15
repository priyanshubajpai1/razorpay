import React, { useState } from 'react';

const RazorpayPayment = () => {
    const [amount, setAmount] = useState(null);
    const [orderId, setOrderId] = useState(null);
    const BEARER_TOKEN = 'your_hard_coded_bearer_token';

    const fetchRazorpayKey = async () => {
        try {
        const response = await fetch('https://api.testbuddy.live/v1/payment/key', {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            console.log('Razorpay Key fetched:', data.key);
            return data.key;
        } 
        else {
            console.error('Failed to fetch Razorpay key:', data.message);
            alert('Failed to fetch Razorpay key: ' + data.message);
        }
        } 
        catch (error) {
        console.error('Error fetching Razorpay key:', error);
        alert('Error fetching Razorpay key');
        }
    };

    const createOrder = async (key) => {
        try {
        const response = await fetch('https://api.testbuddy.live/v1/order/create', {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            packageId: '6613d6fbbf1afca9aa1b519e',
            pricingId: '662caa2d50bf43b5cef75232',
            finalAmount: 441,
            couponCode: 'NEET25'
            })
        });
        const data = await response.json();
        if (response.ok) {
            console.log('Order created:', data);
            setOrderId(data._id);
            initializePayment(key, data._id, data.finalAmount);
        } 
        else {
            console.error('Failed to create order:', data.message);
            alert('Failed to create order: ' + data.message);
        }
        } 
        catch (error) {
        console.error('Error creating order:', error);
        alert('Error creating order');
        }
    };

    const initializePayment = (key, orderId, amount) => {
        const options = {
        key,
        amount: amount * 100,
        currency: 'INR',
        order_id: orderId,
        handler: function (response) {
            console.log(response);
            verifyOrder(orderId, response.razorpay_payment_id, response.razorpay_signature);
        },
        prefill: {
            name: 'Test User',
            email: 'testuser@example.com',
            contact: '9999999999'
        },
        theme: {
            color: '#3399cc'
        }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response) {
        console.error(response.error);
        alert('Payment failed: ' + response.error.description);
        });

        rzp1.open();
    };

    const verifyOrder = async (transactionId, razorpayPaymentId, razorpaySignature) => {
        try {
        const response = await fetch('https://api.testbuddy.live/v1/order/verify', {
            method: 'POST',
            headers: {
            'Authorization': `Bearer ${BEARER_TOKEN}`,
            'Content-Type': 'application/json'
            },
            body: JSON.stringify({
            transactionId,
            razorpayPaymentId,
            razorpaySignature
            })
        });
        const data = await response.json();
        if (response.ok) {
            console.log('Order verified:', data);
            alert('Order verified successfully!');
        } else {
            console.error('Failed to verify order:', data.message);
            alert('Failed to verify order: ' + data.message);
        }
        } catch (error) {
        console.error('Error verifying order:', error);
        alert('Error verifying order');
        }
    };

    const handlePayNowClick = async () => {
        const key = await fetchRazorpayKey();
        if (key) {
        createOrder(key);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="bg-gray-400 p-8 rounded shadow-md w-80">
            <h2 className="text-2xl font-bold mb-4">Payment</h2>
            <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Enter amount"
            className="border p-2 mb-4 w-full"
            />
            <button
            onClick={handlePayNowClick}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
            Pay Now
            </button>
            {orderId && (
            <div className="mt-4">
                <p className="text-sm text-gray-700">Order ID: {orderId}</p>
            </div>
            )}
        </div>
        </div>
    );
};

export default RazorpayPayment;
