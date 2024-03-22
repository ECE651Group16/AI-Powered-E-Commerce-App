// HomeScreen.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { MemoryRouter } from 'react-router-dom';
import HomeScreen from '../Components/screens/HomeScreen';
import { listDealsProducts } from '../actions/productAction';

// const middlewares = [thunk];
// const mockStore = configureMockStore(middlewares);


// describe('HomeScreen Component', () => {
//   it('properly displays products when available', async () => {
//     // Mock the initial state
//     const initialState = {
//       dealsproductList: {
//         dealsloading: false,
//         dealserror: null,
//         dealsproducts: [
//             {
//               id: 405,
//               title: 'Coffee Decaf Colombian',
//               description: 'Nunc rhoncus dui vel sem.',
//               slug: '-',
//               inventory: 405,
//               price_with_tax: 45.39,
//               reviews: [],
//               images: [],
//               unit_price: 41.26,
//               total_reviews: 0,
//               average_rating: null,
//               total_sells: 405,
//               collection: 2,
//               collection: {
//                 id: 2,
//                 title: 'Specialty Coffees'
//               }
//             },
//             // Add more mock products as needed
//         ],
//         dealstotalPages: 1,
//       },
//       maylikeproductList: {
//         // Similar structure for may like products
//         maylikeloading: false,
//         maylikeerror: null,
//         maylikeproductList: [
//             {
//               id: 406,
//               title: 'Coffee Decaf Colombian',
//               description: 'Nunc rhoncus dui vel sem.',
//               slug: '-',
//               inventory: 405,
//               price_with_tax: 45.39,
//               reviews: [],
//               images: [],
//               unit_price: 41.26,
//               total_reviews: 0,
//               average_rating: null,
//               total_sells: 405,
//               collection: 2,
//               collection: {
//                 id: 2,
//                 title: 'Specialty Coffees'
//               }
//             },
//             // Add more mock products as needed
//           // Add more mock products as needed
//         ],
//         mayliketotalPages: 1,
//       },
//       latestproductList: {
//         // Similar structure for latest products
//         // Similar structure for may like products
//         latestloading: false,
//         latesterror: null,
//         latestproductList: [
//             {
//               id: 407,
//               title: 'Coffee Decaf Colombian',
//               description: 'Nunc rhoncus dui vel sem.',
//               slug: '-',
//               inventory: 405,
//               price_with_tax: 45.39,
//               reviews: [],
//               images: [],
//               unit_price: 41.26,
//               total_reviews: 0,
//               average_rating: null,
//               total_sells: 405,
//               collection: 2,
//               collection: {
//                 id: 2,
//                 title: 'Specialty Coffees'
//               }
//             },
//             // Add more mock products as needed
//           // Add more mock products as needed
//         ],
//         latesttotalPages: 1,
//       },
//       // Include other initial state slices as needed
//     };

//     const store = mockStore(initialState);

//     // Render HomeScreen with mock store and wrapped in MemoryRouter for routing
//     render(
//       <Provider store={store}>
//         <MemoryRouter>
//           <HomeScreen />
//         </MemoryRouter>
//       </Provider>
//     );

//     // Assertions
//     expect(screen.getByText('Coffee Decaf Colombian')).toBeInTheDocument();
//     expect(screen.getByText('Coffee Decaf Colombian')).toBeInTheDocument(); // Ensure this product is also asserted
//     // Add more assertions as needed
//   });
// });


test('renders learn react link', () => {
  //   render(<App />);
  //   const linkElement = screen.getByText(/learn react/i);
  //   expect(linkElement).toBeInTheDocument();
  });
