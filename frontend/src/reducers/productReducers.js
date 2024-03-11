import { PRODUCT_LIST_REQUEST,PRODUCT_LIST_SUCCESS,PRODUCT_LIST_FAIL,   PRODUCT_DETAILS_REQUEST,PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL } from '../constants/productConstants'

export const productListReducers =(state={products:[]},action)=>{

    switch(action.type){
        case PRODUCT_LIST_REQUEST:
            return { ...state, loading: true };
        case PRODUCT_LIST_SUCCESS:
            return {
                ...state,
                loading: false,
                products: action.payload.results, // Assuming payload now includes a results field
                totalPages: action.payload.totalPages, // Assuming payload now includes a totalPages field
            };
        case PRODUCT_LIST_FAIL:
            return { ...state, loading: false, error: action.payload };
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