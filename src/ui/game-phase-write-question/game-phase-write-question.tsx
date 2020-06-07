import * as React from "react";
import classNames from "classnames";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game, LoadingFeatures } from "../../game";
import "./game-phase-write-question.scss";
import { computed, observable, action } from "mobx";
import { Form } from "semantic-ui-react";

export interface GamePhaseWriteQuestionProps {
    className?: string;
}

@external
@observer
export class GamePhaseWriteQuestion extends React.Component<GamePhaseWriteQuestionProps> {
    @inject private game!: Game;
    @observable private question = "";

    @computed private get classNames(): string {
        return classNames(this.props.className, "GamePhaseWriteQuestion", {
            "GamePhaseWriteQuestion--questionMaster": this.game.isQuestionMaster,
            "GamePhaseWriteQuestion--riddler": this.game.isRiddler,
        });
    }

    @action.bound private handleQuestionChange(evt: React.SyntheticEvent<HTMLInputElement>): void {
        this.question = evt.currentTarget.value;
    }

    @action.bound private async handleSubmit(evt: React.SyntheticEvent<HTMLFormElement>): Promise<void> {
        evt.preventDefault();
        const { question } = this;
        await this.game.sendQuestion(question);
        this.question = "";
    }

    @computed private get disabled(): boolean {
        return this.loading || Boolean(this.game.question);
    }

    @computed private get loading(): boolean {
        return this.game.loading.has(LoadingFeatures.QUESTION);
    }

    public render(): JSX.Element {
        return (
            <div className={this.classNames}>
                <>
                    <div className="GamePhaseWriteQuestion__instructions">
                        {this.game.isRiddler ? (
                            <>Waiting for {this.game.questionMaster?.name} to come up with a question...</>
                        ) : (
                            <>
                                Come up with a a hard question for{" "}
                                {this.game.allRiddlers.map(({ name }) => name).join(", ")} to answer...
                            </>
                        )}
                    </div>
                    {this.game.isQuestionMaster && (
                        <Form className="GamePhaseWriteQuestion__form" onSubmit={this.handleSubmit}>
                            <Form.Field>
                                <Form.Input
                                    disabled={this.disabled}
                                    value={this.question}
                                    onChange={this.handleQuestionChange}
                                    inverted
                                />
                            </Form.Field>
                            <Form.Field>
                                <Form.Button
                                    disabled={this.disabled || this.question.length === 0}
                                    loading={this.loading}
                                    content="Okay"
                                    icon="check"
                                    fluid
                                    inverted
                                />
                            </Form.Field>
                        </Form>
                    )}
                </>
            </div>
        );
    }
}
