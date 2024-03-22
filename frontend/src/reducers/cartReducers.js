import { CART_ADD_ITEM ,CART_REMOVE_ITEM, CART_DETAILS_REQUEST,
    CART_DETAILS_SUCCESS,
    CART_DETAILS_FAIL,} from "../constants/cartConstants";


    export const cartReducer = (state = { cartItems: [], loading: false, error: null }, action) => {
        switch(action.type){
            case CART_ADD_ITEM:
                const item = action.payload;
                const existItem = state.cartItems.find(x => x.product === item.product);
                if(existItem){
                    return {
                        ...state, 
                        cartItems: state.cartItems.map(x =>
                            x.product === existItem.product ? item : x)                    
                    };
                }else{
                    return {
                        ...state, 
                        cartItems: [...state.cartItems, item]
                    };
                }
    
            case CART_REMOVE_ITEM:
                return {
                    ...state,
                    cartItems: state.cartItems.filter(x => x.product !== action.payload)
                };
    
            case CART_DETAILS_REQUEST:
                return {
                    ...state,
                    loading: true,
                    error: null // Clear any errors when we start a new request
                };
    
            case CART_DETAILS_SUCCESS:
                return {
                    ...state,
                    loading: false,
                    cartItems: action.payload.items, // Assuming your payload structure contains an items array
                };
    
            case CART_DETAILS_FAIL:
                return {
                    ...state,
                    loading: false,
                    error: action.payload,
                };
    
            default:
                return state;
        }
    };