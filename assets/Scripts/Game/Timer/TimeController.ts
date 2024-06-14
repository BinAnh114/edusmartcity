import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Timer')
export class TimeController {
    private timeRemaining: number;
    private intervalId: number | null = null;
    private duration: number;
    private onUpdate: (timeLeft: number) => void;
    private onTimeUp: () => void;

    constructor(duration: number, onUpdate: (timeLeft: number) => void, onTimeUp: () => void) {
        this.duration = duration;
        this.timeRemaining = duration;
        this.onUpdate = onUpdate;
        this.onTimeUp = onTimeUp;
    }

    public start(): void {
        this.timeRemaining = this.duration;
        this.intervalId = window.setInterval(() => this.updateTimer(), 1000);
    }

    public stop(): void {
        if (this.intervalId !== null) {
            window.clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    private updateTimer(): void {
        this.timeRemaining--;
        this.onUpdate(this.timeRemaining);

        if (this.timeRemaining <= 0) {
            this.stop();
            this.onTimeUp();
        }
    }

    public deductTime(seconds: number): void {
        this.timeRemaining -= seconds;
        if (this.timeRemaining < 0) this.timeRemaining = 0;
        this.onUpdate(this.timeRemaining);
    }

    public getTimeRemaining(): number {
        return this.timeRemaining;
    }
}