import axios from 'axios';
import { CART_CLEAR ,CART_ADD_ITEM ,CART_REMOVE_ITEM, CART_DETAILS_REQUEST, CART_DETAILS_SUCCESS, CART_DETAILS_FAIL} from '../constants/cartConstants';


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
            unit_price: data.unit_price,
            countInStock: data.inventory,
            qty,
            total_price: Number(data.unit_price) * qty,
        }
    })
    localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems))
}

export const removeFromCart = (itemId) => async (dispatch, getState) => {
    try {
      const { userLogin: { userInfo } } = getState();
  
      if (!userInfo || !userInfo.accessToken) {
        throw new Error('User not authenticated');
      }
  
      const config = {
        headers: {
          'Authorization': `JWT ${userInfo.accessToken}`,
        },
      };
  
      // Fetching the user's cart ID
      const customerResponse = await axios.get('/store/customers/', config);
      const customerDetails = customerResponse.data.find(customer => customer.user_id === userInfo.id);
  
      if (!customerDetails || !customerDetails.cart_id) {
        throw new Error('No cart ID found for the current user.');
      }
      
      // Fetch cart items to find the correct cart item ID
      const cartItemsResponse = await axios.get(`/store/carts/${customerDetails.cart_id}/items/`, config);
      console.log('Cart Items:', cartItemsResponse.data);

      const cartItem = cartItemsResponse.data.find(item => item.product.id === itemId);
      console.log('Cart Item ID:', cartItem.id, itemId);

      if (!cartItem) {
          throw new Error('Cart item not found for the given product ID');
      }

      // Once cart ID is fetched, proceed to remove the item
      await axios.delete(`/store/carts/${customerDetails.cart_id}/items/${cartItem.id}/`, config);
  
      dispatch({
        type: CART_REMOVE_ITEM,
        payload: itemId,
      });
  
      // Update localStorage
      localStorage.setItem('cartItems', JSON.stringify(getState().cart.cartItems));
    } catch (error) {
      console.error('Failed to remove item from cart:', error);
      // Optionally dispatch an error action here
    }
  };


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


export const clearCart = () => (dispatch) => {
    dispatch({
        type: CART_CLEAR,
    });
};