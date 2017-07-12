import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './Styles/flexboxgrid.css';
import Home from './Components/Home/Home';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Home />, document.getElementById('root'));
registerServiceWorker();
