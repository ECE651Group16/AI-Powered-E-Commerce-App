


import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ProductsList from './components/ProductsList';
import ProductDetail from './components/ProductDetail'; // Ensure this component exists

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProductsList />} exact />
        <Route path="/store/products/:productId" element={<ProductDetail />} />
      </Routes>
    </Router>
  );
}

export default App;

