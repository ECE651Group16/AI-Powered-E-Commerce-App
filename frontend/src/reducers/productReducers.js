import { PRODUCT_LIST_REQUEST,PRODUCT_LIST_SUCCESS,PRODUCT_LIST_FAIL,   
    LATEST_PRODUCT_LIST_REQUEST, LATEST_PRODUCT_LIST_SUCCESS, LATEST_PRODUCT_LIST_FAIL,   
    DEALS_PRODUCT_LIST_REQUEST, DEALS_PRODUCT_LIST_SUCCESS, DEALS_PRODUCT_LIST_FAIL,   
    MAYLIKE_PRODUCT_LIST_REQUEST, MAYLIKE_PRODUCT_LIST_SUCCESS, MAYLIKE_PRODUCT_LIST_FAIL,   
    PRODUCT_DETAILS_REQUEST,PRODUCT_DETAILS_SUCCESS, PRODUCT_DETAILS_FAIL, FILTER_PRODUCTS_REQUEST,
    FILTER_PRODUCTS_SUCCESS,
    FILTER_PRODUCTS_FAIL,
    RECOMM_PRODUCT_LIST_REQUEST, RECOMM_PRODUCT_LIST_SUCCESS, RECOMM_PRODUCT_LIST_FAIL
    
    } from '../constants/productConstants'


export const productListReducers =(state={products:[]},action)=>{
    switch (action.type) {
        case PRODUCT_LIST_REQUEST:
        case FILTER_PRODUCTS_REQUEST: // Handle loading state similarly for filter request
          return { ...state, loading: true };
        case PRODUCT_LIST_SUCCESS:
        case FILTER_PRODUCTS_SUCCESS: // Handle success state similarly for filtered products
          return {
            ...state,
            loading: false,
            products: action.payload.results,
            totalPages: action.payload.totalPages,
          };
        case PRODUCT_LIST_FAIL:
        case FILTER_PRODUCTS_FAIL: // Handle failure state similarly for filter failure
          return { ...state, loading: false, error: action.payload };
        default:
          return state;
      }
    };


export const dealsProductListReducers =(state={dealsproducts:[]},action)=>{
    switch(action.type){
        case DEALS_PRODUCT_LIST_REQUEST:
            return { ...state, dealsloading: true };
        case DEALS_PRODUCT_LIST_SUCCESS:
            return {
                ...state,
                dealsloading: false,
                dealsproducts: action.payload.results,
                dealstotalPages: action.payload.totalPages,
            };
        case DEALS_PRODUCT_LIST_FAIL:
            return { ...state, dealsloading: false, dealserror: action.payload };
        default:
            return state;
    }
}


export const maylikeProductListReducers =(state={maylikeproducts:[]},action)=>{
    switch(action.type){
        case MAYLIKE_PRODUCT_LIST_REQUEST:
            return { ...state, maylikeloading: true };
        case MAYLIKE_PRODUCT_LIST_SUCCESS:
            return {
                ...state,
                maylikeloading: false,
                maylikeproducts: action.payload.results,
                mayliketotalPages: action.payload.totalPages,
            };
        case MAYLIKE_PRODUCT_LIST_FAIL:
            return { ...state, maylikeloading: false, maylikeerror: action.payload };
        default:
            return state;
    }
}

export const latestProductListReducers =(state={latestproducts:[]},action)=>{
    switch(action.type){
        case LATEST_PRODUCT_LIST_REQUEST:
            return { ...state, latestloading: true };
        case LATEST_PRODUCT_LIST_SUCCESS:
            return {
                ...state,
                latestloading: false,
                latestproducts: action.payload.results,
                latesttotalPages: action.payload.totalPages,
            };
        case LATEST_PRODUCT_LIST_FAIL:
            return { ...state, latestloading: false, latesterror: action.payload };
        default:
            return state;
    }
}




export const productDetailsReducers = (state={ product:{reviews:[]} },action) =>{

    switch(action.type){
        case PRODUCT_DETAILS_REQUEST:
            return {loading:true,...state}
        case PRODUCT_DETAILS_SUCCESS:
            return {loading:false,product:action.payload}
        case PRODUCT_DETAILS_FAIL:
            return {loading:false, error: action.payload }

        default:
            return state
    }

}

