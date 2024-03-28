import axios from 'axios';
import { LIKES_CLEAR, LIKES_ADD_ITEM ,LIKES_REMOVE_ITEM, LIKES_DETAILS_REQUEST, LIKES_DETAILS_SUCCESS, LIKES_DETAILS_FAIL} from '../constants/likesConstants';


export const addTolikes = (id, qty) => async (dispatch, getState) => {
    // const { data } = await axios.get(`/store/products/${id}/`)
    const response = await axios.get(`/store/products/${id}/`);
    const data = response.data; // This is the correct way to access the returned data
    console.log(`/store/products/${id}/`, data);
    console.log("inventory:",data.inventory);
    dispatch({
        type: LIKES_ADD_ITEM,
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
    localStorage.setItem('likesItems', JSON.stringify(getState().likes.likesItems))
}
export const removeFromLikes = (itemId) => async (dispatch, getState) => {
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
  
      // Fetching the user's likes ID
      const customerResponse = await axios.get('/store/customers/', config);
      const customerDetails = customerResponse.data.find(customer => customer.user_id === userInfo.id);
  
      if (!customerDetails || !customerDetails.likes_id) {
        throw new Error('No likes ID found for the current user.');
      }
      
      // Fetch likes items to find the correct likes item ID
      const likesItemsResponse = await axios.get(`/store/likes/${customerDetails.likes_id}/items/`, config);
      console.log('Likes Items:', likesItemsResponse.data);

      const likesItems = likesItemsResponse.data.find(item => item.product.id === itemId);
      console.log('Likes Item ID:', likesItems.id, itemId);

      if (!likesItems) {
          throw new Error('Likes item not found for the given product ID');
      }

      // Once likes ID is fetched, proceed to remove the item
      await axios.delete(`/store/likes/${customerDetails.likes_id}/items/${likesItems.id}/`, config);
  
      dispatch({
        type: LIKES_REMOVE_ITEM,
        payload: itemId,
      });
  
      // Update localStorage
      localStorage.setItem('likesItems', JSON.stringify(getState().likes.likesItems));
    } catch (error) {
      console.error('Failed to remove item from likes:', error);
      // Optionally dispatch an error action here
    }
  };


export const fetchLikesDetails = (likesId) => async (dispatch, getState) => {
    try {
      dispatch({ type: LIKES_DETAILS_REQUEST });
  
      const {
        userLogin: { userInfo },
      } = getState();
  
      const config = {
        headers: {
        //   'Content-Type': 'application/json',
          'Authorization': `JWT ${userInfo.accessToken}`,
        },
      };
  
      // Assuming your backend has an endpoint to fetch likes details by likes ID
      const { data } = await axios.get(`/store/likes/${likesId}/`, config);
      console.log("fetching likes detail:", data);
      dispatch({
        type: LIKES_DETAILS_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: LIKES_DETAILS_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

export const clearLikes = () => (dispatch) => {
    dispatch({
        type: LIKES_CLEAR,
    });
};