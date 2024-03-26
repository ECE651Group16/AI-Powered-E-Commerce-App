import axios from 'axios';
import { CART_ADD_ITEM ,CART_REMOVE_ITEM, CART_DETAILS_REQUEST, CART_DETAILS_SUCCESS, CART_DETAILS_FAIL} from '../constants/cartConstants';


export const addToCart = (id, qty) => async (dispatch, getState) => {
    // const { data } = await axios.get(`/store/products/${id}/`)
    const response = await axios.get(`/store/products/${id}/`);
    const data = response.data; // This is the correct way to access the returned data
    console.log(`/store/products/${id}/`, data);
    console.log("inventory:",data.inventory);
    dispatch({
        type: CART_ADD_ITEM,
        payload: {
            product: data.id,
            name: data.title,
            images: data.images,
            price: data.unit_price,
            countInStock: data.inventory,
            qty
        }
    })
    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems))
}
export const removeFromCart = (id) => (dispatch, getState) => {
    dispatch({
        type: CART_REMOVE_ITEM,
        payload: id,
    })

    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems))
}


export const fetchCartDetails = (cartId) => async (dispatch, getState) => {
    try {
      dispatch({ type: CART_DETAILS_REQUEST });
  
      const {
        userLogin: { userInfo },
      } = getState();
  
      const config = {
        headers: {
        //   'Content-Type': 'application/json',
          'Authorization': `JWT ${userInfo.accessToken}`,
        },
      };
  
      // Assuming your backend has an endpoint to fetch cart details by cart ID
      const { data } = await axios.get(`/store/carts/${cartId}/`, config);
      console.log("fetching cart detail:", data);
      dispatch({
        type: CART_DETAILS_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: CART_DETAILS_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };