import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';

const FilterComponent = ({ onApplyFilter }) => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  useEffect(() => {
    // Fetch collections and other filter options
    // setCollections(fetchedCollections);
  }, []);

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApplyFilter({
      collection_id: selectedCollection,
      price_gte: priceRange.min,
      price_lte: priceRange.max,
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label>Collection</Form.Label>
        <Form.Control
          as="select"
          value={selectedCollection}
          onChange={(e) => setSelectedCollection(e.target.value)}
        >
          {collections.map((collection) => (
            <option key={collection.id} value={collection.id}>
              {collection.title}
            </option>
          ))}
        </Form.Control>
      </Form.Group>

      <Form.Group>
        <Form.Label>Price Range</Form.Label>
        <Form.Control
          type="number"
          name="min"
          value={priceRange.min}
          onChange={handlePriceChange}
        />
        <Form.Control
          type="number"
          name="max"
          value={priceRange.max}
          onChange={handlePriceChange}
        />
      </Form.Group>

      <Button variant="primary" type="submit">
        Apply Filters
      </Button>
    </Form>
  );
};

export default FilterComponent;
