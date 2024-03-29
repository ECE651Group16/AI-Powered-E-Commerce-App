// CheckoutScreen.js
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Col, Row, Card, ListGroup, Image } from 'react-bootstrap';
import { addToCart,removeFromCart, fetchCartDetails } from '../../actions/cartActions';
import axios from 'axios';


// import { saveShippingAddress } from '../../actions/cartActions'; // You need to implement this

// import paypalLogo from '../../assets/paypal.png'; // Path to PayPal logo
// import shopLogo from '../../assets/shop.png'; // Path to shop logo
// import applePayLogo from '../../assets/applepay.png'; // Path to Apple Pay logo

import paypalLogo from '../../images/paypl.png'; // Path to PayPal logo
import shopLogo from '../../images/shop.jpg'; // Path to shop logo
import applePayLogo from '../../images/apple.jpg'; // Path to Apple Pay logo

function CheckoutScreen({ history }) {
    
    const userLogin = useSelector(state => state.userLogin);
    const { userInfo } = userLogin;
    console.log("User Info",userInfo);



    // const [address, setAddress] = useState(shippingAddress.address || '');
    // const [city, setCity] = useState(shippingAddress.city || '');
    // const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    // const [country, setCountry] = useState(shippingAddress.country || '');
    const [showOrderSummary, setShowOrderSummary] = useState(false);

    const cart = useSelector(state => state.cart)
    const { cartItems } = cart;
    const { shippingAddress } = cart;
    console.log("Checkout Cart",cart);

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

    useEffect(() => {
        const fetchCustomerCartId = async () => {
            if (!userInfo) {
                history.push('/login');
                return;
            }
            try {
                const config = {
                    headers: {
                        'Authorization': `JWT ${userInfo.accessToken}`, 
                    },
                };
                console.log("Getting /store/customers/ with key", `JWT ${userInfo.accessToken}`);
                const { data } = await axios.get('/store/customers/', config);
                // Assuming the response includes the cart_id directly
                const customerCartId = data.find(customer => customer.user_id === userInfo.id).cart_id;
                console.log("cartID:", customerCartId);
                if (customerCartId) {
                    dispatch(fetchCartDetails(customerCartId));
                }
            } catch (error) {
                console.error('Failed to fetch customer cart ID:', error);
            }
        };

        fetchCustomerCartId();
    }, [userInfo, history, dispatch]);
    

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
                        {/* {cartItems.map((item) => (
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
                        ))} */}
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
            <Form onSubmit={submitHandler} className="w-100" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Form.Group className="text-center mb-4">
                <Form.Label as="legend">Express checkout</Form.Label>
                <div className="d-flex justify-content-around">
                    <Button variant="light" className="payment-method-button" onClick={() => setPaymentMethod('PayPal')}>
                        <img src={paypalLogo} alt="PayPal" style={{ maxWidth: '600px' }} />
                    </Button>

                    <Button variant="light" className="payment-method-button" onClick={() => setPaymentMethod('shop')}>
                        <img src={shopLogo} alt="shop" style={{ maxWidth: '600px' }} />
                    </Button>

                    <Button variant="light" className="payment-method-button" onClick={() => setPaymentMethod('ApplePay')}>
                        <img src={applePayLogo} alt="Apple Pay" style={{ maxWidth: '600px' }} />
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
