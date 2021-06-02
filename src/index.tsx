import React from "react";
import ReactDOM from "react-dom";
import { HashRouter as Router, Route, RouteComponentProps } from "react-router-dom";
import App from "./app/App";
import "./index.scss";
import { IConfiguration } from "./models/config/IConfiguration";
import { registerServices } from "./services";

const configId = process.env.REACT_APP_CONFIG_ID ?? "local";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config: IConfiguration = require(`./assets/config/config.${configId}.json`);

const APP_NAME = "DevNetWallet";

registerServices(config, APP_NAME);

ReactDOM.render(
    (
        <Router>
            <Route
                exact={true}
                path="/"
                component={(props: RouteComponentProps) => (
                    <App {...props} configuration={config} />)}
            />
        </Router>
    ),
    document.getElementById("root")
);

