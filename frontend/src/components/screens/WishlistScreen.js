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

    const addToCartHandler = async()=>{
        // if (!userInfo) {
        //   history.push('/login');
        //   return;
        // }
        // try {
        //   let currentCartId = cartUuid; // Assuming this state holds the current user's cart ID
      
        //   // If the user does not have a cart ID, create a new cart
        //   if (!currentCartId) {
        //     const config = {
        //       headers: {
        //         'Authorization': `JWT ${userInfo.accessToken}`, 
        //       },
        //     };
        //     const { data } = await axios.post('/store/carts/', {}, config);
        //     currentCartId = data.id; // Assuming the response includes the cart ID
        //     // console.log(currentCartId,"not id");
        //     // Optionally, update the cartUuid state or redux store with the new cart ID
        //   }
      
        //   // Add the product to the cart
        //   if (currentCartId) {
        //     const config = {
        //       headers: {
        //         'Authorization': `JWT ${userInfo.accessToken}`, 
        //       },
        //     };
        //     // const response = await axios.get(`/store/products/${id}/`, config);
        //     // const product_data = response.data; // This is the correct way to access the returned data
        //     // console.log(`/store/products/${id}/`, product_data);
        //     const postData = {
        //       product_id: id, // id from useParams()
        //       quantity: qty,
        //     };
    
        //     console.log("POST data",postData);
        //     await axios.post(`/store/carts/${currentCartId}/items/`, postData, config);
            
        //     // Redirect to cart page or show success message
        //     history.push('/cart');
        //   }
        // } catch (error) {
        //   console.error('Failed to add item to cart:', error);
        //   // Handle error, e.g., show error message
        // }
        history.push(`/cart/`)
     }

    const defaultImage = process.env.PUBLIC_URL + '/images/sample.jpg';
    return (
        <Row>
            <Col>
                <h1>Wishlist</h1>
                {likesItems.length === 0 ? (
                    <Message variant='info'>
                        Your cart is empty <Link to='/'>Go Back</Link>
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
                                    onClick={addToCartHandler}
                                >
                                    Add to Cart
                                </Button>
                                </Col>
                                <Col md={1} className="d-flex align-items-center justify-content-center">
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
            </Col>

            </Row>
    )
}

export default WishlistScreen
