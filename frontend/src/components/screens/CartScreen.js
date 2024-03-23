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

    const [cartUuid, setCartUuid] = useState('');
    const userLogin = useSelector(state => state.userLogin);
    const { userInfo } = userLogin;
    console.log("User Info",userInfo);
    const cart = useSelector(state => state.cart)
    const { cartItems } = cart

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
                console.log(customerCartId);
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

    const removeFromCartHandler = (id) => {
        dispatch(removeFromCart(id))
    }
    const checkoutHandler = () => {
        history.push('/login?redirect=shipping')
    }

    const defaultImage = process.env.PUBLIC_URL + '/images/sample.jpg';
    return (
        <Row>
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
                                    <Row>
                                        <Col md={2}>
                                        <Image src={item.product.images && item.product.images.length > 0 ? item.product.images[0].image : defaultImage} alt={item.product.title} fluid rounded />
                                        </Col>
                                        <Col md={3}>
                                            <Link to={`/products/${item.product.id}`}>{item.name}</Link>
                                        </Col>

                                        <Col md={2}>
                                            ${item.price}
                                        </Col>

                                        <Col md={3}>
                                             <Form.Control
                                            as="select"
                                            value={item.qty}
                                            onChange={(e) => dispatch(addToCart(item.product.id, Number(e.target.value)))}
                                            >
                                            {[...Array(item.countInStock).keys()].map((x) => (
                                                <option key={x + 1} value={x + 1}>
                                                {x + 1}
                                                </option>
                                            ))}
                                            </Form.Control>
                                        </Col>

                                        <Col md={1}>
                                            <Button
                                                type='button'
                                                variant='light'
                                                onClick={() => removeFromCartHandler(item.product)}
                                            >
                                                <i className='fas fa-trash'></i>
                                            </Button>
                                        </Col>
                                    </Row>
                                </ListGroup.Item>
                            )}
                            )}
                        </ListGroup>
                    )}
            </Col>

            <Col md={4}>
                <Card>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                            <h2>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) items</h2>
                            ${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}
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
