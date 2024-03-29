// CheckoutScreen.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Col, Row } from 'react-bootstrap';
// import { saveShippingAddress } from '../../actions/cartActions'; // You need to implement this

// import paypalLogo from '../../assets/paypal.png'; // Path to PayPal logo
// import stripeLogo from '../../assets/stripe.png'; // Path to Stripe logo
// import applePayLogo from '../../assets/applepay.png'; // Path to Apple Pay logo

import paypalLogo from '../../images/phone.jpg'; // Path to PayPal logo
import stripeLogo from '../../images/phone.jpg'; // Path to Stripe logo
import applePayLogo from '../../images/phone.jpg'; // Path to Apple Pay logo

function CheckoutScreen({ history }) {
    const cart = useSelector(state => state.cart);
    const { shippingAddress } = cart;

    // const [address, setAddress] = useState(shippingAddress.address || '');
    // const [city, setCity] = useState(shippingAddress.city || '');
    // const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    // const [country, setCountry] = useState(shippingAddress.country || '');
    const [paymentMethod, setPaymentMethod] = useState('PayPal');
    const dispatch = useDispatch();

    const submitHandler = (e) => {
        e.preventDefault();
        // dispatch(saveShippingAddress({ address, city, postalCode, country }));
        history.push('/payment'); // Redirect to payment selection
    };

    return (
        <Form onSubmit={submitHandler}>
            <Form.Group controlId='address'>
                <Form.Label>Address</Form.Label>
                <Form.Control
                    type='text'
                    placeholder='Enter address'
                    // value={address}
                    // required
                    // onChange={(e) => setAddress(e.target.value)}
                ></Form.Control>
            </Form.Group>

            <Form.Group controlId='city'>
                <Form.Label>City</Form.Label>
                <Form.Control
                    type='text'
                    placeholder='Enter city'
                    // value={city}
                    // required
                    // onChange={(e) => setCity(e.target.value)}
                ></Form.Control>
            </Form.Group>

            <Form.Group controlId='postalCode'>
                <Form.Label>PostalCode</Form.Label>
                <Form.Control
                    type='text'
                    placeholder='Enter postalCode'
                    // value={postalCode}
                    // required
                    // onChange={(e) => setPostalCode(e.target.value)}
                ></Form.Control>
            </Form.Group>
            <Form.Group controlId='country'>
                <Form.Label>Country</Form.Label>
                <Form.Control
                    type='text'
                    placeholder='Enter country'
                    // value={country}
                    // required
                    // onChange={(e) => setCountry(e.target.value)}
                ></Form.Control>
            </Form.Group>
            {/* Add similar Form.Group components for city, postalCode, and country */}

            <Form.Group>
            <Form.Label as="legend">Payment Method</Form.Label>
            <Col>
            <div className="payment-methods">
            <Button
                variant="light"
                className="payment-method-button"
                onClick={() => setPaymentMethod('PayPal')}
            >
                <img src={paypalLogo} alt="PayPal" />
            </Button>
            
            <Button
                variant="light"
                className="payment-method-button"
                onClick={() => setPaymentMethod('Stripe')}
            >
                <img src={stripeLogo} alt="Stripe" />
            </Button>
            
            <Button
                variant="light"
                className="payment-method-button"
                onClick={() => setPaymentMethod('ApplePay')}
            >
                <img src={applePayLogo} alt="Apple Pay" />
            </Button>
            </div>

            </Col>
            </Form.Group>
            <Button type='submit' variant='primary'>
                Continue
            </Button>
        </Form>
    );
}

export default CheckoutScreen;
