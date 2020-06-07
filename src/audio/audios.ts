import { component, inject, initialize } from "tsdi";
import { Settings } from "../settings";
import { autorun } from "mobx";
import { AudioManager } from "./audio-manager";

@component
export class Audios {
    @inject private audioManager!: AudioManager;
    @inject("AudioContext") private audioContext!: AudioContext;
    @inject private settings!: Settings;

    private soundsNode!: GainNode;

    @initialize protected initialize(): void {
        this.soundsNode = this.audioContext.createGain();
        this.soundsNode.connect(this.audioContext.destination);

        autorun(() => {
            this.soundsNode.gain.value = this.settings.volume;
        });
    }

    public play(url: string): void {
        const audio = this.audioManager.audio(url);
        const { gain, source } = audio.createSource();
        gain.connect(this.soundsNode);
        source.start();
    }
}