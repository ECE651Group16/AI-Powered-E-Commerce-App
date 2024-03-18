import React from "react";
import { Link, Route, useRouteMatch } from "react-router-dom";
import ProfileManagementScreen from "./ProfileManagementScreen"; // Create this component
import OrderHistoryScreen from "./OrderHistoryScreen"; // Create this component
import ReviewsScreen from "./ReviewsScreen"; // Create this component

function ProfileScreen() {
  let { path, url } = useRouteMatch();

  return (
    <div className="container">
      <div className="row">
        <div className="col-3">
          <div className="list-group">
            <Link to={`${url}/manage`} className="list-group-item list-group-item-action">
              Profile Management
            </Link>
            <Link to={`${url}/orders`} className="list-group-item list-group-item-action">
              Orders History
            </Link>
            <Link to={`${url}/reviews`} className="list-group-item list-group-item-action">
              Reviews
            </Link>
          </div>
        </div>
        <div className="col-9">
          {/* Define nested routes here */}
          <Route path={`${path}/manage`} component={ProfileManagementScreen} />
          <Route path={`${path}/orders`} component={OrderHistoryScreen} />
          <Route path={`${path}/reviews`} component={ReviewsScreen} />
        </div>
      </div>
    </div>
  );
}

export default ProfileScreen;
