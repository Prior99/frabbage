import * as React from "react";
import { computed } from "mobx";
import "./background.scss";
import classNames from "classnames";

export interface BackgroundProps {
    className?: string;
    animated?: boolean;
}

export class Background extends React.Component<BackgroundProps> {
    @computed private get classNames(): string {
        return classNames("Background", this.props.className);
    }

    public render(): JSX.Element {
        return (
            <div className={this.classNames}>
                <div className="Background__content"></div>
                <div className="Background__blur"></div>
            </div>
        );
    }
}
