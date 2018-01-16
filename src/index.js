import React from "react";
import ReactDOM from "react-dom";
// react router deps
// redux
import { Route, BrowserRouter, Redirect } from "react-router-dom";
import { Provider } from "react-redux";
import registerServiceWorker from "./registerServiceWorker";
import store from "./store/store";

// pages
import HomePage from "./pages/home/HomePage";
import ConferencePage from "./pages/conference/ConferencePage";
// Styles
import "./index.css";
import "./Styles/flexboxgrid.css";
import "./Styles/boostrap-utility-classes.css";

const None = () => <Redirect to={{ pathname: "/home" }} />;

const router = (
  <Provider store={store}>
    <BrowserRouter>
      <div>
        <Route path="/" exact component={None} />
        <Route path="/home/:roomName?" component={HomePage} />
        <Route path="/conference/:roomName" component={ConferencePage} />
      </div>
    </BrowserRouter>
  </Provider>
);

ReactDOM.render(router, document.getElementById("root"));

registerServiceWorker();
