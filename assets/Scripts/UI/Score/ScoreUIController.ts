import { _decorator, Component, Label, Node } from 'cc';
import { ScoreController } from '../../Game/GameController/ScoreController/ScoreController';
const { ccclass, property } = _decorator;

@ccclass('ScoreUIController')
export class ScoreUIController extends Component {

    @property(Node)
    currentScoreLabel: Node | null = null;

    @property(Node)
    highestScoreLabel: Node | null = null;

    protected start(): void {
        this.updateHighestScoreLabel();
    }

    public updateHighestScoreLabel() {
        if (this.highestScoreLabel) {
            this.highestScoreLabel.getComponent(Label).string = `Highest Score: ${ScoreController.getInstance().getHighestScore()}`;
        }
    }

    public updateCurrentScoreLabel() {
        if (this.currentScoreLabel) {
            console.log('current score ');

            this.currentScoreLabel.getComponent(Label).string = `Score: ${ScoreController.getInstance().getCurrentScore()}`;
        }
    }
}


