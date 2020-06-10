import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch, BrowserRouter as Router, Link } from "react-router-dom";
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Presenter } from './Presenter';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <div>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/presenter">Presenter</Link>
          </li>
          <li>
            <Link to="/viewer">Viewer</Link>
          </li>
        </ul>

        <Switch>
          <Route path="/presenter">
            <Presenter></Presenter>
          </Route>
          <Route path="/viewer">

          </Route>
          <Route path="/">
            <App></App>
          </Route>
        </Switch>
      </div>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
