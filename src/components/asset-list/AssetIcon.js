import React, { Component } from 'react';

export default class AssetIcon extends Component {
  iconFrom(category) {
    switch (category) {
      case "Corte":
        return "content_cut";
      case "CorteGratis":
        return "content_cut";
      case "Ventas":
        return "shopping_cart";
      case "CorteNino":
        return "child_care";
      case "CorteEmpleadoMetro":
        return "content_cut";
      case "FacialProfundo":
        return "face";
      case "Exfoliacion":
        return "face";
      case "CorteCejas":
        return "visibility";
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
