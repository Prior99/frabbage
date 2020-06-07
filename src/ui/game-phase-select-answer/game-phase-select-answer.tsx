import * as React from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game, LoadingFeatures } from "../../game";
import "./game-phase-select-answer.scss";
import { computed, observable, action } from "mobx";
import { GameAnswer } from "../game-answer";

export interface GamePhaseSelectAnswerProps {
    className?: string;
}

@external
@observer
export class GamePhaseSelectAnswer extends React.Component<GamePhaseSelectAnswerProps> {
    @inject private game!: Game;
    @observable private question = "";

    @computed private get classNames(): string {
        return classNames(this.props.className, "GamePhaseSelectAnswer", {
            "GamePhaseSelectAnswer--questionMaster": this.game.isQuestionMaster,
            "GamePhaseSelectAnswer--riddler": this.game.isRiddler,
        });
    }

    @action.bound private handleAnswerSelect(answerId: string): void {
        this.game.sendSelectAnswer(answerId);
    }

    @computed private get loading(): boolean {
        return this.game.loading.has(LoadingFeatures.QUESTION);
    }

    @computed private get canSelect(): boolean {
        if (this.loading) {
            return false;
        }
        return !this.game.isQuestionMaster || this.game.selectedAnswers.has(this.game.userId);
    }

    public render(): JSX.Element {
        return (
            <div className={this.classNames}>
                <div className="GamePhaseSelectAnswer__instructions">
                    {!this.canSelect ? (
                        <>
                            Waiting for {this.game.allRiddlers.map(({ name }) => name).join(", ")} to find the correct
                            answer...
                        </>
                    ) : (
                        <>{this.game.question}</>
                    )}
                </div>
                <div className="GamePhaseSelectAnswer__answers">
                    {Array.from(this.game.answers.values())
                        .sort((a, b) => a.answerId.localeCompare(b.answerId))
                        .map((answer) => (
                            <GameAnswer
                                key={answer.answerId}
                                answerId={answer.answerId}
                                onClick={
                                    this.canSelect && !this.game.selectedAnswers.has(this.game.userId)
                                        ? this.handleAnswerSelect
                                        : undefined
                                }
                                selected={this.game.selectedAnswers.get(this.game.userId) === answer.answerId}
                                disabled={
                                    this.game.selectedAnswers.has(this.game.userId) &&
                                    this.game.selectedAnswers.get(this.game.userId) !== answer.answerId
                                }
                            />
                        ))}
                </div>
            </div>
        );
    }
}
