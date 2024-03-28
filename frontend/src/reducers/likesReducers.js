import { LIKES_CLEAR, LIKES_ADD_ITEM ,LIKES_REMOVE_ITEM, LIKES_DETAILS_REQUEST,
    LIKES_DETAILS_SUCCESS,
    LIKES_DETAILS_FAIL,} from "../constants/likesConstants";


    export const likesReducer = (state = { likesItems: [], loading: false, error: null }, action) => {
        switch(action.type){
            case LIKES_ADD_ITEM:
                const item = action.payload;
                const existItem = state.likesItems.find(x => x.product === item.product);
                if(existItem){
                    return {
                        ...state, 
                        likesItems: state.likesItems.map(x =>
                            x.product === existItem.product ? item : x)                    
                    };
                }else{
                    return {
                        ...state, 
                        likesItems: [...state.likesItems, item]
                    };
                }
    
            case LIKES_REMOVE_ITEM:
                return {
                    ...state,
                    likesItems: state.likesItems.filter(x => x.product !== action.payload)
                };
    
            case LIKES_DETAILS_REQUEST:
                return {
                    ...state,
                    loading: true,
                    error: null // Clear any errors when we start a new request
                };
    
            case LIKES_DETAILS_SUCCESS:
                return {
                    ...state,
                    likesItems: action.payload.items.map(item => ({
                      product: item.product.id,
                      name: item.product.title,
                      images: item.product.images, // Assuming you have an image URL or path here
                      unit_price: item.product.unit_price,
                      countInStock: item.product.inventory, // Assuming you have inventory info
                    })),
                    // Update total price if needed, or any other state properties
                };
    
            case LIKES_DETAILS_FAIL:
                return {
                    ...state,
                    loading: false,
                    error: action.payload,
                };
            case LIKES_CLEAR:
                return {
                    ...state,
                    likesItems: [] // Reset cartItems to an empty array
                };
    
            default:
                return state;
        }
    };