import * as React from "react";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game } from "../../game";
import "./game-phase-scores.scss";
import { Segment, Button } from "semantic-ui-react";
import { Scoreboard } from "../scoreboard";
import { NetworkMode } from "p2p-networking";
import { action } from "mobx";

@external
@observer
export class GamePhaseScores extends React.Component {
    @inject private game!: Game;

    @action.bound private handleClick(): void {
        this.game.sendNextRound();
    }

    public render(): JSX.Element {
        return (
            <div className="GamePhaseScores">
                <Segment className="GamePhaseScores__content">
                    <h1>Scores</h1>
                    <Scoreboard />
                    {this.game.peer?.networkMode === NetworkMode.HOST && (
                        <Button onClick={this.handleClick} icon="check" content="Next round" fluid primary />
                    )}
                </Segment>
            </div>
        );
    }
}
