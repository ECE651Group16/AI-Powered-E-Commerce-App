import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, ListGroup, Image, Form, Button, Card } from 'react-bootstrap'
import Message from '../Message'
import { addToCart,removeFromCart, fetchCartDetails } from '../../actions/cartActions'
import axios from 'axios';


function CartScreen({ match, location, history }) {
    const productId = match.params.id
    const qty = location.search ? Number(location.search.split('=')[1]) : 1
    const dispatch = useDispatch()

    // const [cartUuid, setCartUuid] = useState('');
    const userLogin = useSelector(state => state.userLogin);
    const { userInfo } = userLogin;
    console.log("User Info",userInfo);
    const cart = useSelector(state => state.cart)
    const { cartItems } = cart
    // const cartId = "yourCartIdHere"; 


    const GST_RATE = 0.05; // 5% GST for example purposes
    const HST_RATE = 0.13; // 13% HST for Ontario
    
    // useEffect(() => {
    //     if (productId) {
    //         dispatch(addToCart(productId, qty))
    //     }
    // }, [dispatch, productId, qty])


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


    useEffect(() => {
        if (productId && cart.cartId) {
            dispatch(addToCart(cart.cartId, productId, qty));
        }
    }, [dispatch, productId, qty, cart.cartId]);

    const removeFromCartHandler = (itemId) => {
        dispatch(removeFromCart(itemId));
    };

    const checkoutHandler = () => {
        history.push('/login?redirect=payments')
    }

    // Action to update cart item quantity in the database
    // const updateCartItemQuantity = (cartId, productId, qty) => async (dispatch, getState) => {
    //     try {
    //         const { userInfo } = getState().userLogin;
    //         const config = {
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 Authorization: `Bearer ${userInfo.token}`,
    //             },
    //         };

    //         await axios.put('/api/cart/update-item', { cartId, productId, qty }, config);

    //         dispatch({
    //             type: CART_UPDATE_ITEM,
    //             payload: { productId, qty },
    //         });

    //         // Optionally, refresh the cart details after update
    //         dispatch(fetchCartDetails(cartId));
    //     } catch (error) {
    //         console.error('Failed to update cart item quantity', error);
    //         // Handle error (e.g., dispatch an error action)
    //     }
    // };
    const defaultImage = process.env.PUBLIC_URL + '/images/sample.jpg';
    return (
        <Row className="justify-content-center">
            <Col md={8}>
                <h1>Shopping Cart</h1>
                {cartItems.length === 0 ? (
                    <Message variant='info'>
                        Your cart is empty <Link to='/'>Go Back</Link>
                    </Message>
                ) : (
                        <ListGroup variant='flush'>
                            {cartItems.map(item =>{
                                console.log(item);
                                return (
                                <ListGroup.Item key={item.id}>
                                    <Row className="align-items-center">
                                    <Row>
                                        <Col md={2} className="d-flex align-items-center justify-content-center">
                                        <Image src={item.images && item.images.length > 0 ? item.images[0].image : defaultImage} alt={item.name} fluid rounded />
                                        </Col>
                                        <Col md={3} className="d-flex align-items-center">
                                            <Link to={`/products/${item.product}`}>{item.name}</Link>
                                        </Col>

                                        <Col md={2} className="d-flex align-items-center justify-content-center">
                                            ${item.unit_price}
                                        </Col>

                                        <Col md={2} className="d-flex align-items-center justify-content-center">
                                             <Form.Control
                                            as="select"
                                            value={item.qty}
                                            onChange={(e) => dispatch(addToCart(item.product, Number(e.target.value)))}
                                            >

                                            {/* <Form.Control
                                                as="select"
                                                value={item.qty}
                                                onChange={(e) => dispatch(updateCartItemQuantity(cart.cartId, item.product, Number(e.target.value)))}
                                            >
                                                {[...Array(item.countInStock).keys()].map((x) => (
                                                    <option key={x + 1} value={x + 1}>
                                                        {x + 1}
                                                    </option>
                                                ))}
                                            </Form.Control> */}

                                            {[...Array(item.countInStock).keys()].map((x) => (
                                                <option key={x + 1} value={x + 1}>
                                                {x + 1}
                                                </option>
                                            ))}
                                            </Form.Control>
                                        </Col>
                                        
                                        <Col md={2} className="d-flex align-items-center justify-content-center"> {/* New Column for Total Price */}
                                        ${item.total_price ? item.total_price.toFixed(2) : '0.00'}
                                        </Col>
                                        

                                        <Col md={1} className="d-flex align-items-center justify-content-center">
                                            <Button
                                                type='button'
                                                variant='light'
                                                onClick={() => removeFromCartHandler(item.product)}
                                            >
                                                <i className='fas fa-trash'></i>
                                            </Button>
                                        </Col>
                                    </Row>
                                    </Row>
                                </ListGroup.Item>
                            )}
                            )}
                        </ListGroup>
                    )}
            </Col>

            <Col md={4}>
            <Card className="mx-auto" style={{ width: 'auto' }}>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                        <h2>Summary</h2>
                        {/* Subtotal */}
                        <div>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items): 
                            ${cartItems.reduce((acc, item) => acc + item.qty * item.unit_price, 0).toFixed(2)}
                        </div>
                        {/* GST/HST Calculation */}
                        <div>GST/HST (13%): 
                            ${(
                                0.13 * cartItems.reduce((acc, item) => acc + item.qty * item.unit_price, 0)
                            ).toFixed(2)}
                        </div>
                        {/* Final Price */}
                        <div>Total: 
                            ${(
                                1.13 * cartItems.reduce((acc, item) => acc + item.qty * item.unit_price, 0)
                            ).toFixed(2)}
                        </div>
                        </ListGroup.Item>
                    </ListGroup>

                    <ListGroup.Item>
                        <Button
                            type='button'
                            className='btn-block'
                            disabled={cartItems.length === 0}
                            onClick={checkoutHandler}
                        >
                            Proceed To Checkout
                        </Button>
                    </ListGroup.Item>


                </Card>
            </Col>
        </Row>
    )
}

export default CartScreen
