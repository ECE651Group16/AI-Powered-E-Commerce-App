import React, {useState,useEffect} from 'react';
import { useDispatch,useSelector } from 'react-redux';
import {Container,Row,Col} from "react-bootstrap";
import Product from '../Product';
import { listLatestProducts } from '../../actions/productAction';
import Loader from '../Loader';
import Message from '../Message';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

function HomeScreen() {
    const [page, setPage] = useState(1);
    const dispatch = useDispatch();
    const productList = useSelector((state)=>state.productList);
    const {error,loading,products, totalPages} =productList
    console.log("totalPages", totalPages);
    useEffect(()=>{
        dispatch(listLatestProducts(page));
    },[dispatch, page])

    const handlePrevious = () => {
        setPage((prevPage) => Math.max(prevPage - 1, 1));
      };
    
      const handleNext = () => {
        setPage((prevPage) => Math.min(prevPage + 1, totalPages));
      };
      return (
        <div><h1 className="text-center">DEALS!!!</h1>
        <div className="horizontal-scroll-wrapper">
          <div className={`pagination-control ${page <= 1 ? 'disabled' : ''}`} onClick={handlePrevious}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </div>
          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            products.map((product) => (
              <div key={product._id} className="product-card">
                <Product product={product} />
              </div>
            ))
          )}
          <div className={`pagination-control ${page >= totalPages ? 'disabled' : ''}`} onClick={handleNext}>
            <FontAwesomeIcon icon={faChevronRight} />
          </div>
        </div>
        </div>
      );
    //   return (
    //     <div>
            
    //       <h1 className="text-center">DEALS!!!</h1>
    //       {loading ? (
    //         <Loader />
    //       ) : error ? (
    //         <Message variant="danger">{error}</Message>
    //       ) : (
    //         <>
    //           <div className="horizontal-scroll-wrapper">
    //             {products.map((product) => (
    //               <Col key={product._id} sm={12} md={6} lg={4} xl={3} className="product-card">
    //                 <h3>{product.name}</h3>
    //                 <Product product={product} />
    //               </Col>
    //             ))}
    //           </div>
    //           <div className="pagination-controls">
    //             <button className="pagination-button" onClick={handlePrevious} disabled={page <= 1}>
    //               Previous
    //             </button>
    //             <button className="pagination-button" onClick={handleNext} disabled={page >= pages}>
    //               Next
    //             </button>
    //           </div>
    //         </>
    //       )
    //      }
    //        
    //        
    //    </div>
    //    
    //  );
    

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



