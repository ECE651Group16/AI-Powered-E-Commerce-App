import axios from '../api/api';
import {
  PRODUCT_LIST_REQUEST,
  PRODUCT_LIST_SUCCESS,
  PRODUCT_LIST_FAIL,
  LATEST_PRODUCT_LIST_REQUEST,
  LATEST_PRODUCT_LIST_SUCCESS,
  LATEST_PRODUCT_LIST_FAIL,
  DEALS_PRODUCT_LIST_REQUEST,
  DEALS_PRODUCT_LIST_SUCCESS,
  DEALS_PRODUCT_LIST_FAIL,
  MAYLIKE_PRODUCT_LIST_REQUEST,
  MAYLIKE_PRODUCT_LIST_SUCCESS,
  MAYLIKE_PRODUCT_LIST_FAIL,
  PRODUCT_DETAILS_REQUEST,
  PRODUCT_DETAILS_SUCCESS,
  PRODUCT_DETAILS_FAIL

} from "../constants/productConstants";

export const listDealsProducts = (pageNumber = '') => async (dispatch) => {
  try {
    dispatch({ type: DEALS_PRODUCT_LIST_REQUEST });
    const { data } = await axios.get(`/store/products/?ordering=-last_update&page=${pageNumber}`);
    // console.log("API response:", data); // Should show the full paginated response
    // console.log("Dispatching data:", data.results); // Should show just the array of products
    const PRODUCTS_PER_PAGE = 8;
    const totalPages = Math.ceil(data.count / PRODUCTS_PER_PAGE); 
    dispatch({
      type: DEALS_PRODUCT_LIST_SUCCESS,
      payload: {
        results: data.results,
        totalPages, // Make sure to include this in your dispatch
      },
    });
  } catch (error) {
    dispatch({
      type: DEALS_PRODUCT_LIST_FAIL,
      payload:
        error.response && error.response.data.detail
          ? error.response.data.detail
          : error.message,
    });
  }
};


export const listProductsYouMayLike = (pageNumber = '') => async (dispatch) => {
  try {
    dispatch({ type: MAYLIKE_PRODUCT_LIST_REQUEST });
    const { data } = await axios.get(`/store/products/?ordering=-last_update&page=${pageNumber}`);
    // console.log("API response:", data); // Should show the full paginated response
    // console.log("Dispatching data:", data.results); // Should show just the array of products
    const PRODUCTS_PER_PAGE = 8;
    const totalPages = Math.ceil(data.count / PRODUCTS_PER_PAGE); 
    dispatch({
      type: MAYLIKE_PRODUCT_LIST_SUCCESS,
      payload: {
        results: data.results,
        totalPages, // Make sure to include this in your dispatch
      },
    });
  } catch (error) {
    dispatch({
      type: MAYLIKE_PRODUCT_LIST_FAIL,
      payload:
        error.response && error.response.data.detail
          ? error.response.data.detail
          : error.message,
    });
  }
};


export const listLatestProducts = (pageNumber = '') => async (dispatch) => {
  try {
    dispatch({ type: LATEST_PRODUCT_LIST_REQUEST });
    const { data } = await axios.get(`/store/products/?ordering=-last_update&page=${pageNumber}`);
    // console.log("API response:", data); // Should show the full paginated response
    // console.log("Dispatching data:", data.results); // Should show just the array of products
    const PRODUCTS_PER_PAGE = 8;
    const totalPages = Math.ceil(data.count / PRODUCTS_PER_PAGE); 
    dispatch({
      type: LATEST_PRODUCT_LIST_SUCCESS,
      payload: {
        results: data.results,
        totalPages, // Make sure to include this in your dispatch
      },
    });
  } catch (error) {
    dispatch({
      type: LATEST_PRODUCT_LIST_FAIL,
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