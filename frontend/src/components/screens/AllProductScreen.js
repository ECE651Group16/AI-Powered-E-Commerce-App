import React, {useState,useEffect} from 'react';
import { useDispatch,useSelector } from 'react-redux';
import {Container,Row,Col, Button} from "react-bootstrap";
import Product from '../Product';
import { filterProducts,listProducts, listDealsProducts, listProductsYouMayLike,  listLatestProducts} from '../../actions/productAction';
import Loader from '../Loader';
import Message from '../Message';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import FilterComponent from '../FilterComponent';
import axios from 'axios';
// In another file, such as AllProductScreen.js


function AllProductScreen() {
    
    const dispatch = useDispatch();
    const [page, setPage] = useState(1);
    
    const {error, loading, products, totalPages} = useSelector(state=>state.productList);

    // const applyFilter = (filters) => {
    //     // Assuming you have a state for managing current page number
    //     setPage(1); // Reset to first page or maintain current page based on your UX
    //     dispatch(listProducts(1, filters));
    // };
    const applyFilter = async (filters) => {
        setPage(1);
        try {
          // Adjusting parameter names to match backend expectations
          const backendFilters = {
            ...(filters.collection_id && {collection_id: filters.collection_id}),
            ...(filters.price_gte && {unit_price__gt: filters.price_gte}),
            ...(filters.price_lte && {unit_price__lt: filters.price_lte}),
          };
      
          // Construct the query string with adjusted parameter names
          const params = new URLSearchParams(backendFilters).toString();
          
          // Log the final query string to verify correctness
          console.log(`Final query string: ${params}`);
          
          // Make the API request with the correctly named parameters
          const response = await axios.get(`http://127.0.0.1:8000/store/products/?${params}`);
          
          // Update your state with the response data as needed
          console.log("Filtered products:", response.data);
          
          // Assuming you have a state method called setProducts to update your product list
          // setProducts(response.data.results); // You need to define setProducts in your component state
        } catch (error) {
          console.error('Failed to apply filters:', error);
          // Handle errors, maybe set some error state to show in the UI
        }
      };
      

    useEffect(()=>{
        dispatch(listProducts(page));
    },[dispatch, page])
    

    const handlePrevious = () => {
      setPage((prevPage) => Math.max(prevPage - 1, 1));
    };
  
    const handleNext = () => {
      setPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    const customButtonStyle = {
        padding: '10px 20px', // Bigger padding for larger buttons
        fontSize: '1.2em',    // Larger text size
        margin: '5px',        // Add margin between buttons
        borderRadius: '10px', // Rounded corners for cuteness
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.9)', // Subtle shadow for depth
        backgroundColor: '#343a40', // Bootstrap dark grey
        borderColor: '#343a40', // Ensure the border color matches
        color: 'white', // Text color for contrast
        // Any other styles you want to add
      };

        //returning all product not in scorllable window can be used in collection view
        return (
        <div>
            <h1 className="text-center">Explore All Products</h1>
            {loading ? (
            <Loader />
            ) : error ? (
            <Message variant="danger">{error}</Message>
            ) : (
            <>
                <Row>
                <Col md={3}>
                    <FilterComponent onApplyFilter={applyFilter} />
                </Col>
                <Col md={9}>
                    <Row>
                    {products.map((product) => (
                        <Col key={product.id} sm={12} md={6} lg={4} xl={3}>
                        <h3>{product.name}</h3>
                        <Product product={product} />
                        </Col>
                    ))}
                    </Row>
                </Col>
                </Row>
                
                <div className="pagination-controls text-center">
                    <Button
                        style={customButtonStyle}
                        size="lg" // Bootstrap class for larger buttons
                        variant="info" // Bootstrap theme color, choose one that fits your design
                        onClick={handlePrevious}
                        disabled={page <= 1}
                        >
                        &laquo; Previous
                        </Button>
                        <Button
                        style={customButtonStyle}
                        size="lg"
                        variant="info"
                        onClick={handleNext}
                        disabled={page >= totalPages}
                        >
                        Next &raquo;
                    </Button>
                </div>
            </>
            )}
        </div>
        );


}

export default AllProductScreen



