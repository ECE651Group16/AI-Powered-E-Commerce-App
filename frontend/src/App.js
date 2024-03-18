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

function App() {
  return (
<Router>
      <Header />
      <main className="py-3">
        <Container>
          <Route path="/" component={HomeScreen} exact />
          <Route path="/login" component={LoginScreen} exact />
          <Route path="/register" component={RegisterScreen} exact />
          <Route path="/products/:id" component={ProductScreen} exact />
          <Route path="/cart/:id?" component={CartScreen} exact />
          <Route path="/all_products" component={AllProductScreen} exact />
          <Route path="/profile" component={ProfileScreen}/>
          
        </Container>
      </main>

      <Footer />
      </Router>
  );
}

export default App;
