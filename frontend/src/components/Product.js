import React from "react";
import { Card } from "react-bootstrap";
import Rating from "../components/Rating";
import {Link} from "react-router-dom"

function Product({ product }) {
  const defaultImage = process.env.PUBLIC_URL + '/images/sample.jpg';
  // console.log(product); 
  return (
    <Card classname="my-3 p-3 rounded">
      <Link to={`/products/${product.id}`}>
      <Card.Img src={product.images && product.images.length > 0 ? product.images[0].image : defaultImage} variant="top" />
      </Link>

      <Card.Body>
        <Link to={`/products/${product.id}`}>
          <Card.Title as="div">
            <strong>{product.title}</strong>
          </Card.Title>
        </Link>

        <Card.Text as="div">
            <div className="my-3">
                {product.average_rating} from {product.total_reviews} reviews
            </div>
        </Card.Text>
        
        <Card.Text as="h3">
          {product.unit_price}
        </Card.Text>

        <Rating
                value={product.average_rating}
                text={` ${product.total_reviews} reviews`}
                color={"#f8e825"}
              />
      </Card.Body>
    </Card>
  );
}

export default Product;
