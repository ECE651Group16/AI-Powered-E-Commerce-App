import { USER_LOGIN_FAIL,USER_LOGIN_SUCCESS,USER_LOGOUT,USER_LOGIN_REQUEST,USER_REGISTER_FAIL,USER_REGISTER_SUCCESS,USER_REGISTER_REQUEST, } from '../constants/userConstants'
import axios from 'axios'

export const login = (email,password)=> async(dispatch)=>{

   try{
       dispatch({
           type:USER_LOGIN_REQUEST
       })

       const config ={
           headers:{
               'Content-type':'application/json'
           }
       }

       const {data}= await axios.post('/api/users/login/',
       
       {'username':email,'password':password},config
       
       
       )

       dispatch({
           type:USER_LOGIN_SUCCESS,
           payload:data
       })

       localStorage.setItem('userInfo',JSON.stringify(data))



   }

   catch(error){
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

        const { data } = await axios.post('http://127.0.0.1:8000/auth/users/', postData, config);

       dispatch({
           type:USER_REGISTER_SUCCESS,
           payload:data
       })
       dispatch({
           type:USER_LOGIN_SUCCESS,
           payload:data
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
    localStorage.removeItem('userInfo')
    dispatch({ type: USER_LOGOUT })
 
}