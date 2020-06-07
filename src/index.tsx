import * as React from "react";
import * as ReactDOM from "react-dom";
import { TSDI } from "tsdi";
import { Router, Route, Switch, Redirect } from "react-router-dom";
import "./factories";
import { getRoutes } from "./routing";
import { routeMainMenu } from "./pages";
import "./app.scss";
import { Background } from "./ui/background/background";
import { allAudios, AudioManager } from "./audio";

async function main(): Promise<void> {
    // Start dependency injection.
    const tsdi = new TSDI();
    tsdi.enableComponentScanner();

    // Check HTML.
    const root = document.getElementById("app");
    if (!root) {
        throw new Error("Missing root tag on HTML page.");
    }
    root.innerHTML = "Loading...";

    // Load sounds.
    await Promise.all(allAudios.map(({ url, gain }) => tsdi.get(AudioManager).load(url, gain)));

    // Start React.
    ReactDOM.render(
        <div className="App">
            <Background className="App__background" />
            <div className="App__main">
                <Router history={tsdi.get("history")}>
                    <Switch>
                        <Redirect exact from="/" to={routeMainMenu.path()} />
                        {getRoutes().map((route, index) => (
                            <Route path={route.pattern} component={route.component} key={index} />
                        ))}
                    </Switch>
                </Router>
            </div>
        </div>,
        root,
    );
}

main();
