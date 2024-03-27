import {createStore,combineReducers,applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {composeWithDevTools} from 'redux-devtools-extension';
import {productListReducers,productDetailsReducers, latestProductListReducers, dealsProductListReducers, maylikeProductListReducers} from './reducers/productReducers';
import { cartReducer } from './reducers/cartReducers';
import { likesReducer } from './reducers/likesReducers';
import { userLoginReducers } from './reducers/userReducers';
import { userRegisterReducers } from './reducers/userReducers';


const reducer =combineReducers({
    productList:productListReducers,
    dealsproductList: dealsProductListReducers,
    maylikeproductList: maylikeProductListReducers,
    latestproductList: latestProductListReducers,
    productDetails:productDetailsReducers,
    cart:cartReducer,
    likes:likesReducer,
    userLogin:userLoginReducers,
    userRegister:userRegisterReducers,
})

const cartItemsFromStorage = localStorage.getItem('cartItems')?
JSON.parse(localStorage.getItem('cartItems')): []

const likesItemsFromStorage = localStorage.getItem('likesItems')?
JSON.parse(localStorage.getItem('likesItems')): []

const userInfoFromStorage = localStorage.getItem('userInfo')?
JSON.parse(localStorage.getItem('userInfo')): null



const initailState = {
    cart:{cartItems:cartItemsFromStorage},
    likes:{likesItems:likesItemsFromStorage},
    userLogin:{userInfo:userInfoFromStorage}
}



const middleware=[thunk]
const store = createStore(reducer,initailState,composeWithDevTools(applyMiddleware(...middleware)))

export default store;