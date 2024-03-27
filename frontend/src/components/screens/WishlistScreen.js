import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, ListGroup, Image, Form, Button, Card } from 'react-bootstrap'
import Message from '../Message'
import { addTolikes,removeFromLikes, fetchLikesDetails } from '../../actions/likesActions'
import axios from 'axios';


function WishlistScreen({ match, location, history }) {
    const productId = match.params.id
    const qty = location.search ? Number(location.search.split('=')[1]) : 1
    const dispatch = useDispatch()

    // const [likesUuid, setlikesUuid] = useState('');
    const userLogin = useSelector(state => state.userLogin);
    const { userInfo } = userLogin;
    console.log("User Info",userInfo);
    const likes = useSelector(state => state.likes)
    const { likesItems } = likes



    // useEffect(() => {
    //     if (productId) {
    //         dispatch(addTolikes(productId, qty))
    //     }
    // }, [dispatch, productId, qty])


    useEffect(() => {
        const fetchCustomerLikesId = async () => {
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
                // Assuming the response includes the likes_id directly
                const customerlikesId = data.find(customer => customer.user_id === userInfo.id).likes_id;
                console.log("likes_ID:", customerlikesId);
                if (customerlikesId) {
                    dispatch(fetchLikesDetails(customerlikesId));
                }
            } catch (error) {
                console.error('Failed to fetch customer likes ID:', error);
            }
        };

        fetchCustomerLikesId();
    }, [userInfo, history, dispatch]);


    useEffect(() => {
        if (productId && likes.likesId) {
            dispatch(addTolikes(likes.likesId, productId, qty));
        }
    }, [dispatch, productId, qty, likes.likesId]);

    const removeFromlikesHandler = (itemId) => {
        dispatch(removeFromLikes(itemId));
    };

    const checkoutHandler = () => {
        history.push('/login?redirect=shipping')
    }

    const defaultImage = process.env.PUBLIC_URL + '/images/sample.jpg';
    return (
        <Row>
            <h1>Wishlist</h1>
            {likesItems.length === 0 ? (
                <Message variant='info'>
                    Your wishlist is empty <Link to='/'>Go Back</Link>
                </Message>
            ) : (
                    <ListGroup variant='flush'>
                        {likesItems.map(item =>{
                            console.log(item);
                            return (
                            <ListGroup.Item key={item.id}>
                                <Row className="align-items-center">
                                <Row>
                                    <Col md={2}>
                                    <Image src={item.images && item.images.length > 0 ? item.images[0].image : defaultImage} alt={item.name} fluid rounded />
                                    </Col>
                                    <Col md={3}>
                                        <Link to={`/products/${item.product}`}>{item.name}</Link>
                                    </Col>

                                    <Col md={2}>
                                        ${item.unit_price}
                                    </Col>

                                    <Col md={2}>
                                            <Form.Control
                                        as="select"
                                        value={item.qty}
                                        onChange={(e) => dispatch(addTolikes(item.product, Number(e.target.value)))}
                                        >
                                        {[...Array(item.countInStock).keys()].map((x) => (
                                            <option key={x + 1} value={x + 1}>
                                            {x + 1}
                                            </option>
                                        ))}
                                        </Form.Control>
                                    </Col>
                                    <Col md={2}> {/* New Column for Total Price */}
                                    <Col md={2}> {/* New Column for Total Price */}
                                    ${item.total_price ? item.total_price.toFixed(2) : '0.00'}
                                    </Col>
                                    </Col>

                                    <Col md={1}>
                                        <Button
                                            type='button'
                                            variant='light'
                                            onClick={() => removeFromlikesHandler(item.product)}
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

            {/* <Col md={4}>
                <Card>
                    <ListGroup variant='flush'>
                        <ListGroup.Item>
                        <h2>Summary</h2>

                        <div>Subtotal ({likesItems.reduce((acc, item) => acc + item.qty, 0)} items): 
                            ${likesItems.reduce((acc, item) => acc + item.qty * item.unit_price, 0).toFixed(2)}
                        </div>

                        <div>GST/HST (13%): 
                            ${(
                                0.13 * likesItems.reduce((acc, item) => acc + item.qty * item.unit_price, 0)
                            ).toFixed(2)}
                        </div>

                        <div>Total: 
                            ${(
                                1.13 * likesItems.reduce((acc, item) => acc + item.qty * item.unit_price, 0)
                            ).toFixed(2)}
                        </div>
                        </ListGroup.Item>
                    </ListGroup>

                    <ListGroup.Item>
                        <Button
                            type='button'
                            className='btn-block'
                            disabled={likesItems.length === 0}
                            onClick={checkoutHandler}
                        >
                            Proceed To Checkout
                        </Button>
                    </ListGroup.Item>


                </Card>
            </Col> */}
        </Row>
    )
}

export default WishlistScreen
