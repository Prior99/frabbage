import * as React from "react";
import "./menu-container.scss";
import classNames from "classnames";
import { computed } from "mobx";

export interface MenuContainerProps {
    className?: string;
}

export class MenuContainer extends React.Component<MenuContainerProps> {
    @computed private get classNames(): string {
        return classNames("MenuContainer", this.props.className)
    }

    public render(): JSX.Element {
        return (
            <div className={this.classNames}>
                {this.props.children}
            </div>
        );
    }
}
