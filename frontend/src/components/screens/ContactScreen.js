import React, { useState, useEffect } from 'react';
import { Row, Col, Image, ListGroup, Button, Card,Form } from "react-bootstrap";

import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";

function ContactScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Log the form data to the console
    // In a real application, you would send this data to a server
    console.log(formData);
    alert("Thank you for your message. We'll get back to you shortly.");
    // Reset the form
    setFormData({
      name: '',
      email: '',
      message: '',
    });
  };

  return (
    <div className="contact-us-container">
      <h2>Contact Us</h2>
        <Form onSubmit={handleSubmit}>
            <Row className="align-items-center">
                <Col sm={3} className="my-1">
                <Form.Group controlId='name'>
                <Form.Label htmlFor="inlineFormInputName" visuallyHidden>
                    Name
                </Form.Label>
                <Form.Control required type="text" value={formData.name} onChange={handleChange} placeholder="Name"/>
               </Form.Group>
                </Col>
            </Row>
            <Row className="align-items-center">
                <Col sm={3} className="my-1">
                <Form.Group controlId='email'>
                <Form.Label htmlFor="inlineFormInputEmail" visuallyHidden>
                    Email
                </Form.Label>
                <Form.Control required type="email" value={formData.email} onChange={handleChange} placeholder="Email"/>
               </Form.Group>
                </Col>
            </Row>
            <Row className="align-items-center">
                <Col sm={3} className="my-1">
                <Form.Group controlId='message'>
                <Form.Label htmlFor="inlineFormInputMessage" visuallyHidden>
                    Message
                </Form.Label>
                <Form.Control as="textarea" rows={3} required type="text" value={formData.message} onChange={handleChange} placeholder="Message"/>
               </Form.Group>
                </Col>
            </Row>
            <Row className="align-items-center">
                <Col xs="auto" className="my-1">
                <Button type="submit">Submit</Button>
                </Col>
            </Row>
        </Form>
    </div>
  );
}

export default ContactScreen;
