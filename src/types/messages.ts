import { GameConfig } from "./game-config";
import { UserState, Answer } from "../game";
import { GamePhase } from "./game-phase";

export const enum MessageType {
    START_GAME = "start game",
    GAME_STATE = "game state",
    QUESTION = "question",
    ANSWER = "answer",
    SELECT_ANSWER = "select answer",
    DONE_READING = "done reading",
    NEXT_ROUND = "next round"
}

export interface MessageGameState {
    config: GameConfig;
    userStates: [string, UserState][];
    phase: GamePhase;
    round: number;
    turnOrder: string[];
    answers: [string, Answer][];
    selectedAnswers: [string, string][];
    doneReading: string[];
    question: string | undefined;
}

export interface MessageStartGame {
    config: GameConfig;
}

export interface MessageQuestion {
    question: string;
}

export interface MessageAnswer {
    title: string;
    answerId: string;
}

export interface MessageSelectAnswer {
    answerId: string;
}

export interface MessageDoneReading {
}

export interface MessageNextRound {
}