import { component, initialize } from "tsdi";
import { observable } from "mobx";

const localStorageIdentifier = "frabbage";
const localStorageVersion = 1;

export interface SettingsValues {
    volume: number;
    version: number;
}

@component
export class Settings {
    @observable private values!: SettingsValues;

    constructor() {
        this.reset();
    }

    @initialize protected initialize(): void {
        const json = localStorage.getItem(localStorageIdentifier);
        if (!json) { return; }
        try {
            const settings: SettingsValues = JSON.parse(json);
            if (settings.version !== localStorageVersion) {
                console.error("Outdated settings encountered.");
                localStorage.removeItem(localStorageIdentifier);
            } else {
                this.values = settings
            }
        } catch (err) {
            console.error(`Failed to parse settings: ${json}`);
            localStorage.removeItem(localStorageIdentifier);
        }
    }

    public reset(): void {
        this.values = { volume: 0.3, version: localStorageVersion };
    }

    public get volume(): number {
        return this.values.volume;
    }

    public set volume(volume: number) {
        this.values.volume = volume;
        this.save();
    }

    private save(): void {
        const { volume } = this.values;
        const json = JSON.stringify({
            volume,
            version: localStorageVersion,
        });
        localStorage.setItem(localStorageIdentifier, json);
    }
}
