import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ScoreController')
export class ScoreController extends Component {
    private static instance: ScoreController;

    private currentScore: number = 0;
    private highestScore: number = 0;
    
    public finalScore: number = 0;

    public static getInstance(): ScoreController {
        if (!ScoreController.instance) {
            ScoreController.instance = new ScoreController();
        }
        return ScoreController.instance;
    }

    protected start(): void {
        this.currentScore = 0;
        this.loadHighestScore();
    }

    public addPoints(points: number) {
        this.currentScore += points;
        this.checkForHighestScore();
    }

    public resetScore() {
        this.currentScore = 0;
    }

    public getCurrentScore() {
        return this.currentScore;
    }

    public getHighestScore() {
        return this.highestScore;
    }

    public getFinalScore()
    {
        return this.finalScore;
    }

    private checkForHighestScore() {
        if (this.currentScore > this.highestScore) {
            this.highestScore = this.currentScore;
            this.saveHighestScore();
        }
    }

    private loadHighestScore() {
        const savedScore = localStorage.getItem('highestScore');
        if (savedScore) {
            this.highestScore = parseInt(savedScore);
        }
    }

    private saveHighestScore() {
        localStorage.setItem('highestScore', this.highestScore.toString());
    }

    public calculateFinalScore()
    {
        this.finalScore = this.currentScore;
    }
}


