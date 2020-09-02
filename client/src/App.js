import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import ItemTable from './components/ItemTable';
import ItemProfile from './components/ItemProfile';
import OrderTable from './components/OrderTable';
import OrderItemsTable from './components/OrderItemsTable';
import AddOrder from './components/AddOrder';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <Switch>
          <Route exact path='/items' component={ItemTable} />
          <Route exact path='/orders' component={OrderTable} />
          <Route exact path='/orders/:id' component={OrderItemsTable} />
          <Route exact path='/add-order/' component={AddOrder} />
          <Route exact path='/item/:id' component={ItemProfile} />
        </Switch>
      </Router>
    </>
  );
}

export default App;
