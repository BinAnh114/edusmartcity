import { _decorator, Component, Label, Node, ProgressBar } from 'cc';
import { TimeController } from 'db://assets/Scripts/Game/Timer/TimeController';

const { ccclass, property } = _decorator;

@ccclass('TimerFiller')
export class TimerFiller extends Component {

    @property
    duration: number = 60;

    private timer: TimeController | null = null;
    private progressBar: ProgressBar | null = null;
    private timerLabel: Label | null = null;

    private onTimeUpCallback: Function | null = null;

    start() {
        this.progressBar = this.node.getComponent(ProgressBar);
        this.timerLabel = this.node.getComponentInChildren(Label);

        this.timer = new TimeController(this.duration, this.updateFiller.bind(this), this.onTimeUp.bind(this));
        this.timer.start();
    }

    public stop(): void {
        if (this.timer) {
            this.timer.stop();
        }
    }

    public deductTime(seconds: number): void {
        if (this.timer) {
            this.timer.deductTime(seconds);
        }
    }

    update(dt: number) {
        if (this.timer && this.timer.getTimeRemaining() > 0) {
            this.updateFiller(this.timer.getTimeRemaining() - dt);
        }
    }

    private updateFiller(timeLeft: number): void {
        if (this.progressBar) {
            const fillAmount = timeLeft / this.duration;
            this.progressBar.progress = fillAmount;

            if (this.timerLabel) {
                const secondsLeft = Math.ceil(timeLeft);
                this.timerLabel.string = secondsLeft.toString();
            }
        }
    }

    public setOnTimeUpCallback(callback: Function): void {
        this.onTimeUpCallback = callback;
    }
    
    private onTimeUp(): void {
        if (this.onTimeUpCallback) {
            this.onTimeUpCallback();
        }
    }
}
