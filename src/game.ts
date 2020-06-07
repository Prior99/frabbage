import { create as randomSeed } from "random-seed";
import NomineLipsum from "nomine-lipsum";
import { MessageFactory, PeerOptions } from "p2p-networking";
import { ObservablePeer, createObservableClient, createObservableHost } from "p2p-networking-mobx";
import { computed, action, observable } from "mobx";
import { component, inject } from "tsdi";
import {
    GameConfig,
    GamePhase,
    AppUser,
    MessageType,
    MessageGameState,
    MessageStartGame,
    MessageQuestion,
    MessageAnswer,
    MessageSelectAnswer,
    MessageDoneReading,
    MessageNextRound,
} from "./types";
import { v4 } from "uuid";
import { shuffle } from "./utils";
import {
    Audios,
    audioNextPhase,
    audioAnswerAddOther,
    audioAnswerAddSelf,
    audioQuestionDone,
    audioAcceptWaiting,
} from "./audio";

declare const SOFTWARE_VERSION: string;

export interface Score {
    rank: number;
    score: number;
    playerName: string;
    playerId: string;
}

export const enum LoadingFeatures {
    START_GAME = "start game",
    NEXT_ROUND = "next round",
    QUESTION = "question",
    ANSWER = "answer",
    SELECT_ANSWER = "select answer",
    DONE_READING = "done reading",
}

export interface UserState {
    score: number;
}

export interface Answer {
    answerId: string;
    title: string;
    userId: string;
}

@component
export class Game {
    @inject private audios!: Audios;

    @observable.ref public peer: ObservablePeer<AppUser, MessageType> | undefined = undefined;
    @observable public config: GameConfig = { seed: v4() };
    @observable public phase = GamePhase.LOBBY;

    @observable public round = 0;
    @observable public loading = new Set<LoadingFeatures>();
    @observable public userStates = new Map<string, UserState>();
    @observable public turnOrder: string[] = [];
    @observable public answers = new Map<string, Answer>();
    @observable public selectedAnswers = new Map<string, string>();
    @observable public doneReading = new Set<string>();
    @observable public question?: string;

    private messageGameState?: MessageFactory<MessageType, MessageGameState>;
    private messageStartGame?: MessageFactory<MessageType, MessageStartGame>;
    private messageQuestion?: MessageFactory<MessageType, MessageQuestion>;
    private messageAnswer?: MessageFactory<MessageType, MessageAnswer>;
    private messageSelectAnswer?: MessageFactory<MessageType, MessageSelectAnswer>;
    private messageDoneReading?: MessageFactory<MessageType, MessageDoneReading>;
    private messageNextRound?: MessageFactory<MessageType, MessageNextRound>;

    @computed public get userName(): string {
        console.log(this.peer?.disconnectedUsers);
        return this.user?.name ?? "";
    }

    @computed public get userId(): string {
        return this.peer?.userId ?? "";
    }

    @computed public get scoreList(): Score[] {
        return Array.from(this.userStates.entries())
            .sort(([_idA, a], [_idB, b]) => b.score - a.score)
            .map(([playerId, { score }], index) => ({
                playerId,
                playerName: this.getUser(playerId)?.name ?? "",
                score,
                rank: index + 1,
            }));
    }

    @computed public get userList(): AppUser[] {
        return this.peer?.users ?? [];
    }

    @computed public get user(): AppUser | undefined {
        return this.getUser(this.userId);
    }

    @computed public get questionMaster(): AppUser | undefined {
        return this.userList.find((user) => this.isUserQuestionMaster(user.id));
    }

    public getUser(userId: string): AppUser | undefined {
        return this.peer?.getUser(userId);
    }

    public getRank(playerId: string): number {
        return this.scoreList.find((entry) => entry.playerId === playerId)?.rank ?? 0;
    }

    public changeName(newName: string): void {
        this.peer?.updateUser({ name: newName });
    }

    public async sendStartGame(): Promise<void> {
        if (!this.messageStartGame) {
            throw new Error("Network not initialized.");
        }
        this.loading.add(LoadingFeatures.START_GAME);
        try {
            await this.messageStartGame.send({ config: this.config }).waitForAll();
        } finally {
            this.loading.delete(LoadingFeatures.START_GAME);
        }
    }

    public async sendNextRound(): Promise<void> {
        if (!this.messageNextRound) {
            throw new Error("Network not initialized.");
        }
        this.loading.add(LoadingFeatures.NEXT_ROUND);
        try {
            await this.messageNextRound.send({ config: this.config }).waitForAll();
        } finally {
            this.loading.delete(LoadingFeatures.NEXT_ROUND);
        }
    }

    public async sendQuestion(question: string): Promise<void> {
        if (!this.messageQuestion) {
            throw new Error("Network not initialized.");
        }
        this.loading.add(LoadingFeatures.QUESTION);
        try {
            await this.messageQuestion.send({ question }).waitForAll();
        } finally {
            this.loading.delete(LoadingFeatures.QUESTION);
        }
    }

    public async sendAnswer(title: string): Promise<void> {
        if (!this.messageAnswer) {
            throw new Error("Network not initialized.");
        }
        this.loading.add(LoadingFeatures.ANSWER);
        try {
            await this.messageAnswer.send({ title, answerId: v4() }).waitForAll();
        } finally {
            this.loading.delete(LoadingFeatures.ANSWER);
        }
    }

    public async sendSelectAnswer(answerId: string): Promise<void> {
        if (!this.messageSelectAnswer) {
            throw new Error("Network not initialized.");
        }
        this.loading.add(LoadingFeatures.SELECT_ANSWER);
        try {
            await this.messageSelectAnswer.send({ answerId }).waitForAll();
        } finally {
            this.loading.delete(LoadingFeatures.SELECT_ANSWER);
        }
    }

    public async sendDoneReading(): Promise<void> {
        if (!this.messageDoneReading) {
            throw new Error("Network not initialized.");
        }
        this.loading.add(LoadingFeatures.DONE_READING);
        try {
            await this.messageDoneReading.send({}).waitForAll();
        } finally {
            this.loading.delete(LoadingFeatures.DONE_READING);
        }
    }

    @computed public get canSelectAnswer(): boolean {
        return this.questionMaster?.id === this.userId && this.phase === GamePhase.SELECT_ANSWER;
    }

    @computed public get submittedAnswer(): Answer | undefined {
        return Array.from(this.answers.values()).find((modifier) => modifier.userId === this.userId);
    }

    public isUserQuestionMaster(userId: string): boolean {
        return this.turnOrder[this.round % this.turnOrder.length] === userId;
    }

    @computed public get isQuestionMaster(): boolean {
        return this.isUserQuestionMaster(this.userId);
    }

    public isUserRiddler(userId: string): boolean {
        return !this.isUserQuestionMaster(userId);
    }

    @computed public get isRiddler(): boolean {
        return this.isUserRiddler(this.userId);
    }

    @computed public get allRiddlers(): AppUser[] {
        return this.turnOrder.filter((id) => this.isUserRiddler(id)).map((id) => this.getUser(id)!);
    }

    @computed public get finishedAnswerUsers(): AppUser[] {
        const modifiers = Array.from(this.answers.values());
        return this.allRiddlers.filter((user) => modifiers.some((modifier) => modifier.userId === user.id));
    }

    @computed public get missingAnswerUsers(): AppUser[] {
        return this.allRiddlers.filter((user) => !this.finishedAnswerUsers.some((other) => other.id === user.id));
    }

    @action.bound private startTurn(): void {
        this.question = undefined;
        for (const { id } of this.userList) {
            const state = this.userStates.get(id);
            if (!state) {
                this.userStates.set(id, {
                    score: 0,
                });
            }
            this.selectedAnswers.clear();
            this.doneReading.clear();
            this.answers.clear();
        }
        if (!this.peer) {
            throw new Error("Network not initialized.");
        }
        this.nextPhase(GamePhase.WRITE_QUESTION);
    }

    @action.bound private nextPhase(phase: GamePhase, mute = false): void {
        if (!mute) {
            this.audios.play(audioQuestionDone);
        }
        this.phase = phase;
    }

    @action.bound public async initialize(networkId?: string, userId?: string): Promise<void> {
        const options: PeerOptions<AppUser> = {
            applicationProtocolVersion: `${SOFTWARE_VERSION}`,
            peerJsOptions: {
                host: "peerjs.92k.de",
                secure: true,
            },
            pingInterval: 4,
            timeout: 10,
        };
        const user = {
            name: NomineLipsum.full(),
        };
        this.peer =
            typeof networkId === "string"
                ? await createObservableClient(options, networkId, userId ? userId : user)
                : await createObservableHost(options, user);
        this.messageGameState = this.peer.message<MessageGameState>(MessageType.GAME_STATE);
        this.messageStartGame = this.peer.message<MessageStartGame>(MessageType.START_GAME);
        this.messageQuestion = this.peer.message<MessageQuestion>(MessageType.QUESTION);
        this.messageAnswer = this.peer.message<MessageAnswer>(MessageType.ANSWER);
        this.messageSelectAnswer = this.peer.message<MessageSelectAnswer>(MessageType.SELECT_ANSWER);
        this.messageDoneReading = this.peer.message<MessageDoneReading>(MessageType.DONE_READING);
        this.messageNextRound = this.peer.message<MessageNextRound>(MessageType.NEXT_ROUND);

        this.messageGameState?.subscribe(
            action(
                ({ config, userStates, phase, round, turnOrder, answers, selectedAnswers, doneReading, question }) => {
                    this.config = config;
                    this.userStates = new Map(userStates);
                    this.phase = phase;
                    this.round = round;
                    this.turnOrder = turnOrder;
                    this.answers = new Map(answers);
                    this.selectedAnswers = new Map(selectedAnswers);
                    this.doneReading = new Set(doneReading);
                    this.question = question;
                },
            ),
        );
        this.messageAnswer.subscribe(({ title, answerId }, userId) => {
            this.answers.set(answerId, { title, answerId, userId });
            if (
                !this.userList.every(({ id }) =>
                    Array.from(this.answers.values()).some((answer) => answer.userId === id),
                )
            ) {
                if (this.userId === userId) {
                    this.audios.play(audioAnswerAddSelf);
                } else {
                    this.audios.play(audioAnswerAddOther);
                }
                return;
            }
            this.nextPhase(GamePhase.SELECT_ANSWER);
        });
        this.messageQuestion.subscribe(({ question }) => {
            this.question = question;
            this.audios.play(audioQuestionDone);
            this.nextPhase(GamePhase.WRITE_ANSWERS, true);
        });
        this.messageSelectAnswer.subscribe(({ answerId }, userId) => {
            this.selectedAnswers.set(userId, answerId);
            if (this.allRiddlers.every(({ id }) => this.selectedAnswers.has(id))) {
                this.nextPhase(GamePhase.REVEAL);
            } else {
                if (this.userId === userId) {
                    this.audios.play(audioAnswerAddSelf);
                } else {
                    this.audios.play(audioAnswerAddOther);
                }
            }
        });
        this.messageDoneReading.subscribe((_, userId) => {
            this.doneReading.add(userId);
            if (this.doneReading.size === this.allRiddlers.length - 1 && !this.doneReading.has(this.userId)) {
                this.audios.play(audioAcceptWaiting);
            } else {
                if (this.userId === userId) {
                    this.audios.play(audioAnswerAddSelf);
                } else {
                    this.audios.play(audioAnswerAddOther);
                }
            }
            if (this.userList.every(({ id }) => this.doneReading.has(id))) {
                this.selectedAnswers.forEach((answerId, userId) => {
                    const answer = this.answers.get(answerId);
                    if (answer?.userId === this.questionMaster?.id) {
                        this.userStates.get(userId)!.score += 20;
                    } else {
                        this.userStates.get(answer!.userId)!.score += 10;
                    }
                });
                if (
                    !Array.from(this.selectedAnswers.values()).includes(
                        Array.from(this.answers.values()).find((answer) => this.questionMaster!.id === answer.userId)!
                            .answerId,
                    )
                ) {
                    this.userStates.get(this.questionMaster!.id)!.score += 20;
                }
                this.nextPhase(GamePhase.SCORES);
            }
        });
        this.messageStartGame.subscribe(({ config }) => {
            this.audios.play(audioQuestionDone);
            this.config = config;
            const rng = randomSeed(config.seed);
            this.turnOrder = shuffle(
                this.userList.map(({ id }) => id),
                () => rng.floatBetween(0, 1),
            );
            this.startTurn();
        });
        this.messageNextRound.subscribe(() => {
            this.round++;
            this.startTurn();
        });
        this.peer.on("userreconnect", (user) => {
            if (!this.peer?.isHost) {
                return;
            }
            this.messageGameState?.send(
                {
                    config: this.config,
                    answers: Array.from(this.answers.entries()),
                    userStates: Array.from(this.userStates.entries()),
                    selectedAnswers: Array.from(this.selectedAnswers.entries()),
                    turnOrder: this.turnOrder,
                    round: this.round,
                    phase: this.phase,
                    doneReading: Array.from(this.doneReading.values()),
                    question: this.question,
                },
                user.id,
            );
        });
    }
}
