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
  
  const [searchQuery, setSearchQuery] = useState(() => {
    // Attempt to get a stored search query or fall back to currentFilters or an empty string
    return localStorage.getItem('searchQuery') || currentFilters.search || '';
  });

  const [ordering, setOrdering] = useState(() => {
    // Attempt to get a stored ordering or fall back to currentFilters or an empty string
    return localStorage.getItem('ordering') || currentFilters.ordering || '';
  });


  const [selectedCollection, setSelectedCollection] = useState(() => {
    const storedSelections = localStorage.getItem('selectedCollection');
    return storedSelections ? JSON.parse(storedSelections) : {};
  });
  
  const [priceRange, setPriceRange] = useState({
    min: localStorage.getItem('priceRangeMin') || currentFilters.price_gte || '',
    max: localStorage.getItem('priceRangeMax') || currentFilters.price_lte || '',
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

  useEffect(() => {
    localStorage.setItem('searchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('ordering', ordering);
  }, [ordering]);
  
  useEffect(() => {
    localStorage.setItem('priceRangeMin', priceRange.min);
    localStorage.setItem('priceRangeMax', priceRange.max);
  }, [priceRange]);

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setPriceRange((prev) => ({ ...prev, [name]: value }));
  };
  const handleCollectionChange = (collectionId) => {
    setSelectedCollection((prev) => {
      const newSelections = { ...prev, [collectionId]: !prev[collectionId] };
      // Save the updated selections to local storage
      localStorage.setItem('selectedCollection', JSON.stringify(newSelections));
      return newSelections;
    });
  };
  const handleOrderChange = (e) => {
    setOrdering(e.target.value);
    console.log(ordering);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // const selectedCollectionIds = Object.keys(selectedCollection).filter(id => selectedCollection[id]);
    // onApplyFilter({
    //   collection_id: selectedCollectionIds,
    //   price_gte: priceRange.min,
    //   price_lte: priceRange.max,
    // });
    const selectedCollectionIds = Object.keys(selectedCollection).filter(key => selectedCollection[key]).join(',');
    const filters = {
      ...(searchQuery && { search: searchQuery }),
      ...(ordering && { ordering }),
      ...(priceRange.min && { 'unit_price__gt': priceRange.min }),
      ...(priceRange.max && { 'unit_price__lt': priceRange.max }),
      ...(selectedCollectionIds && { collection_id: selectedCollectionIds }),
    };
    // Dispatch the action creator with the filters and the current page (assuming '1' by default)
    onApplyFilter(filters, 1);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3"></Form.Group>
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

      <Form.Group className="mb-3"></Form.Group>

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

        <Form.Group className="mb-3"></Form.Group>

        <Form.Group>
        <Form.Label>Search</Form.Label>
        <Form.Control
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Form.Group>

      <Form.Group className="mb-3"></Form.Group>

      <Form.Group>
        <Form.Label>Order By</Form.Label>
        <Form.Control as="select" value={ordering} onChange={(e) => setOrdering(e.target.value)}>
        <option value="">Select...</option>
        <option value="unit_price">Price (Low to High)</option>
        <option value="-unit_price">Price (High to Low)</option>
        <option value="last_update">Last Updated (Newest First)</option>
        <option value="-last_update">Last Updated (Oldest First)</option>
        <option value="total_sells">Total Sells (High to Low)</option>
        <option value="-total_sells">Total Sells (Low to High)</option>
        <option value="average_rating">Average Rating (High to Low)</option>
        <option value="-average_rating">Average Rating (Low to High)</option>
        <option value="total_reviews">Total Reviews (High to Low)</option>
        <option value="-total_reviews">Total Reviews (Low to High)</option>
</Form.Control>
      </Form.Group>
      <Form.Group className="mb-3"></Form.Group>
      <Button variant="primary" type="submit">
        Apply Filters
      </Button>
    </Form>
  );
};

export default FilterComponent;
