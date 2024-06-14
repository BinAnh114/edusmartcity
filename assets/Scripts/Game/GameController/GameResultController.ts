import { _decorator, Component, Label, Node } from 'cc';
import { ScoreController } from './ScoreController/ScoreController';
const { ccclass, property } = _decorator;

@ccclass('GameResultController')
export class GameResultController extends Component {

    @property(Node)
    finalScoreLabel: Node | null = null;

    @property(Node)
    highestScoreLabel: Node | null = null;

    start() {
        this.finalScoreLabel.getComponentInChildren(Label).string = ScoreController.getInstance().getFinalScore().toString();
        this.highestScoreLabel.getComponentInChildren(Label).string =  ScoreController.getInstance().getHighestScore().toString();
    }
}


