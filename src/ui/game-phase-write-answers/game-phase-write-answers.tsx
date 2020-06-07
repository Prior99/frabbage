import * as React from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game, LoadingFeatures } from "../../game";
import "./game-phase-write-answers.scss";
import { computed, observable, action } from "mobx";
import { Form } from "semantic-ui-react";

export interface GamePhaseWriteAnswersProps {
    className?: string;
}

@external
@observer
export class GamePhaseWriteAnswers extends React.Component<GamePhaseWriteAnswersProps> {
    @inject private game!: Game;
    @observable private title = "";
    @observable private correctAnswer = "";

    @computed private get classNames(): string {
        return classNames(this.props.className, "GamePhaseWriteAnswers", {
            "GamePhaseWriteAnswers--questionMaster": this.game.isQuestionMaster,
        });
    }

    @action.bound private handleCorrectAnswerChange(evt: React.SyntheticEvent<HTMLInputElement>): void {
        this.correctAnswer = evt.currentTarget.value;
    }

    @action.bound private handleTitleChange(evt: React.SyntheticEvent<HTMLInputElement>): void {
        this.title = evt.currentTarget.value;
    }

    @action.bound private async handleSubmit(evt: React.SyntheticEvent<HTMLFormElement>): Promise<void> {
        evt.preventDefault();
        const { title, correctAnswer } = this;
        await this.game.sendAnswer(title, correctAnswer ? correctAnswer : undefined);
        this.title = "";
        this.correctAnswer = "";
    }

    @computed private get disabled(): boolean {
        return this.loading || Boolean(this.game.submittedAnswer);
    }

    @computed private get loading(): boolean {
        return this.game.loading.has(LoadingFeatures.ANSWER);
    }

    @computed private get instructions(): JSX.Element {
        if (this.game.submittedAnswer) {
            return (
                <div className="GamePhaseWriteAnswers__question">
                    Waiting for {this.game.missingAnswerUsers.map((user) => user.name).join(", ")}...
                </div>
            );
        }
        return <div className="GamePhaseWriteAnswers__question">{this.game.question}</div>;
    }

    public render(): JSX.Element {
        return (
            <div className={this.classNames}>
                <>
                    <div className="GamePhaseWriteAnswers__instructions">{this.instructions}</div>
                    <Form className="GamePhaseWriteAnswers__form" onSubmit={this.handleSubmit}>
                        <Form.Field>
                            <label>
                                {this.game.isQuestionMaster ? "Write the correct answer." : "Write a made-up answer."}
                            </label>
                            <Form.Input
                                disabled={this.disabled}
                                value={this.title}
                                onChange={this.handleTitleChange}
                                inverted
                            />
                        </Form.Field>
                        {!this.game.isQuestionMaster && (
                            <>
                                <Form.Field>
                                    <label>If you happen to really know the correct answer, enter it below.</label>
                                    <Form.Input
                                        disabled={this.disabled}
                                        value={this.correctAnswer}
                                        onChange={this.handleCorrectAnswerChange}
                                        inverted
                                    />
                                </Form.Field>
                            </>
                        )}
                        <Form.Field>
                            <Form.Button
                                disabled={this.disabled || this.title.length === 0}
                                loading={this.loading}
                                content="Okay"
                                icon="check"
                                fluid
                                inverted
                            />
                        </Form.Field>
                    </Form>
                </>
            </div>
        );
    }
}
