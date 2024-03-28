import { USER_LOGIN_FAIL,USER_LOGIN_SUCCESS,USER_LOGOUT,USER_LOGIN_REQUEST,USER_REGISTER_FAIL,USER_REGISTER_SUCCESS,USER_REGISTER_REQUEST, } from '../constants/userConstants'
import axios from 'axios'
import { clearCart } from './cartActions'; 
import { clearLikes } from './likesActions';

axios.defaults.baseURL = 'http://127.0.0.1:8000/';


export const login = (username,password)=> async(dispatch)=>{

   try{
       dispatch({
           type:USER_LOGIN_REQUEST
       })

       const config ={
           headers:{
               'Content-type':'application/json'
           }
       }

       console.log(`Attempting to login with URL: /auth/jwt/create/ and payload:`, { username, password });
       const {data}= await axios.post('/auth/jwt/create/',
       {'username':username,'password':password},config
       )
       console.log("Login response data:", data); 

       const accessToken =  data.access;
    
        // Use the access token to fetch user details
        const userDetailConfig = {
            headers: {
                // 'Content-Type': 'application/json',
                'Authorization': `JWT ${accessToken}`, // Use the access token here
            },
        };
        console.log(`Making request to URL: ${axios.defaults.baseURL}auth/users/me/ with token: JWT ${accessToken}`);
        const userDetails = await axios.get('/auth/users/me/', userDetailConfig);
        
        console.log("User details response data:", userDetails.data); // Log the user details

        // Combine user info and tokens into a single object before storing
        const userInfo = {
            ...userDetails.data,
            accessToken: data.access,
            refreshToken: data.refresh,
        };

       dispatch({
           type:USER_LOGIN_SUCCESS,
           payload:userInfo
       })

       localStorage.setItem('userInfo',JSON.stringify(data))



   }

   catch(error){
    console.error("Login error:", error.response ? error.response.data : error.message);
    dispatch({
        type: USER_LOGIN_FAIL,
        payload:
          error.response && error.response.data.detail
            ? error.response.data.detail
            : error.message,
      });
   }

}


export const register =(email, password, username, firstName, lastName)=> async(dispatch)=>{
    try{

       dispatch({
           type:USER_REGISTER_REQUEST
       })

       const config = {
           headers:{
               'Content-Type':'application/json'
           }
       }
      
       // Correcting the data assignment based on the input provided
       const postData = {
        email: email, // Assuming this is the correct field for email
        password: password,
        username: username, // Assuming Djoser uses this field for the username
        first_name: firstName, // Correct field for first name
        last_name: lastName, // Correct field for last name
        };

        // Logging to verify the correct data structure
        console.log("Sending registration data:", postData);

        const response = await axios.post('http://127.0.0.1:8000/auth/users/', postData, config);
        
        dispatch({
            type:USER_REGISTER_SUCCESS,
            payload:response.data
        })

        console.log(`Attempting to login with URL: /auth/jwt/create/ and payload:`, { username, password });
        const {data}= await axios.post('/auth/jwt/create/',
        {'username':username,'password':password},config
        )
        console.log("Login response data:", data); 
 
        const accessToken =  data.access;
     
         // Use the access token to fetch user details
         const userDetailConfig = {
             headers: {
                 // 'Content-Type': 'application/json',
                 'Authorization': `JWT ${accessToken}`, // Use the access token here
             },
         };
         console.log(`Making request to URL: ${axios.defaults.baseURL}auth/users/me/ with token: JWT ${accessToken}`);
         const userDetails = await axios.get('/auth/users/me/', userDetailConfig);
         
         console.log("User details response data:", userDetails.data); // Log the user details
         console.log("Register Done");
         // Combine user info and tokens into a single object before storing
         const userInfo = {
             ...userDetails.data,
             accessToken: data.access,
             refreshToken: data.refresh,
         };
        dispatch({
            type:USER_LOGIN_SUCCESS,
            payload:userInfo
        })

        localStorage.setItem('userInfo',JSON.stringify(data))

    }
    catch(error){
        console.log(error.response.data); // Add this line
        const errorMessage = error.response && error.response.data && Object.values(error.response.data).join('\n') ?
        Object.values(error.response.data).join('\n') :
        error.message;
        
        dispatch({
        type: USER_REGISTER_FAIL,
        payload: errorMessage
       })

    }
}









export const logout = () => (dispatch) => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('cartItems'); // Clear cart items from local storage
    localStorage.removeItem('likesItems');
    // Optionally, clear other local storage items related to user session
    
    dispatch({ type: USER_LOGOUT });
    dispatch(clearCart()); // Clear cart items in Redux state
    dispatch(clearLikes());
 
}