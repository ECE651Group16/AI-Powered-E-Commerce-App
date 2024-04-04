import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { ListGroup, Card, Button } from 'react-bootstrap';

function OrderHistoryScreen() {
  const history = useHistory();
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const [orderHistory, setOrderHistory] = useState([]);
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!userInfo) {
        console.log('User is not logged in');
        return;
      }
  
      try {
        const config = {
          headers: {
            'Authorization': `JWT ${userInfo.accessToken}`, 
          },
        };
        const { data } = await axios.get('/store/orders/', config);
        setOrderHistory(data);
      } catch (error) {
        console.error('Failed to fetch customer orders:', error);
      }
    };
  
    fetchCustomerDetails();
  }, [userInfo]);
  

  return (
    <div>
      <h2>Order History</h2>
      {orderHistory.length > 0 ? (
        orderHistory.map(order => (
          <Card className="mb-3" key={order.id}>
            <Card.Header as="h5">Order ID: {order.id}</Card.Header>
            <Card.Body>
              <Card.Title>Placed At: {new Date(order.placed_at).toLocaleDateString()}</Card.Title>
              <Card.Text>
                Payment Status: {order.payment_status === 'C' ? 'Completed' : 'Pending'}
              </Card.Text>
              <ListGroup variant="flush">
                {order.items.map(item => (
                  <ListGroup.Item key={item.id}>
                    {item.product.title} - Quantity: {item.quantity} at ${item.unit_price.toFixed(2)} each
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card.Body>
            <Card.Footer>
            </Card.Footer>
          </Card>
        ))
      ) : (
        <p>No orders found.</p>
      )}
    </div>
  );
}

export default OrderHistoryScreen;
