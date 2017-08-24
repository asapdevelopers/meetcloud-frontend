import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './Styles/flexboxgrid.css';
import Home from './Components/Home/Home';
import Conference from './Components/Conference/Conference';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';

const None = (props) => (
  <Redirect to={{ pathname: '/home/' }}></Redirect>
)

ReactDOM.render(
  <Router>
  <div>
    <Route path="/" exact component={None}/>
    <Route path="/home/:roomName?" component={Home}/>
    <Route path="/conference/:roomName" component={Conference}/>
  </div>
</Router>, document.getElementById('root'));

registerServiceWorker();
