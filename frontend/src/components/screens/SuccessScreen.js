
import React from 'react';
import { useLocation } from 'react-router-dom';

const SuccessScreen = () => {
    // Extract the session ID from the URL if needed for verification or display
    const location = useLocation();
    const sessionId = new URLSearchParams(location.search).get('session_id');

    return (
        <div className="success-screen">
            <h2>Thanks for your order!</h2>
            <p>We appreciate your business. If you have any questions, please email <a href="mailto:support@example.com">support@example.com</a>.</p>
            {/* Optionally display the session ID or other transaction details */}
            {sessionId && <p>Your session ID: {sessionId}</p>}
        </div>
    );
};

export default SuccessScreen;
