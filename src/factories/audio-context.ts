import { component, factory, initialize } from "tsdi";

@component
export class FactoryAudioContext {
    private audioContext!: AudioContext;

    @initialize
    public async initialize(): Promise<void> {
        this.audioContext = new AudioContext();
    }

    @factory({ name: "AudioContext" })
    public getAudioContext(): AudioContext {
        return this.audioContext;
    }
}
