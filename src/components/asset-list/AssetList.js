import React, { Component } from "react";
import AssetDetail from "./AssetDetail.js"
import "@material/list/dist/mdc.list.css";
import "./AssetList.css";

class AssetList extends Component {
  render() {
    return (
      <ul className="mdc-list mdc-list--two-line mdc-list--avatar-list">
        {this.props.Assets.map(Asset =>
          <AssetDetail
            key={Asset.id}
            Asset={Asset}
            onSelect={this.props.onSelect}
          />
        )}
      </ul>
    );
  }
}

export default AssetList;
