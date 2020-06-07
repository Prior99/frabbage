import * as React from "react";
import { History } from "history";
import { Route, addRoute, RouteProps } from "../../routing";
import { Segment } from "semantic-ui-react";
import { action } from "mobx";
import { observer } from "mobx-react";
import { LobbyMode } from "../../types";
import { routeGame } from "../page-game";
import "./page-main-menu.scss";
import { MenuContainer } from "../../ui";
import { NetworkMode } from "p2p-networking";
import { ConnectMenu } from "p2p-networking-semantic-ui-react";
import { external, inject } from "tsdi";

declare const SOFTWARE_VERSION: string;

export interface PageMainMenuProps {}

@external
@observer
export class PageMainMenu extends React.Component<RouteProps<PageMainMenuProps>> {
    @inject("history") private history!: History;

    @action.bound private handleSubmit(networkMode: NetworkMode, id?: string): void {
        if (networkMode === NetworkMode.CLIENT) {
            this.history.push(routeGame.path(LobbyMode.CLIENT, id));
        } else {
            this.history.push(routeGame.path(LobbyMode.HOST));
        }
    }

    public render(): JSX.Element {
        return (
            <MenuContainer className="PageMainMenu">
                <div className="PageMainMenu__header">
                    <div className="PageMainMenu__logo" />
                    <h1 className="PageMainMenu__name">Frabbage</h1>
                </div>
                <Segment className="PageMainMenu__segment">
                    <ConnectMenu onSubmit={this.handleSubmit} />
                </Segment>
                <div className="PageMainMenu__version">{`Version #${SOFTWARE_VERSION}`}</div>
            </MenuContainer>
        );
    }
}

export const routeMainMenu: Route<PageMainMenuProps> = addRoute({
    path: () => "/main-menu",
    pattern: "/main-menu",
    component: PageMainMenu,
});
