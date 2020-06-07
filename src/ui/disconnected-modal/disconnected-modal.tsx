import * as React from "react";
import { observer } from "mobx-react";
import { external, inject } from "tsdi";
import { Game } from "../../game";
import { Dimmer, Loader } from "semantic-ui-react";
import { computed } from "mobx";
import { AppUser } from "../../types";
import { ReconnectMessage } from "p2p-networking-semantic-ui-react";

@observer
@external
export class DisconnectedModal extends React.Component {
    @inject private game!: Game;

    @computed private get disconnected(): AppUser[] {
        return this.game.peer?.disconnectedUsers ?? [];
    }

    @computed private get active(): boolean {
        return Boolean(this.game.peer) && this.disconnected.length > 0;
    }

    public render(): JSX.Element {
        return (
            <Dimmer style={{ textAlign: "left" }} active={this.active}>
                {this.game.peer?.isHost ? (
                    this.disconnected.map((user) => (
                        <ReconnectMessage
                            style={{ width: 800 }}
                            peer={this.game.peer}
                            key={user.id}
                            nameFactory={(user: AppUser) => user.name}
                            urlFactory={(peerId, user) =>
                                location.href.replace(location.hash, `#/game/client/${peerId}/${user.id}`)
                            }
                            userId={user.id}
                        />
                    ))
                ) : (
                    <Loader>Waiting for other user...</Loader>
                )}
            </Dimmer>
        );
    }
}
