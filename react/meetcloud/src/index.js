import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "./Styles/flexboxgrid.css";
import Home from "./Components/Home/Home";
import Conference from "./Components/Conference/Conference";
import registerServiceWorker from "./registerServiceWorker";
// redux
import { Provider } from "react-redux";
import { store } from "./store/store";
// react router deps
import { Route, BrowserRouter, Redirect } from "react-router-dom";
// pages
import HomePage from "./pages/home/HomePage";
import ConferencePage from "./pages/conference/ConferencePage";

const None = props => <Redirect to={{ pathname: "/home" }} />;

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
