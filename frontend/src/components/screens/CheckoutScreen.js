// CheckoutScreen.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Button, Col, Row, Card, ListGroup, Image } from 'react-bootstrap';
import { addToCart,removeFromCart, fetchCartDetails } from '../../actions/cartActions';
import axios from 'axios';
import { useHistory, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import QueryString from "query-string";
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// import { saveShippingAddress } from '../../actions/cartActions'; // You need to implement this

// import paypalLogo from '../../assets/paypal.png'; // Path to PayPal logo
// import shopLogo from '../../assets/shop.png'; // Path to shop logo
// import applePayLogo from '../../assets/applepay.png'; // Path to Apple Pay logo

import paypalLogo from '../../images/paypl.png'; // Path to PayPal logo
import shopLogo from '../../images/shop.jpg'; // Path to shop logo
import applePayLogo from '../../images/apple.jpg'; // Path to Apple Pay logo

function CheckoutScreen() {
    const dispatch = useDispatch();
    const history = useHistory();
    const [message, setMessage] = useState("");
    
    const userLogin = useSelector(state => state.userLogin);
    const { userInfo } = userLogin;
    console.log("User Info",userInfo);

    const cart = useSelector(state => state.cart)
    const { cartItems } = cart;
    const { shippingAddress } = cart;
    console.log("Checkout Cart",cart);

    // const [address, setAddress] = useState(shippingAddress.address || '');
    // const [city, setCity] = useState(shippingAddress.city || '');
    // const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    // const [country, setCountry] = useState(shippingAddress.country || '');
    const [showOrderSummary, setShowOrderSummary] = useState(false);
    

    const toggleOrderSummary = () => {
        setShowOrderSummary((prevShowOrderSummary) => !prevShowOrderSummary);
    };

    const [paymentMethod, setPaymentMethod] = useState('PayPal');

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

    const defaultImage = process.env.PUBLIC_URL + '/images/sample.jpg';
    const calculateSubtotal = () => cartItems.reduce((acc, item) => acc + item.qty * item.unit_price, 0).toFixed(2);
    const calculateShipping = () => {
        // Assuming shippingAddress is part of your cart or user state and contains a 'country' field
        const { shippingAddress } = cart;
    
        // Check if country is Canada or US
        if (shippingAddress && (shippingAddress.country === 'Canada' || shippingAddress.country === 'US')) {
            return 'Free Shipping';
        } else {
            // Implement your shipping cost calculation for other countries
            return 10.00; // Placeholder for shipping cost outside Canada and US
        }
    };
    const calculateTaxes = (subtotal) => {
        const shippingCost = calculateShipping(); 
        // Assuming a tax rate, for simplicity
        if (shippingAddress && (shippingAddress.country === 'Canada')){
            const TAX_RATE = 0.13; // 13% tax rate as an example
            const tax = (subtotal+'Free Shipping' ? 0 : parseFloat(shippingCost)) * TAX_RATE;
            return tax.toFixed(2);
        }
        else{
            const TAX_RATE = 0.13; // 13% tax rate as an example
            return (subtotal * TAX_RATE).toFixed(2);
        }
        
        
    };
    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const shippingCost = calculateShipping(); // Update this to ensure it returns a numeric value for shipping
        const taxes = calculateTaxes(subtotal);
    
        // Ensure all values are numeric. Convert 'Free Shipping' to 0 for calculation.
        const numericShippingCost = shippingCost === 'Free Shipping' ? 0 : parseFloat(shippingCost);
        const numericSubtotal = parseFloat(subtotal);
        const numericTaxes = parseFloat(taxes);
    
        // Ensure all components of total are numeric before summing
        if (!isNaN(numericShippingCost) && !isNaN(numericSubtotal) && !isNaN(numericTaxes)) {
            const total = numericSubtotal + numericShippingCost + numericTaxes;
            return total.toFixed(2); // This should now always work, as total is guaranteed to be numeric
        } else {
            console.error("One or more components of the total are not numeric", {numericSubtotal, numericShippingCost, numericTaxes});
            return 'Error calculating total'; // Or handle this scenario as appropriate for your app
        }
    };

    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const taxes = calculateTaxes(subtotal);
    const total = calculateTotal(subtotal, shipping, taxes);
    
    const location = useLocation();

    //strip checkout
    useEffect(() => {
        // Check to see if this is a redirect back from Checkout
        // const query = new URLSearchParams(window.location.search);
        const values = QueryString.parse(location.search);
        if (values.success) { // query.get("success")
          console.log("Order placed! You will receive an email confirmation.");
        }
    
        if (values.cancled) { //query.get("canceled")
          console.log(
            "Order canceled -- continue to shop around and checkout when you're ready."
          );
        }
        }, []);

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
                        {cartItems.map((item, index) => (
                            /* STYLE 1*/
                            // <ListGroup.Item key={index}>
                            //     <div className="d-flex justify-content-between">
                            //         <div className="d-flex">
                            //             <Image src={item.images.length > 0 ? item.images[0].image : defaultImage} alt={item.name}  style={{ width: '50px', height: '50px', objectFit: 'cover' }}/>
                            //             <div className="ml-3" style={{ marginLeft: '20px' }}>
                            //                 <p>{item.name}</p>
                            //                 <p>Qty: {item.qty}</p>
                            //             </div>
                            //         </div>
                            //         <div>${item.total_price.toFixed(2)}</div>
                            //     </div>
                            // </ListGroup.Item>
                            /* STYLE 2*/
                            <ListGroup.Item key={index}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div style={{ position: 'relative' }}>
                                    <Image src={item.images.length > 0 ? item.images[0].image : defaultImage} alt={item.name} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                                    <span style={{
                                        position: 'absolute',
                                        top: '-15px', // Half the height of the sticker to move it up
                                        right: '-15px', // Half the width of the sticker to move it to the right
                                        backgroundColor: 'rgba(90,90,90,0.8)',
                                        borderRadius: '50%',
                                        width: '30px',
                                        height: '30px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        color: 'white',
                                    }}>
                                        {item.qty}
                                    </span>
                                </div>
                                <div className="ml-3" style={{ marginLeft: '15px' }}>
                                    <p>{item.name}</p>
                                </div>
                                <div>${item.total_price.toFixed(2)}</div>
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
                                <strong>${subtotal}</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                                <strong>Shipping</strong>
                                <strong>${shipping}</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                                <strong>Taxes</strong>
                                <strong>${taxes}</strong>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span style={{ fontSize: '1.5em' }}>Total</span>
                                <span style={{ fontSize: '1.5em' }}>${total}</span>
                            </div>
                            {/* Repeat for Shipping, Taxes, and Total */}
                        </ListGroup.Item>
                        {/* Discount Code Input */}

                    </ListGroup>
                )}
            </Card>


        <div className="container mt-5"> {/* Adds some top margin for spacing */}
            {/* <Form onSubmit={submitHandler} className="w-100" style={{ maxWidth: '600px', margin: '0 auto' }}> */}
            <h3>Shipping Details</h3>
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

             {/* </Form> */}

             <div style={{ height: '2rem' }}></div> {/* Adjust '2rem' to the amount of space you want */}                        


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

               
           

            <Card className="mb-3">
                <Card.Body>
                <Card.Title>Credit / Debit Card Payment</Card.Title>
                <Card.Text className="text-muted" style={{ fontSize: '1rem' }}>
                    All transactions are secure and encrypted. Powered by Stripe.
                </Card.Text>
                {/* <div className="mt-4">
                    <Elements stripe={stripePromise}>
                    <CheckoutForm />
                    </Elements>
                </div> */}
                </Card.Body>
            </Card>
            {/* {message ? (
                    <p>{message}</p>
                ) : (
                    <Button onClick={handleCheckout}>Proceed to Payment</Button>
                )} */}

                <section>
                {/* <div className="product">
                    <img
                    src="https://i.imgur.com/EHyR2nP.png"
                    alt="The cover of Stubborn Attachments"
                    />
                    <div className="description">
                    <h3>Stubborn Attachments</h3>
                    <h5>$20.00</h5>
                    </div>
                </div> */}
                <form action="/api/stripe/create-checkout-session" method="POST">
                    <button className="checkout-button" type="submit">
                    Proceed to Payment
                    </button>
                </form>
                </section>
            
        </div>
        </div>
        </div>
    );
}

export default CheckoutScreen;
