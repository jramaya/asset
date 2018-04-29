import React, { Component } from "react";
import { AssetList, AssetForm, LoadingBar } from "./components/index";
import { MDCSnackbar } from "@material/snackbar/dist/mdc.snackbar.js";

import "@material/fab/dist/mdc.fab.css";
import "@material/button/dist/mdc.button.css";
import "@material/toolbar/dist/mdc.toolbar.css";
import "@material/snackbar/dist/mdc.snackbar.css";
import "@material/card/dist/mdc.card.css";

import "./App.css";

class App extends Component {
  constructor() {
    super();

    this.clientId =
      "441013731629-oujodhl13k0jgap3t5t2172ghe77mtfm.apps.googleusercontent.com";
    this.spreadsheetId =
      process.env.REACT_APP_SHEET_ID ||
      "1ZzkFIe9c_obNNgjr-qm7RhBiB0Uskf7gez5YabjSXCo";

    this.state = {
      signedIn: undefined,
      accounts: [],
      categories: [],
      assets: [],
      processing: true,
      asset: {},
      currentMonth: undefined,
      currentDay: undefined,
      previousMonth: undefined,
      showAssetForm: false
    };

  }

  componentDidMount() {
    window.gapi.load("client:auth2", () => {
      window.gapi.client
        .init({
          discoveryDocs: [
            "https://sheets.googleapis.com/$discovery/rest?version=v4"
          ],
          clientId: this.clientId,
          scope:
            "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly"
        })
        .then(() => {
          window.gapi.auth2
            .getAuthInstance()
            .isSignedIn.listen(this.signedInChanged);
          this.signedInChanged(
            window.gapi.auth2.getAuthInstance().isSignedIn.get()
          );
        });
    });
  }

  signedInChanged = (signedIn) => {
    this.setState({ signedIn: signedIn });
    if (this.state.signedIn) {
      this.load();
    }
  }

  handleAssetsubmit = () => {
    this.setState({ processing: true, showAssetForm: false });
    const submitAction = (this.state.Asset.id
      ? this.update
      : this.append).bind(this);
    submitAction(this.state.Asset).then(
      response => {
        this.snackbar.show({
          message: `Asset ${this.state.Asset.id ? "updated" : "added"}!`
        });
        this.load();
      },
      response => {
        console.error("Something went wrong");
        console.error(response);
        this.setState({ loading: false });
      }
    );
  }

  handleAssetChange = (attribute, value) => {
    this.setState({
      Asset: Object.assign({}, this.state.Asset, { [attribute]: value })
    });
  }

  handleAssetDelete = (Asset) => {
    this.setState({ processing: true, showAssetForm: false });
    const AssetRow = Asset.id.substring(10);
    window.gapi.client.sheets.spreadsheets
      .batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 0,
                  dimension: "ROWS",
                  startIndex: AssetRow - 1,
                  endIndex: AssetRow
                }
              }
            }
          ]
        }
      })
      .then(
        response => {
          this.snackbar.show({ message: "Asset deleted!" });
          this.load();
        },
        response => {
          console.error("Something went wrong");
          console.error(response);
          this.setState({ loading: false });
        }
      );
  }

  handleAssetselect = (Asset) => {
    this.setState({ Asset: Asset, showAssetForm: true });
  }

  handleAssetCancel = () => {
    this.setState({ showAssetForm: false });
  }

  onAssetNew() {
    const now = new Date();
    this.setState({
      showAssetForm: true,
      Asset: {
        amount: "",
        description: "",
        date: `${now.getFullYear()}-${now.getMonth() < 9
          ? "0" + (now.getMonth() + 1)
          : now.getMonth() + 1}-${now.getDate() < 10
          ? "0" + now.getDate()
          : now.getDate()}`,
        category: this.state.categories[0],
        account: this.state.accounts[0]
      }
    });
  }

  parseAsset(value, index) {
    const dateParts = value[0].split("/");
    return {
      id: `Assets!A${index + 2}`,
      date: `20${dateParts[2]}-${dateParts[1].length === 1
        ? "0" + dateParts[1]
        : dateParts[1]}-${dateParts[0].length === 1
        ? "0" + dateParts[0]
        : dateParts[0]}`,
      description: value[1],
      category: value[3],
      amount: value[4].replace(",", ""),
      account: value[2]
    };
  }

  formatAsset(Asset) {
    return [
      `=DATE(${Asset.date.substr(0, 4)}, ${Asset.date.substr(
        5,
        2
      )}, ${Asset.date.substr(-2)})`,
      Asset.description,
      Asset.account,
      Asset.category,
      Asset.amount
    ];
  }

  append(Asset) {
    return window.gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: "Assets!A1",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      values: [this.formatAsset(Asset)]
    });
  }

  update(Asset) {
    return window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: Asset.id,
      valueInputOption: "USER_ENTERED",
      values: [this.formatAsset(Asset)]
    });
  }

  load() {
    window.gapi.client.sheets.spreadsheets.values
      .batchGet({
        spreadsheetId: this.spreadsheetId,
        ranges: [
          "Data!A2:A50",
          "Data!E2:E50",
          "Assets!A2:F",
          "Current!H1",
          "Previous!H1",
          "CurrentDay!A2",
        ]
      })
      .then(response => {
        const accounts = response.result.valueRanges[0].values.map(
          items => items[0]
        );
        const categories = response.result.valueRanges[1].values.map(
          items => items[0]
        );
        var _currentDay;
        try {//Curate currentDay income value
        _currentDay = response.result.valueRanges[5].values[0][0];
        } catch (error) {
          _currentDay = 0.0
        }
        
        this.setState({
          accounts: accounts,
          categories: categories,
          Assets: (response.result.valueRanges[2].values || [])
            .map(this.parseAsset)
            .reverse()
            .slice(0, 15),
          processing: false,
          currentDay: _currentDay,
          currentMonth: response.result.valueRanges[3].values[0][0],
          previousMonth: response.result.valueRanges[4].values[0][0]
        });
      });
  }

  render() {
    return (
      <div>
        <header className="mdc-toolbar mdc-toolbar--fixed">
          <div className="mdc-toolbar__row">
            <section className="mdc-toolbar__section mdc-toolbar__section--align-start">
              <span className="mdc-toolbar__title">Ingresos</span>
            </section>
            <section
              className="mdc-toolbar__section mdc-toolbar__section--align-end"
              role="toolbar"
            >
              {this.state.signedIn === false &&
                <a
                  className="material-icons mdc-toolbar__icon"
                  aria-label="Sign in"
                  alt="Sign in"
                  onClick={e => {
                    e.preventDefault();
                    window.gapi.auth2.getAuthInstance().signIn();
                  }}
                >
                  perm_identity
                </a>}
              {this.state.signedIn &&
                <a
                  className="material-icons mdc-toolbar__icon"
                  aria-label="Sign out"
                  alt="Sign out"
                  onClick={e => {
                    e.preventDefault();
                    window.gapi.auth2.getAuthInstance().signOut();
                  }}
                >
                  exit_to_app
                </a>}
            </section>
          </div>
        </header>
        <div className="toolbar-adjusted-content">
          {this.state.signedIn === undefined && <LoadingBar />}
          {this.state.signedIn === false &&
            <div className="center">
              <button
                className="mdc-button sign-in"
                aria-label="Sign in"
                onClick={() => {
                  window.gapi.auth2.getAuthInstance().signIn();
                }}
              >
                Sign In
              </button>
            </div>}
          {this.state.signedIn && this.renderBody()}
        </div>
        <div
          ref={el => {
            if (el) {
              this.snackbar = new MDCSnackbar(el);
            }
          }}
          className="mdc-snackbar"
          aria-live="assertive"
          aria-atomic="true"
          aria-hidden="true"
        >
          <div className="mdc-snackbar__text" />
          <div className="mdc-snackbar__action-wrapper">
            <button
              type="button"
              className="mdc-button mdc-snackbar__action-button"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    );
  }

  renderBody() {
    if (this.state.processing) return <LoadingBar />;
    else
      return (
        <div className="content">
          {this.renderAssets()}
        </div>
      );
  }

  renderAssets() {
    if (this.state.showAssetForm)
      return (
        <AssetForm
          categories={this.state.categories}
          accounts={this.state.accounts}
          Asset={this.state.Asset}
          onSubmit={this.handleAssetsubmit}
          onCancel={this.handleAssetCancel}
          onDelete={this.handleAssetDelete}
          onChange={this.handleAssetChange}
        />
      );
    else
      return (
        <div>
          <div className="mdc-card">
            <section className="mdc-card__primary">
              <h2 className="mdc-card__subtitle">Ingresos de hoy:</h2>
              <h1 className="mdc-card__title mdc-card__title--large center">
                {this.state.currentDay}
              </h1>
            </section>
          </div>
          <AssetList
            Assets={this.state.Assets}
            onSelect={this.handleAssetselect}
          />
          <button
            onClick={() => this.onAssetNew()}
            className="mdc-fab app-fab--absolute material-icons"
            aria-label="Add Asset"
          >
            <span className="mdc-fab__icon">add</span>
          </button>
        </div>
      );
  }
}

export default App;
