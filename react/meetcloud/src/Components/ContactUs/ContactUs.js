import React, { Component } from "react";
import "./ContactUs.css";

class ContactUs extends Component {
  render() {
    return (
      <div className="App-footer">
        <div className="line" />
        <div className="row contactUs">
          <div className="col-xs-1" />
          <div className="col-xs-2">
            <span>CONTACT US</span>
          </div>
          <div className="col-xs-3">
            <div className="row">
              <span>Sillicon Valley</span>
            </div>
            <div className="row">
              <span>1701 N. California Blvd. Walnut Creek, CA 94596</span>
            </div>
            <div className="row">
              <span>Tel: (+415) 967 3920</span>
            </div>
          </div>
          <div className="col-xs-3">
            <div className="row">
              <span>Montevideo, Uruguay</span>
            </div>
            <div className="row">
              <span>Av. 8 de octubre 2323, Apt. 1205</span>
            </div>
            <div className="row">
              <span>Tel: (+598) 2408 1699</span>
            </div>
          </div>
          <div className="col-xs-3">
            <div className="row">
              <span>Santiago, Chile</span>
            </div>
            <div className="row">
              <span>Los Abedules 3085, Of. 201, Vitacura</span>
            </div>
            <div className="row">
              <span>Tel: (+56) 9 9643 0806</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default ContactUs;
