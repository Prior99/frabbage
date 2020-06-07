import * as React from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game, LoadingFeatures } from "../../game";
import "./game-phase-reveal.scss";
import { computed, action } from "mobx";
import { GameAnswer } from "../game-answer";
import { Button } from "semantic-ui-react";

export interface GamePhaseRevealProps {
    className?: string;
}

@external
@observer
export class GamePhaseReveal extends React.Component<GamePhaseRevealProps> {
    @inject private game!: Game;

    @computed private get classNames(): string {
        return classNames(this.props.className, "GamePhaseReveal", {
            "GamePhaseReveal--questionMaster": this.game.isQuestionMaster,
            "GamePhaseReveal--riddler": this.game.isRiddler,
        });
    }

    @action.bound private handleDone(): void {
        this.game.sendDoneReading();
    }

    @computed private get loading(): boolean {
        return this.game.loading.has(LoadingFeatures.DONE_READING);
    }

    @computed private get disabled(): boolean {
        return this.game.doneReading.has(this.game.userId);
    }

    public render(): JSX.Element {
        return (
            <div className={this.classNames}>
                <div className="GamePhaseReveal__answers">
                    {Array.from(this.game.answers.values())
                        .sort((a, b) => a.answerId.localeCompare(b.answerId))
                        .map((answer) => (
                            <GameAnswer key={answer.answerId} answerId={answer.answerId} reveal />
                        ))}
                </div>
                <Button
                    onClick={this.handleDone}
                    disabled={this.disabled || this.loading}
                    loading={this.loading}
                    content="Okay"
                    icon="check"
                />
            </div>
        );
    }
}
