import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';
import Staff from './pages/Staff';
import Guests from './pages/Guests';
import Invoice from './pages/Invoice';
import Rooms from './pages/Rooms';
import Banquets from './pages/Banquets';
import Home from './pages/Home';
import RestaurantOrders from './pages/RestaurantOrders';
import Order from './pages/Order';
import Service from './pages/Service';
import MenuItems from './pages/MenuItems';
import ProfileGuest from './pages/ProfileGuest';
import LoadingSpinner from './components/UIElements/LoadingSpinner';
import Profile from './pages/Profile';
import MainNavigation from './components/Navigation/MainNavigation';
import ScrollToTop from './components/UIElements/ScrollToTop';
import { AuthContext } from './context/auth-context';
import Auth from './pages/Auth';
import { useHttpClient } from './hooks/http-hook';
import { useAuth } from './hooks/auth-hook';

const App = () => {
  const { token, login, logout, staffId, position } = useAuth();
  let routes;
  if(token){

    if(position == 'Restaurant Staff'|| position=='Chef'){
      routes = (
      <Switch>
        <Route path="/restaurant/orders" exact>
          <RestaurantOrders />
        </Route>
        <Route path="/restaurant/menu" exact>
          <MenuItems />
        </Route>
        <Route path="/staff/:staffid/profile" exact>
        <Profile />
        </Route>
        <Redirect to="/restaurant/orders"/>
      </Switch>
    );
  }
  else if(position == "Receptionist"){
    routes = (
      <Switch>
        <Route path="/receptionist/home" exact>
          <Home />
        </Route>
        <Route path="/staff/:staffid/profile" exact>
        <Profile />
        </Route>
        <Route path="/receptionist/guest" exact>
          <Guests />
        </Route>
        <Route path="/guest/:guestId" exact>
          <ProfileGuest />
        </Route>
        <Route path="/receptionist/rooms" exact>
          <Rooms />
        </Route>
        <Route path="/receptionist/banquets" exact>
          <Banquets />
        </Route>
        <Route path="/:bookingType/:bookingId/invoice">
            <Invoice />
          </Route>
          <Route path="/:bookingType/:bookingId/order">
            <Order />
          </Route>
          <Route path="/:bookingType/:bookingId/service">
            <Service />
          </Route>
        <Redirect to="/receptionist/home" />
      </Switch>
      )
    }
    else if(position == "Manager"){
      routes = ( 
        <Switch>
        <Route path="/manager/staff" exact>
          <Staff />
        </Route>
        <Route path="/manager/rooms" exact>
          <MenuItems />
        </Route>
        <Route path="/manager/banquets" exact>
          <MenuItems />
        </Route>
        <Route path="/restaurant/orders" exact>
          <RestaurantOrders />
        </Route>
        <Route path="/restaurant/menu" exact>
          <MenuItems />
        </Route>
        <Route path="/receptionist/guest" exact>
          <RestaurantOrders />
        </Route>
        <Route path="/staff/:staffid/profile" exact>
        <Profile />
        </Route>
        <Route path="/receptionist/rooms" exact>
          <MenuItems />
        </Route>
        <Route path="/receptionist/banquets" exact>
          <MenuItems />
        </Route>
        <Redirect to="/manager/staff"/>
      </Switch>
      )
    }
  }
    else{
    routes = (
      <Switch>
        <Route path="/">
          <Auth />
        </Route>
        <Redirect to="/" />
      </Switch>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        staffId: staffId,
        login: login,
        logout: logout,
        position:position
      }}
    >
      <Router>
        <MainNavigation />
        <main>{routes}</main>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
