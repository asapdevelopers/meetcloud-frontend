import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './Styles/flexboxgrid.css';
import Home from './Components/Home/Home';
import Conference from './Components/Conference/Conference';
import registerServiceWorker from './registerServiceWorker';
import {BrowserRouter as Router, Route} from 'react-router-dom'

ReactDOM.render(
<Router>
  <div>
    <Route path="/" exact component={Home}/>
    <Route path="/conference/:roomName"  component={Conference}/>
  </div>
</Router>, document.getElementById('root'));

registerServiceWorker();
