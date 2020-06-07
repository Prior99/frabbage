import * as React from "react";
import { external, inject } from "tsdi";
import { observer } from "mobx-react";
import { Game } from "../../game";
import { Table, Icon } from "semantic-ui-react";
import classNames from "classnames";
import { computed } from "mobx";
import "./scoreboard.scss";
import { UserTable } from "p2p-networking-semantic-ui-react";

export interface ScoreboardProps {
    className?: string;
}

@external
@observer
export class Scoreboard extends React.Component<ScoreboardProps> {
    @inject private game!: Game;

    @computed private get classNames(): string {
        return classNames("Scoreboard", this.props.className);
    }

    public render(): JSX.Element {
        return (
            <UserTable
                headerCells={() => (
                    <>
                        <Table.HeaderCell className="Scoreboard__rankHeader">
                            <Icon name="trophy" />
                        </Table.HeaderCell>
                        <Table.HeaderCell textAlign="right" className="Scoreboard__scoreHeader">
                            Score
                        </Table.HeaderCell>
                    </>
                )}
                customCells={(user) => (
                    <>
                        <Table.Cell className="ScoreboardRow__rank">{this.game.getRank(user.id)}</Table.Cell>
                        <Table.Cell textAlign="right" className="ScoreboardRow__score">
                            {(this.game.userStates.get(user.id)?.score ?? 0).toLocaleString()}
                        </Table.Cell>
                    </>
                )}
                peer={this.game.peer!}
                nameFactory={(user) => user.name}
                unstackable
                className={this.classNames}
            />
        );
    }
}
