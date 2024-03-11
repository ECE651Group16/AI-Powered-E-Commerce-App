import axios from '../api/api';
import {
  PRODUCT_LIST_REQUEST,
  PRODUCT_LIST_SUCCESS,
  PRODUCT_LIST_FAIL,
  PRODUCT_DETAILS_REQUEST,
  PRODUCT_DETAILS_SUCCESS,
  PRODUCT_DETAILS_FAIL

} from "../constants/productConstants";

export const listLatestProducts = () => async (dispatch) => {
  try {
    dispatch({ type: PRODUCT_LIST_REQUEST });
    const { data } = await axios.get("/store/products/?ordering=-last_update");
    console.log("API response:", data); // Should show the full paginated response
    console.log("Dispatching data:", data.results); // Should show just the array of products
    dispatch({
      type: PRODUCT_LIST_SUCCESS,
      payload: data.results,
    });
  } catch (error) {
    dispatch({
      type: PRODUCT_LIST_FAIL,
      payload:
        error.response && error.response.data.detail
          ? error.response.data.detail
          : error.message,
    });
  }
};


export const listProductDetails =(id) => async (dispatch)=>{

  try{
      dispatch({type:PRODUCT_DETAILS_REQUEST})
      const {data} = await axios.get(`/store/products/${id}`)

      dispatch({
          type:PRODUCT_DETAILS_SUCCESS,
          payload:data
      })

  }
  catch(error){
      dispatch({
          type:PRODUCT_DETAILS_FAIL,
          payload:error.response && error.response.data.detail
          ? error.response.data.detail
          :error.message,
      })

  }
}