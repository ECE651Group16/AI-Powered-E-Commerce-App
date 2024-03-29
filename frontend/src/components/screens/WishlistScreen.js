import React, { useEffect, useState } from 'react'
import { Link, useParams, useHistory  } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, ListGroup, Image, Form, Button, Card } from 'react-bootstrap'
import Message from '../Message'
import { addTolikes,removeFromLikes, fetchLikesDetails } from '../../actions/likesActions'
import axios from 'axios';


function WishlistScreen({ match, location, history }) {
    // const { id } = useParams();
    // console.log("Wishlist ID from URL:", id); 
    const productId = match.params.id
    const qty = location.search ? Number(location.search.split('=')[1]) : 1
    const dispatch = useDispatch()
    const [cartUuid, setCartUuid] = useState('');
    // const [likesUuid, setlikesUuid] = useState('');
    const userLogin = useSelector(state => state.userLogin);
    const { userInfo } = userLogin;
    console.log("User Info",userInfo);
    const likes = useSelector(state => state.likes)
    const { likesItems } = likes

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
                const customerLikesId = data.find(customer => customer.user_id === userInfo.id).likes_id;
                console.log("cartID:", customerCartId);
                console.log("likes_ID:", customerLikesId);
                if (customerCartId) {
                    setCartUuid(customerCartId);
                    console.log('Cart ID fetched:', customerCartId);
                  } else {
                    console.log('No cart ID found for the current user.');
                  }
                if (customerLikesId) {
                    dispatch(fetchLikesDetails(customerLikesId));
                }
            } catch (error) {
                console.error('Failed to fetch customer cart ID:', error);
            }
        };

        fetchCustomerCartId();
    }, [userInfo, history, dispatch]);



    // useEffect(() => {
    //     const fetchCustomerLikesId = async () => {
    //         if (!userInfo) {
    //             history.push('/login');
    //             return;
    //         }
    //         try {
    //             const config = {
    //                 headers: {
    //                     'Authorization': `JWT ${userInfo.accessToken}`, 
    //                 },
    //             };
    //             console.log("Getting /store/customers/ with key", `JWT ${userInfo.accessToken}`);
    //             const { data } = await axios.get('/store/customers/', config);
    //             // Assuming the response includes the likes_id directly
    //             const customerlikesId = data.find(customer => customer.user_id === userInfo.id).likes_id;
    //             console.log("likes_ID:", customerlikesId);
    //             if (customerlikesId) {
    //                 dispatch(fetchLikesDetails(customerlikesId));
    //             }
    //         } catch (error) {
    //             console.error('Failed to fetch customer likes ID:', error);
    //         }
    //     };

    //     fetchCustomerLikesId();
    // }, [userInfo, history, dispatch]);


    useEffect(() => {
        console.log("Product ID:", productId);
        console.log("likes ID:", likes.likesId);
        console.log("likes", likes);
        if (productId && likes.likesId) {
            dispatch(addTolikes(likes.likesId, productId, qty));
        }
    }, [dispatch, productId, qty, likes.likesId]);

    const removeFromlikesHandler = (itemId) => {
        dispatch(removeFromLikes(itemId));
    };

    const addToCartHandler = async (productId) => {
        if (!userInfo) {
            history.push('/login');
            return;
        }
        
        try {
            // Add the product to the cart
            const config = {
                headers: {
                    'Authorization': `JWT ${userInfo.accessToken}`,
                },
            };
            let currentCartId = cartUuid;
            if (!currentCartId){
                console.log("NO CartId, reading customer info");
                const customerResponse = await axios.get('/store/customers/', config);
                const customerDetails = customerResponse.data.find(customer => customer.user_id === userInfo.id);
                console.log(customerDetails);
                currentCartId = customerDetails.cart_id;
                console.log("CART ID:", currentCartId);
            }
            if (!currentCartId){
                console.log("NO CartId, creating one");
                const { data } = await axios.post('/store/carts/', {}, config);
                currentCartId = data.id; 
                console.log("Cart created:", currentCartId);
            }
            if(!currentCartId){
                console.error("No Cart Id");
                return;
            }
            const postData = {
                product_id: productId, // Assuming the product ID to add to cart
                quantity: 1, // Assuming a default quantity of 1
            };
    
            await axios.post(`/store/carts/${currentCartId}/items/`, postData, config);
    
            console.log(`Product ${productId} added to cart ${currentCartId}`);
    
            // Remove the item from the wishlist after adding it to the cart
            dispatch(removeFromLikes(productId));
    
            // Optionally, refresh the page or redirect to the cart page
            history.push('/cart');
    
        } catch (error) {
            console.error('Failed to add item to cart:', error.response ? error.response.data : error);
            // Handle error, e.g., show error message
        }
    };

    const defaultImage = process.env.PUBLIC_URL + '/images/sample.jpg';
    return (
        <Row>
            <Col>
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
                                <Col md={3} className="d-flex align-items-center justify-content-center">
                                <Image src={item.images && item.images.length > 0 ? item.images[0].image : defaultImage} alt={item.name} fluid rounded />
                                </Col>
                                <Col md={3} className="d-flex align-items-center">
                                    <Link to={`/products/${item.product}`}>{item.name}</Link>
                                </Col>
                                <Col md={1} className="d-flex align-items-center justify-content-center">
                                    ${item.unit_price}
                                </Col>
                                <Col md={2}className="d-flex align-items-center justify-content-center">
                                <Button
                                    type='button'
                                    className='btn-block'
                                    onClick={() => addToCartHandler(item.product)} // Use the item's product ID
                                >
                                    Add to Cart
                                </Button>
                                </Col>
                                <Col md={1} className="d-flex align-items-center justify-content-center">
                                    <Button
                                        type='button'
                                        variant='light'
                                        disabled={likesItems.length === 0}
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
            </Col>

            </Row>
    )
}

export default WishlistScreen
