import React,{useState,useEffect} from "react";
import { Link } from "react-router-dom";
import { Row, Col, Image, ListGroup, Button, Card,Form } from "react-bootstrap";
import Loader from '../Loader';
import Message from '../Message';
import { useDispatch, useSelector } from "react-redux";
import { fetchCartDetails, clearCart } from "../../actions/cartActions"; 
import { login } from "../../actions/userActions";
import FormContainer from '../FormContainer';
import { fetchLikesDetails,clearLikes } from "../../actions/likesActions";


function LoginScreen({location,history}) {

    const [email,setEmail]=useState('')
    const [username, setUsername] = useState('');
    const [password,setPassword]=useState('')
    const dispatch = useDispatch()

    const redirect = location.search ? location.search.split('=')[1] :'/'
 
    const userLogin = useSelector(state=>state.userLogin)
    const {error,loading,userInfo}=userLogin

    // useEffect(()=>{
    //     if(userInfo){
    //         history.push(redirect)
    //     }
    // },[history,userInfo,redirect])

  //   useEffect(() => {
  //     if (userInfo) {
  //         // Option 1: Clear local storage cart items
  //         localStorage.removeItem('cartItems');
          
  //         // Option 2: Ideally, here you'd fetch and load user's cart items from server
  //         // Assuming you have a function to fetch cart items
  //         fetchCartDetails(userInfo.userId).then(cartItems => {
  //             localStorage.setItem('cartItems', JSON.stringify(cartItems));
  //         });

  //         history.push(redirect);
  //     }
  // }, [history, userInfo, redirect]);

    useEffect(() => {
      if (userInfo) {
        localStorage.removeItem('cartItems');
        localStorage.removeItem('likesItems');
        dispatch(clearCart()); // Clear the cart in Redux state
        dispatch(clearLikes()); 
        dispatch(fetchCartDetails(userInfo.cartId)); // Optionally, fetch the new user's cart
        dispatch(fetchLikesDetails(userInfo.likesId));
        history.push(redirect);
      }
    }, [history, userInfo, redirect, dispatch]);

    const submitHandler= (e)=>{
        e.preventDefault()
        dispatch(login(username,password))
    }
    return (
        <div>
         <FormContainer>
          <h1>Sign In</h1>
          {error && <Message variant='danger'>{error}</Message>}
          {loading && <Loader />}

          <Form onSubmit={submitHandler}>


              {/* <Form.Group controlId='email'>
                <Form.Label>Email Address </Form.Label>
                <Form.Control required type='email' placeholder='Enter Email' value={email} onChange={(e)=> setEmail(e.target.value)}></Form.Control>
              </Form.Group> */}
              <Form.Group controlId='username'>
                <Form.Label>Username</Form.Label>
                <Form.Control
                    required
                    type='text' // Change to 'text' if it's just a username
                    placeholder='Enter Username'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                ></Form.Control>
                </Form.Group>

              <Form.Group controlId='password'>
                <Form.Label>Password</Form.Label>
                <Form.Control required type='password' placeholder='Enter Password' value={password} onChange={(e)=> setPassword(e.target.value)}></Form.Control>
              </Form.Group>

            <Button className='mt-3' type='submit' variant='primary'>Sign In</Button>

          </Form>

          <Row className='py-3'>
              <Col>
              New Customer? 
              <Link to={redirect?`/register?redirect=${redirect}`:'/register'}>Register</Link>
              </Col>

          </Row>

         </FormContainer>
        </div>
    )
}

export default LoginScreen
