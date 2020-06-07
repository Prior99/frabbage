import * as React from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game, LoadingFeatures, CorrectAnswerOutcome } from "../../game";
import "./game-phase-select-answer.scss";
import { computed, observable, action } from "mobx";
import { GameAnswer } from "../game-answer";
import { Message, Icon, Button } from "semantic-ui-react";

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
                                className="GamePhaseSelectAnswer__answer"
                                key={answer.answerId}
                                answerId={answer.answerId}
                                onClick={
                                    answer.userId !== this.game.userId &&
                                    this.canSelect &&
                                    !this.game.selectedAnswers.has(this.game.userId)
                                        ? this.handleAnswerSelect
                                        : undefined
                                }
                                selected={this.game.selectedAnswers.get(this.game.userId) === answer.answerId}
                                disabled={
                                    (!this.game.isQuestionMaster && answer.userId === this.game.userId) ||
                                    (this.game.selectedAnswers.has(this.game.userId) &&
                                        this.game.selectedAnswers.get(this.game.userId) !== answer.answerId)
                                }
                            />
                        ))}
                </div>
                {this.game.isQuestionMaster && this.game.correctAnswers.size - this.game.correctAnswerOutcomes.size > 0 && (
                    <div className="GamePhaseSelectAnswer__correctAnswers">
                        <div className="GamePhaseSelectAnswer__correctAnswerInstructions">
                            Are these answers correct?
                        </div>
                        {Array.from(this.game.correctAnswers.entries())
                            .filter(([userId]) => !this.game.correctAnswerOutcomes.has(userId))
                            .map(([userId, correctAnswer]) => (
                                <Message icon key={userId}>
                                    <Icon name="question circle" />
                                    <Message.Content>
                                        {correctAnswer}
                                    </Message.Content>
                                    <Message.Content style={{ textAlign: "right" }}>
                                        <Button
                                            disabled={this.game.loading.has(LoadingFeatures.CORRECT_ANSWER_OUTCOME)}
                                            loading={this.game.loading.has(LoadingFeatures.CORRECT_ANSWER_OUTCOME)}
                                            basic
                                            content="Wrong"
                                            icon="ban"
                                            color="red"
                                            onClick={() =>
                                                this.game.sendCorrectAnswerOutcome(userId, CorrectAnswerOutcome.WRONG)
                                            }
                                        />
                                        <Button
                                            disabled={this.game.loading.has(LoadingFeatures.CORRECT_ANSWER_OUTCOME)}
                                            loading={this.game.loading.has(LoadingFeatures.CORRECT_ANSWER_OUTCOME)}
                                            icon="check"
                                            color="green"
                                            onClick={() =>
                                                this.game.sendCorrectAnswerOutcome(userId, CorrectAnswerOutcome.CORRECT)
                                            }
                                            basic
                                            content="Correct"
                                        />
                                    </Message.Content>
                                </Message>
                            ))}
                    </div>
                )}
            </div>
        );
    }
}
