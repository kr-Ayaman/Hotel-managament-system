import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch
} from 'react-router-dom';
import About from './pages/About';
import Banquet from './pages/Banquet';
import Service from './pages/Service';
import Booking from './pages/Booking';
import Order from './pages/Order';
import Profile from './pages/Profile';
import Feedback from './pages/Feedback';
import Invoice from './pages/Invoice';
import Terms from './pages/Terms';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Footer from './components/Footer/Footer';
import Auth from './pages/Auth';
import Contact from './pages/Contact';
import ScrollToTop from './components/UIElements/ScrollToTop';
import Homepage from './pages/homepage';
import Facilities from './pages/Facilities';
import Rooms from './pages/Rooms';
import MainNavigation from './components/Navigation/MainNavigation';
import { AuthContext } from './context/auth-context';
import { useAuth } from './hooks/auth-hook';

const App = () => {
  const { token, login, logout, guestId } = useAuth();

  let routes;

    if(token){
      routes = (
        <Switch>
          <Route path="/" exact>
          <Homepage />
          </Route>
          <Route path="/facilities" exact>
          <Facilities />
          </Route>
          <Route path="/rooms">
            <Rooms />
          </Route>
          <Route path="/banquets">
            <Banquet />
          </Route>
          <Route path="/contact-us">
            <Contact />
          </Route>
          <Route path="/about-us">
          <About />
          </Route>
          <Route path="/terms-and-conditions">
          <Terms />
          </Route>
          <Route path="/booking">
            <Booking />
          </Route>
          <Route path="/guest/:guestId">
            <Profile />
          </Route>
          <Route path="/:bookingType/:bookingId/invoice">
            <Invoice />
          </Route>
          <Route path="/:bookingType/:bookingId/feedback">
            <Feedback />
          </Route>
          <Route path="/:bookingType/:bookingId/order">
            <Order />
          </Route>
          <Route path="/:bookingType/:bookingId/service">
            <Service />
          </Route>
          <Redirect to="/"/>
        </Switch>
      );
    }
    else{
      routes = (
        <Switch>
          <Route path="/" exact>
          <Homepage />
          </Route>
          <Route path="/facilities" exact>
          <Facilities />
          </Route>
          <Route path="/rooms">
            <Rooms />
          </Route>
          <Route path="/banquets">
            <Banquet />
          </Route>
          <Route path="/contact-us">
            <Contact />
          </Route>
          <Route path="/auth">
            <Auth />
          </Route>
          <Route path="/about-us">
          <About />
          </Route>
          <Route path="/terms-and-conditions">
          <Terms />
          </Route>
          <Route path="/booking">
            <Booking />
          </Route>
          <Redirect to="/"/>
        </Switch>
      );
    }
    

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: !!token,
        token: token,
        guestId: guestId,
        login: login,
        logout: logout
      }}
    >
      <Router>
      <ScrollToTop />
        <MainNavigation />
        <main>{routes}</main>
        <Footer/>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
