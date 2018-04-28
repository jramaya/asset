import React, { Component } from 'react';

export default class ExpenseIcon extends Component {
  iconFrom(category) {
    switch (category) {
      case "Corte":
        return "face";
      case "Ventas":
        return "shopping_cart";
      default:
        return "attach_money";
    }
  }

  render() {
    return (
      <span
        className={`mdc-list-item__start-detail ${this.props.category}`}
        role="presentation"
      >
        <i className="material-icons" aria-hidden="true">
          {this.iconFrom(this.props.category)}
        </i>
      </span>
    );
  }
}
