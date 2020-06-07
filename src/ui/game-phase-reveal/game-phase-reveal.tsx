import * as React from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game, LoadingFeatures, CorrectAnswerOutcome } from "../../game";
import "./game-phase-reveal.scss";
import { computed, action } from "mobx";
import { GameAnswer } from "../game-answer";
import { Button, Label, Message, Icon } from "semantic-ui-react";

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
                <div className="GamePhaseReveal__instructions">Outcome:</div>
                <div className="GamePhaseReveal__answers">
                    {Array.from(this.game.answers.values())
                        .sort((a, b) => a.answerId.localeCompare(b.answerId))
                        .map((answer) => (
                            <GameAnswer key={answer.answerId} answerId={answer.answerId} reveal />
                        ))}
                </div>
                {this.game.correctAnswers.size > 0 && (
                    <>
                        <div className="GamePhaseReveal__correctAnswerInstructions">
                            These players tryed to guess the answer directly:
                        </div>
                        <div className="GamePhaseReveal__correctAnswers">
                            {Array.from(this.game.correctAnswers.entries()).map(([userId, correctAnswer]) => {
                                const correct =
                                    this.game.correctAnswerOutcomes.get(userId)! === CorrectAnswerOutcome.CORRECT;
                                return (
                                    <Message icon key={userId} color={correct ? "green" : "red"}>
                                        <Icon name={correct ? "check" : "ban"} />
                                        <Message.Content>{correctAnswer}</Message.Content>
                                        <Message.Content style={{ textAlign: "right" }}>
                                            {this.game.getUser(userId)?.name}
                                            {correct ? (
                                                <span className="GamePhaseReveal__points">+20</span>
                                            ) : (
                                                <span className="GamePhaseReveal__points GamePhaseReveal__points--wrong">
                                                    -20
                                                </span>
                                            )}
                                        </Message.Content>
                                    </Message>
                                );
                            })}
                        </div>
                    </>
                )}
                <div className="GamePhaseReveal__accept">
                    <Button as="div" labelPosition="right">
                        <Button
                            onClick={this.handleDone}
                            className="GamePhaseScoring__button"
                            primary
                            fluid
                            disabled={this.disabled || this.loading}
                            loading={this.loading}
                            content="Okay"
                            icon="check"
                        />
                        <Label basic pointing="left">
                            {this.game.userList.length - this.game.doneReading.size} missing
                        </Label>
                    </Button>
                </div>
            </div>
        );
    }
}
