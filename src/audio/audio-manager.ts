import { component } from "tsdi";
import { Audio } from "./audio";

@component
export class AudioManager {
    private audios = new Map<string, Audio>();

    public async load(url: string, gain: number): Promise<void> {
        const audio = new Audio(url, gain);
        await audio.load();
        this.audios.set(url, audio);
    }

    public audio(url: string): Audio {
        if (!this.audios.has(url)) {
            throw new Error(`Attempted to get audio which was not loaded: ${url}`);
        }
        return this.audios.get(url)!;
    }
}
