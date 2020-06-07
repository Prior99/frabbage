import { GameConfig } from "./game-config";
import { UserState, Answer, CorrectAnswerOutcome } from "../game";
import { GamePhase } from "./game-phase";

export const enum MessageType {
    START_GAME = "start game",
    GAME_STATE = "game state",
    QUESTION = "question",
    ANSWER = "answer",
    SELECT_ANSWER = "select answer",
    DONE_READING = "done reading",
    NEXT_ROUND = "next round",
    SET_CORRECT_ANSWER_OUTCOME = "set correct answer outcome",
}

export interface MessageSetCorrectAnswerOutcome {
    userId: string;
    outcome: CorrectAnswerOutcome;
}

export interface MessageGameState {
    config: GameConfig;
    userStates: [string, UserState][];
    phase: GamePhase;
    round: number;
    turnOrder: string[];
    answers: [string, Answer][];
    selectedAnswers: [string, string][];
    correctAnswers: [string, string][];
    correctAnswerOutcomes: [string, CorrectAnswerOutcome][];
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
    correctAnswer: string | undefined;
}

export interface MessageSelectAnswer {
    answerId: string;
}

export interface MessageDoneReading {}

export interface MessageNextRound {}
