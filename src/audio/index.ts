export * from "./audio";
export * from "./audio-manager";
export * from "./audios";

import audioAnswerAddOther from "../../assets/sound-answer-add-other.mp3";
import audioAnswerAddSelf from "../../assets/sound-answer-add-self.mp3";
import audioNextPhase from "../../assets/sound-next-phase.mp3";
import audioQuestionDone from "../../assets/sound-question-done.mp3";
import audioAcceptWaiting from "../../assets/sound-accept-waiting.mp3";
import audioHover from "../../assets/sound-hover.mp3";

export { audioAnswerAddOther, audioAnswerAddSelf, audioNextPhase, audioQuestionDone, audioAcceptWaiting, audioHover };

export const allAudios = [
    { url: audioAnswerAddOther, gain: 1.0 },
    { url: audioAnswerAddSelf, gain: 1.0 },
    { url: audioNextPhase, gain: 1.0 },
    { url: audioQuestionDone, gain: 1.0 },
    { url: audioAcceptWaiting, gain: 1.0 },
    { url: audioHover, gain: 1.0 },
];
