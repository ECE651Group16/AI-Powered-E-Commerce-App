// import React, { useState, useEffect } from 'react';
// import API from '../api'; // Ensure this points to your axios instance file

// const ProductsList = () => {
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     API.get('store/products/')
//       .then((response) => {
//         console.log("Received data:", response.data); // Log the received data
//         setProducts(response.data.results); // Adjust based on the actual structure

//       })
//       .catch((error) => console.error("Couldn't fetch products", error));
//   }, []);
  
  
// return (
//   <div>
//     <h2>Products</h2>
//     <ul>
//       {products.map((product) => (
//         <li key={product.id}>
//           <h3>{product.title} - ${product.unit_price.toFixed(2)}</h3>
//           {product.images && product.images.map((image) => (
//             <img key={image.id} src={image.image} alt={product.title} style={{ width: '200px', height: '200px', objectFit: 'cover'}} />
//           ))}
//         </li>
//       ))}
//     </ul>
//   </div>
// );
// };


// export default ProductsList;

import React, { useState, useEffect } from 'react';
import API from '../api';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const ProductsList = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    API.get('store/products/')
      .then((response) => {
        setProducts(response.data.results);
      })
      .catch((error) => console.error("Couldn't fetch products", error));
  }, []);

  return (
    <div className="products-grid">
      {products.map((product) => (
        <div key={product.id} className="product-card">
          {product.images.length > 0 && (
            <img
              src={product.images[0].image} // Display only the first image
              alt={product.title}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
          )}
          <div className="product-info">
            <Link to={`/store/products/${product.id}`} className="product-title">{product.title}</Link>
            <p>${product.unit_price.toFixed(2)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductsList;