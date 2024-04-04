import "./App.css";
import { Container } from "react-bootstrap";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import HomeScreen from "./components/screens/HomeScreen";
import ProductScreen from "./components/screens/ProductScreen";
import CartScreen from "./components/screens/CartScreen";
import LoginScreen from './components/screens/LoginScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import AllProductScreen from './components/screens/AllProductScreen';
import ProfileScreen from "./components/screens/ProfileScreen";
import AboutScreen from "./components/screens/AboutScreen";
import ContactScreen from "./components/screens/ContactScreen";
import CheckoutScreen from './components/screens/CheckoutScreen'; 
import axios from 'axios';
import SessionCheck from "./components/SessionCheck";
import WishlistScreen from "./components/screens/WishlistScreen";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import OrderConfirmationScreen from "./components/screens/OrderConfirmationScreen";
import SuccessScreen from "./components/screens/SuccessScreen";

// axios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       alert('Your session has expired. Please log in again.');
//       localStorage.removeItem('userInfo');
//       // Redirect or handle logout
//     }
//     return Promise.reject(error);
//   }
// );

function App() {
  // const stripePromise = loadStripe('pk_test_A7jK4iCYHL045qgjjfzAfPxu');
  return (
    // <Elements stripe={stripePromise}>
    <Router>
    <SessionCheck /> 
      <Header />
      <main className="py-3">
        <Container>
          <Route path="/" component={HomeScreen} exact />
          <Route path="/login" component={LoginScreen} exact />
          <Route path="/register" component={RegisterScreen} exact />
          <Route path="/products/:id" component={ProductScreen} exact />
          <Route path="/cart/:id?" component={CartScreen} exact />
          <Route path="/wishlist/:id?" component={WishlistScreen} exact />
          <Route path="/all_products" component={AllProductScreen} exact />
          <Route path="/aboutus" component={AboutScreen} exact />
          <Route path="/contactus" component={ContactScreen} exact />
          <Route path="/profile" component={ProfileScreen}/>
          <Route path="/payments" component={CheckoutScreen} exact />
          <Route path="/order-confirmation" component={OrderConfirmationScreen} />
          <Route path="/success" component={SuccessScreen} />
        </Container>
      </main>

      <Footer />
      </Router>
      // </Elements>
  );
}

export default App;
