import React, {useState,useEffect} from 'react';
import { useDispatch,useSelector } from 'react-redux';
import {Container,Row,Col} from "react-bootstrap";
import Product from '../Product';
import { listDealsProducts, listProductsYouMayLike,  listLatestProducts} from '../../actions/productAction';
import Loader from '../Loader';
import Message from '../Message';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

function HomeScreen() {
    
    const dispatch = useDispatch();
    
    const [dealspage, dealssetPage] = useState(1);
    const {dealserror, dealsloading, dealsproducts, dealstotalPages} = useSelector(state=>state.dealsproductList);

    const [maylikepage, maylikesetPage] = useState(1);
    const {maylikeerror, maylikeloading, maylikeproducts, mayliketotalPages} = useSelector(state=>state.maylikeproductList);

    const [latestpage, latestsetPage] = useState(1);
    const {latesterror, latestloading, latestproducts, latesttotalPages} = useSelector(state=>state.latestproductList);

    console.log("totalPages", dealstotalPages);

    useEffect(()=>{
        dispatch(listDealsProducts(dealspage));
    },[dispatch, dealspage])
    
    useEffect(()=>{
      dispatch(listProductsYouMayLike(maylikepage));
    },[dispatch, maylikepage])

    useEffect(()=>{
      dispatch(listLatestProducts(latestpage));
    },[dispatch, latestpage])


    const dealshandlePrevious = () => {
        dealssetPage((prevPage) => Math.max(prevPage - 1, 1));
      };
    
    const dealshandleNext = () => {
      dealssetPage((prevPage) => Math.min(prevPage + 1, dealstotalPages));
    };

    const maylikehandlePrevious = () => {
      maylikesetPage((prevPage) => Math.max(prevPage - 1, 1));
    };
  
    const maylikehandleNext = () => {
      maylikesetPage((prevPage) => Math.min(prevPage + 1, mayliketotalPages));
    };

    const latesthandlePrevious = () => {
      latestsetPage((prevPage) => Math.max(prevPage - 1, 1));
    };
  
    const latesthandleNext = () => {
      latestsetPage((prevPage) => Math.min(prevPage + 1, latesttotalPages));
    };

      return (
        <div>
          <h1 className="text-center">DEALS!!!</h1>
        <div className="horizontal-scroll-wrapper">
          <div className={`pagination-control ${dealspage <= 1 ? 'disabled' : ''}`} onClick={dealshandlePrevious}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </div>
          {dealsloading ? (
            <Loader />
          ) : dealserror ? (
            <Message variant="danger">{dealserror}</Message>
          ) : (
            dealsproducts.map((product) => (
              <div key={product._id} className="product-card">
                <Product product={product} />
              </div>
            ))
          )}
          <div className={`pagination-control ${dealspage >= dealstotalPages ? 'disabled' : ''}`} onClick={dealshandleNext}>
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </div>

        <h1 className="text-center">Product You May Like</h1>
        <div className="horizontal-scroll-wrapper">
          <div className={`pagination-control ${maylikepage <= 1 ? 'disabled' : ''}`} onClick={maylikehandlePrevious}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </div>
          {maylikeloading ? (
            <Loader />
          ) : maylikeerror ? (
            <Message variant="danger">{maylikeerror}</Message>
          ) : (
            maylikeproducts.map((product) => (
              <div key={product._id} className="product-card">
                <Product product={product} />
              </div>
            ))
          )}
          <div className={`pagination-control ${maylikepage >= mayliketotalPages ? 'disabled' : ''}`} onClick={maylikehandleNext}>
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </div>
          

        <h1 className="text-center">Latest Product or (Hottest Product in your region)</h1>
        <div className="horizontal-scroll-wrapper">
          <div className={`pagination-control ${latestpage <= 1 ? 'disabled' : ''}`} onClick={latesthandlePrevious}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </div>
          {latestloading ? (
            <Loader />
          ) : latesterror ? (
            <Message variant="danger">{latesterror}</Message>
          ) : (
            latestproducts.map((product) => (
              <div key={product._id} className="product-card">
                <Product product={product} />
              </div>
            ))
          )}
          <div className={`pagination-control ${latestpage >= latesttotalPages ? 'disabled' : ''}`} onClick={latesthandleNext}>
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </div>
        </div>
      );

    // returning all product not in scorllable window can be used in collection view
    // return (
    //     <div>
    //         <h1 className="text-center">Latest Products</h1>
    //         {loading ?(<Loader />):error ?(<Message variant='danger'>{error}</Message>):
    //         <Row>
    //            {products.map((product)=>(
    //                <Col key={product._id} sm={12} md={6} lg={4} xl={3}>

    //                    <h3>{product.name}</h3>
    //                    <Product  product={product}/>
    //                </Col>
    //            ))} 
    //         </Row>
    //         }
    //     </div>
    // )
}

export default HomeScreen



