import React, { useState, useEffect } from 'react';
import { Form, Button, Collapse } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

// Function to save collapse states to local storage
const saveCollapseState = (key, value) => {
  localStorage.setItem(key, value.toString());
};

// Function to get collapse states from local storage
const getCollapseState = (key, defaultValue) => {
  const storedValue = localStorage.getItem(key);
  return storedValue !== null ? storedValue === 'true' : defaultValue;
};


const FilterComponent = ({ onApplyFilter, currentFilters  }) => {
  const [collections, setCollections] = useState([]);

  const [isOpenCollection, setIsOpenCollection] = useState(() => getCollapseState('isOpenCollection', false));
  const [isOpenPrice, setIsOpenPrice] = useState(() => getCollapseState('isOpenPrice', false));
  

  // Correct initialization based on currentFilters
  const [selectedCollection, setSelectedCollection] = useState(() => {
    const initialSelections = {};
    // Assume currentFilters.collection_id is an array of strings
    (currentFilters.collection_id || []).forEach((id) => {
      initialSelections[id] = true; // Mark as selected
    });
    return initialSelections;
  });

  
  const [priceRange, setPriceRange] = useState({
    min: currentFilters.price_gte || '',
    max: currentFilters.price_lte || '',
  });

  // Toggle functions that also save state to local storage
  const toggleCollectionCollapse = () => {
    setIsOpenCollection((prev) => {
      const newState = !prev;
      saveCollapseState('isOpenCollection', newState);
      return newState;
    });
  };

  // Price Range Collapse Toggle
  const togglePriceCollapse = () => {
    setIsOpenPrice((prev) => {
      const newState = !prev;
      saveCollapseState('isOpenPrice', newState);
      return newState;
    });
  };


  useEffect(() => {
    // Fetch collections and other filter options
    const fetchCollections = async () => {
      try {
        const response = await axios.get('/store/collections/');
        // Initialize selectedCollections state
        const initialSelection = response.data.reduce((acc, collection) => {
          acc[collection.id] = false;
          return acc;
        }, {});
        setCollections(response.data);
      } catch (error) {
        console.error('Failed to fetch collections:', error);
      }
    };

    fetchCollections();
  }, []);


  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange((prev) => ({ ...prev, [name]: value }));
  };
  const handleCollectionChange = (collectionId) => {
    setSelectedCollection(prev => ({
      ...prev,
      [collectionId]: !prev[collectionId],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedCollectionIds = Object.keys(selectedCollection).filter(id => selectedCollection[id]);
    onApplyFilter({
      collection_id: selectedCollectionIds,
      price_gte: priceRange.min,
      price_lte: priceRange.max,
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        
      <Form.Label onClick={toggleCollectionCollapse} style={{ cursor: 'pointer' }}>
            Collection {isOpenCollection ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />}
        </Form.Label>
        
        <Collapse in={isOpenCollection}>
        <div>
        {collections.map((collection) => (
          <Form.Check
            key={collection.id}
            type="checkbox"
            label={collection.title}
            checked={!!selectedCollection[collection.id]}
            onChange={() => handleCollectionChange(collection.id)}
          />
        ))}
        </div>
        </Collapse>
      </Form.Group>

      <Form.Group>
          <Form.Label onClick={togglePriceCollapse} style={{ cursor: 'pointer' }}>
            Price Range {isOpenPrice ? <FontAwesomeIcon icon={faChevronUp} /> : <FontAwesomeIcon icon={faChevronDown} />}
          </Form.Label>
          <Collapse in={isOpenPrice}>
            <div>
              <Form.Control
                type="number"
                placeholder="Min Price"
                name="min"
                value={priceRange.min}
                onChange={handlePriceChange}
              />
              <Form.Control
                type="number"
                placeholder="Max Price"
                name="max"
                value={priceRange.max}
                onChange={handlePriceChange}
              />
            </div>
          </Collapse>
        </Form.Group>

      <Button variant="primary" type="submit">
        Apply Filters
      </Button>
    </Form>
  );
};

export default FilterComponent;
