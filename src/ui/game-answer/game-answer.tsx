import * as React from "react";
import classNames from "classnames";
import "./game-answer.scss";
import { Segment } from "semantic-ui-react";
import { Answer, Game } from "../../game";
import { observer } from "mobx-react";
import { computed, action, observable } from "mobx";
import { inject, external } from "tsdi";
import { AppUser } from "../../types";
import { Audios, audioHover } from "../../audio";
import { SemanticCOLORS } from "semantic-ui-react/dist/commonjs/generic";

export interface GameAnswerProps {
    answerId: string;
    selected?: boolean;
    className?: string;
    reveal?: boolean;
    onClick?: (answerId: string) => void;
    disabled?: boolean;
}

@external
@observer
export class GameAnswer extends React.Component<GameAnswerProps> {
    @inject private game!: Game;
    @inject private audios!: Audios;

    @observable private modifier: string | undefined;

    @computed private get user(): AppUser | undefined {
        if (!this.answer) {
            return;
        }
        return this.game.getUser(this.answer.userId);
    }

    @computed private get answer(): Answer | undefined {
        return this.game.answers.get(this.props.answerId);
    }

    @computed private get className(): string {
        return classNames("GameAnswer", this.props.className, {
            "GameAnswer--clickable": this.props.onClick,
            "GameAnswer--selected": this.props.selected,
            "GameAnswer--disabled": this.props.disabled,
        });
    }

    @action.bound private handleHover(): void {
        if (!this.props.onClick) {
            return;
        }
        this.audios.play(audioHover);
    }

    @action.bound private handleClick(): void {
        if (!this.props.onClick) {
            return;
        }
        this.props.onClick(this.props.answerId);
    }

    @computed private get correct(): boolean {
        return this.answer?.userId === this.game.questionMaster?.id;
    }

    @computed private get color(): SemanticCOLORS {
        return this.correct && (this.props.reveal || this.game.isQuestionMaster) ? "green" : "orange";
    }

    @computed private get fools(): AppUser[] {
        return this.game.userList.filter((user) => this.game.selectedAnswers.get(user.id) === this.answer?.answerId);
    }

    public render(): JSX.Element {
        return (
            <Segment.Group raised className={this.className} onClick={this.handleClick} onMouseEnter={this.handleHover}>
                <Segment inverted color={this.color} className="GameAnswer__title">
                    {this.answer?.title}
                </Segment>
                {this.props.reveal && (
                    <Segment className="GameAnswer__reveal">
                        <div className="GameAnswer__meta">
                            <div className="GameAnswer__revealTitle">Author</div>
                            {this.user?.name}
                            {!this.correct && this.fools.length > 0 && <span className="GameAnswer__points">+{this.fools.length * 10}</span>}
                            {this.correct && this.fools.length === 0 && <span className="GameAnswer__points">+20</span>}
                        </div>
                        {this.fools.length > 0 && (
                            <div className="GameAnswer__meta">
                                <div className="GameAnswer__revealTitle">{this.correct ? "Guessed" : "Fooled"}</div>
                                <ul className="GameAnswer__foolList">
                                    {this.fools.map((user) => (
                                        <li key={user.id}>
                                            {user.name}
                                            {this.correct && <span className="GameAnswer__points">+20</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </Segment>
                )}
            </Segment.Group>
        );
    }
}
