// CheckoutScreen.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Col, Row, Card, ListGroup, Image } from 'react-bootstrap';


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
    const [showOrderSummary, setShowOrderSummary] = useState(false);
    const { cartItems } = cart;

    const toggleOrderSummary = () => {
        setShowOrderSummary((prevShowOrderSummary) => !prevShowOrderSummary);
    };

    const [paymentMethod, setPaymentMethod] = useState('PayPal');
    const dispatch = useDispatch();

    const submitHandler = (e) => {
        e.preventDefault();
        // dispatch(saveShippingAddress({ address, city, postalCode, country }));
        history.push('/payment'); // Redirect to payment selection
    };

    return (
        <div className="d-flex justify-content-center align-items-start">
        <div style={{ maxWidth: '600px', width: '100%' }}>
            <Card className="mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center" onClick={toggleOrderSummary} style={{ cursor: 'pointer' }}>
                    {showOrderSummary ? 'Hide' : 'Show'} order summary 
                    <span className="float-right">
                        {showOrderSummary ? '▲' : '▼'}
                    </span>
                </Card.Header>
                {showOrderSummary && (
                    <ListGroup variant="flush">
                        {cartItems.map((item) => (
                            <ListGroup.Item key={item.product}>
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <Image src={item.image} alt={item.name} fluid rounded />
                                        <div className="ml-3">
                                            <div>{item.name}</div>
                                            <div className="text-muted">Qty: {item.qty}</div>
                                        </div>
                                    </div>
                                    <div>${(item.qty * item.price).toFixed(2)}</div>
                                </div>
                            </ListGroup.Item>
                        ))}
                        <ListGroup.Item>
                            <div className="d-flex">
                                <input type="text" className="form-control" placeholder="Discount code or gift card" />
                                <Button variant="outline-secondary" className="ml-2">Apply</Button>
                            </div>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <div className="d-flex justify-content-between">
                                <strong>Subtotal</strong>
                                <strong>${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                                <strong>Shipping</strong>
                                <strong>${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                                <strong>Taxes</strong>
                                <strong>${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span style={{ fontSize: '1.5em' }}>Total</span>
                                <span style={{ fontSize: '1.5em' }}>${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
                            </div>
                            {/* Repeat for Shipping, Taxes, and Total */}
                        </ListGroup.Item>
                        {/* Discount Code Input */}

                    </ListGroup>
                )}
            </Card>
        <div className="container mt-5"> {/* Adds some top margin for spacing */}
            <Form onSubmit={submitHandler} className="w-100" style={{ maxWidth: '600px', margin: '0 auto' }}> {/* Centers the form horizontally with auto margins */}
                {/* Express Checkout Section */}
                <Form.Group className="text-center mb-4">
                    <Form.Label as="legend">Express checkout</Form.Label>

                    <div className="d-flex justify-content-around"> {/* Buttons are spaced evenly */}
                        <Button variant="light" className="payment-method-button" onClick={() => setPaymentMethod('PayPal')}>
                            <img src={paypalLogo} alt="PayPal" style={{ maxWidth: '50px' }} /> {/* Ensure logos are not too large */}
                        </Button>

                        <Button variant="light" className="payment-method-button" onClick={() => setPaymentMethod('Stripe')}>
                            <img src={stripeLogo} alt="Stripe" style={{ maxWidth: '50px' }} />
                        </Button>

                        <Button variant="light" className="payment-method-button" onClick={() => setPaymentMethod('ApplePay')}>
                            <img src={applePayLogo} alt="Apple Pay" style={{ maxWidth: '50px' }} />
                        </Button>
                    </div>
                </Form.Group>

              {/* "OR" Divider with Lines */}
              <div className="d-flex align-items-center my-4">
                    <div className="flex-grow-1" style={{ height: '1px', backgroundColor: '#ccc' }}></div> {/* Left line */}
                    <span className="mx-2">OR</span> {/* "OR" text */}
                    <div className="flex-grow-1" style={{ height: '1px', backgroundColor: '#ccc' }}></div> {/* Right line */}
                </div>

             {/* Credit Card Details Section */}
             <Form.Group className="mb-4">
                    <Form.Label className="d-block">Credit Card Details</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Card Number"
                        className="mb-3"
                        required
                        // Add onChange handler as needed
                    />
                    <Row>
                        <Col>
                            <Form.Control
                                type="text"
                                placeholder="MM/YY"
                                className="mb-3"
                                required
                                // Add onChange handler as needed
                            />
                        </Col>
                        <Col>
                            <Form.Control
                                type="text"
                                placeholder="CVV"
                                required
                                // Add onChange handler as needed
                            />
                        </Col>
                    </Row>
                </Form.Group>

            {/* Address Section... */}
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

            
            <Button type='submit' variant='primary'>
                Continue
            </Button>
            </Form>
        </div>
        </div>
        </div>
    );
}

export default CheckoutScreen;
