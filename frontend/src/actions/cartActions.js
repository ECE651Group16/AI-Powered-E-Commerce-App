import axios from 'axios';
import { CART_ADD_ITEM ,CART_REMOVE_ITEM, CART_DETAILS_REQUEST, CART_DETAILS_SUCCESS, CART_DETAILS_FAIL} from '../constants/cartConstants';


export const addToCart = (id, qty) => async (dispatch, getState) => {
    const { data } = await axios.get(`/api/products/${id}`)

    dispatch({
        type: CART_ADD_ITEM,
        payload: {
            product: data._id,
            name: data.name,
            image: data.image,
            price: data.price,
            countInStock: data.countInStock,
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
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
  
      // Assuming your backend has an endpoint to fetch cart details by cart ID
      const { data } = await axios.get(`/store/carts/${cartId}/`, config);
      console.log(data);
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