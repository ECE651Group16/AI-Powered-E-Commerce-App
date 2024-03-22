import React,{useState,useEffect} from "react";
import { Carousel } from 'react-bootstrap';
import { Link, useParams, useHistory  } from "react-router-dom";
import { Row, Col, Image, ListGroup, Button, Card,Form } from "react-bootstrap";
import Rating from "../Rating";
import Loader from '../Loader';
import Message from '../Message';
import axios from 'axios';
import { useDispatch, useSelector } from "react-redux";
import { listProductDetails } from "../../actions/productAction";
import { productDetailsReducers } from "../../reducers/productReducers";

function ProductScreen({ match,history }) {
  const { id } = useParams();
  const [qty,setQty] = useState(1)
  const dispatch = useDispatch();
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const [cartUuid, setCartUuid] = useState('');
  const productDetails = useSelector((state) => state.productDetails);
  const { loading, error, product } = productDetails;
  const defaultImage = process.env.PUBLIC_URL + '/images/sample.jpg';

  // Function to go back to the previous page
  const goBackHandler = () => {
    history.goBack();
  };

  useEffect(()=>{
    dispatch(listProductDetails(match.params.id));



  },[dispatch,match]);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!userInfo) {
        console.log('User is not logged in');
        return;
      }
  
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.get('/store/customers/', config);
        const customerDetails = data.find(customer => customer.user_id === userInfo.id); // Assuming userInfo.id holds the user ID
        if (customerDetails && customerDetails.cart_id) {
          setCartUuid(customerDetails.cart_id);
          console.log('Cart ID fetched:', customerDetails.cart_id);
        } else {
          console.log('No cart ID found for the current user.');
        }
      } catch (error) {
        console.error('Failed to fetch customer details:', error);
      }
    };
  
    fetchCustomerDetails();
  }, [userInfo]);

  const addToCartHandler = async()=>{
    if (!userInfo) {
      history.push('/login');
      return;
    }
    try {
      let currentCartId = cartUuid; // Assuming this state holds the current user's cart ID
  
      // If the user does not have a cart ID, create a new cart
      if (!currentCartId) {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.post('/store/carts/', {}, config);
        currentCartId = data.id; // Assuming the response includes the cart ID
        // console.log(currentCartId,"not id");
        // Optionally, update the cartUuid state or redux store with the new cart ID
      }
  
      // Add the product to the cart
      if (currentCartId) {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
  
        const postData = {
          product_id: id, // id from useParams()
          quantity: qty,
        };
        // console.log(currentCartId,"with id");
        await axios.post(`/store/carts/${currentCartId}/items/`, postData, config);
  
        // Redirect to cart page or show success message
        history.push('/cart');
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      // Handle error, e.g., show error message
    }
    // history.push(`/cart/`)
 }


 
  return (
    <div>
      <button className="btn btn-dark my-3" onClick={goBackHandler}>
        Go Back
      </button>


      {loading ? (
        <Loader />
        
      ) : error ? (
        <Message variant='danger'>{error} </Message>
      ) : (
        <>
        <Row>
          <Col md={6}>
          {product.images && product.images.length > 0 ? (
          <Carousel>
            {product.images.map((image) => (
              <Carousel.Item key={image.id}>
                <img
                  className="d-block w-100"
                  src={process.env.PUBLIC_URL + image.image}
                  alt="Product image"
                />
              </Carousel.Item>
            ))}
          </Carousel>
        ) : (
          <img src={defaultImage} alt="Default product" className="img-fluid" />
        )}
          </Col>
          <Col md={3}>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h3>{product.title}</h3>
              </ListGroup.Item>
              <ListGroup.Item>
                <Rating
                  value={product.average_rating}
                  text={`${product.total_reviews} reviews`}
                  color={"#f8e825"}
                />
              </ListGroup.Item>
              <ListGroup.Item>Price: ${product.unit_price}</ListGroup.Item>

              <ListGroup.Item>
                Description: {product.description}
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col md={3}>
            <Card>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Price:</Col>
                    <Col>
                      <strong>${product.unit_price}</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Row>
                    <Col>Status:</Col>
                    <Col>
                      {product.inventory > 0 ? "In Stock" : "Out of Stock"}
                    </Col>
                  </Row>
                </ListGroup.Item>

            {product.inventory >0 && (
              <ListGroup.Item>

                <Row>

                  <Col>Qty</Col>
                  <Col xs="auto" className="my-1">
                        <Form.Control
                          as="select"
                          value={qty}
                          onChange={(e) => setQty(e.target.value)}
                        >
                          {[...Array(product.inventory).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </Form.Control>
                      </Col>


                </Row>
                </ListGroup.Item>
            )}

                <ListGroup.Item>
                  <Button
                    className="btn-block"
                    disabled={product.inventory == 0}
                    type="button"
                    onClick={addToCartHandler}
                  >
                    Add to Cart
                  </Button>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
        
        <div className="mt-5">
        <h3>Reviews</h3>
        {product.reviews && product.reviews.length > 0 ? (
          <ListGroup variant="flush">
            {product.reviews.map((review) => {
                // console.log(review);
                return(
              <ListGroup.Item key={review.id}>
                {/* <strong>{review.name}</strong> */}
                <Rating value={review.rating} />
                <p>{review.date}</p>
                <p>{review.description}</p>
              </ListGroup.Item>
            );})}
          </ListGroup>
        ) : (
          <Message>No reviews yet</Message>
        )}
      </div>
      </>
      )}
    </div>
  );
}

export default ProductScreen;
