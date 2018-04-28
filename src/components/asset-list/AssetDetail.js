import React, { Component } from "react";
import AssetIcon from "./AssetIcon";

export default class AssetDetail extends Component {
  formatDate(date) {
    const dateParts = date.split("-");
    return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
  }

  render() {
    return (
      <li
        className="mdc-list-item"
        onClick={() => this.props.onSelect(this.props.Asset)}
      >
        <AssetIcon category={this.props.Asset.category} />
        <span className="mdc-list-item__text">
          {this.props.Asset.category}
          <span className="mdc-list-item__text__secondary">
            {this.formatDate(this.props.Asset.date)}
            {this.props.Asset.description
              ? ` ${this.props.Asset.description}`
              : ""}
          </span>
        </span>
        <span className="mdc-list-item__end-detail">
          ${this.props.Asset.amount}
        </span>
      </li>
    );
  }
}
