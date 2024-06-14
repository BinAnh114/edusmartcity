import { _decorator, assetManager, Component, Sprite, SpriteFrame, Node, resources, Label, Button, director } from 'cc';
import { ScoreUIController } from '../../../UI/Score/ScoreUIController';
import { TimerFiller } from '../../../UI/Timer/TimerFiller';
import { ScoreController } from '../ScoreController/ScoreController';
const { ccclass, property } = _decorator;

interface ZooQuestion {
    correctAnswer: string;
    options: string[];
}

@ccclass('ZooGameController')
export class ZooGameController extends Component {

    private timerFiller: TimerFiller | null = null;

    private currentQuestion: ZooQuestion | null = null;
    private questionCount: number = 0;

    private spriteFrames: SpriteFrame[] = [];
    private currentImageIndex: number = 0;

    @property(Node)
    imageContainer: Node | null = null;

    @property(Node)
    listAnswer: Node[] = [];

    @property(Node)
    timerNode: Node | null = null;

    @property(ScoreUIController)
    scoreUIController: ScoreUIController | null = null;

    @property(Node)
    questionCountLabel: Node | null = null;

    start() {
        if (this.timerNode) {
            this.timerFiller = this.timerNode.getComponent(TimerFiller);
            if (this.timerFiller) {
                this.timerFiller.setOnTimeUpCallback(this.endGame.bind(this));
                this.timerFiller.start();
            }
        }
        this.loadAllPictures();
    }

    private loadAllPictures() {
        resources.loadDir('GameRes/ZooPictureSrc', SpriteFrame, (err, spriteFrames) => {
            if (err) {
                console.error(err);
                return;
            }
            this.spriteFrames = spriteFrames;
            this.startGame();
        });
    }

    startGame() {
        console.log("Game started!");
        this.questionCount = 0;
        this.currentImageIndex = 0;
        if (ScoreController.getInstance()) {
            ScoreController.getInstance().resetScore();
            this.scoreUIController.updateCurrentScoreLabel();
        }
        this.generateQuestion();
    }

    private generateQuestion() {
        if (this.questionCount >= this.spriteFrames.length) {
            this.endGame();
            return;
        }

        this.questionCount++;
        this.displayQuestion();
    }

    private displayQuestion() {
        if (this.questionCountLabel) {
            const label = this.questionCountLabel.getComponentInChildren(Label);
            if (label) {
                label.string = `Question Number: ${this.questionCount} / ${this.spriteFrames.length}`;
            }
        }

        const spriteFrame = this.spriteFrames[this.currentImageIndex];
        const correctAnswer = spriteFrame.name;
        const options = this.generateOptions(correctAnswer);

        this.currentQuestion = { correctAnswer, options };

        this.listAnswer.forEach((node, index) => {
            const button = node.getComponent(Button);
            const label = node.getComponentInChildren(Label);

            if (button && label && this.currentQuestion) {
                label.string = this.currentQuestion.options[index];
                button.node.off('click', this.onAnswerClick, this);
                button.node.on('click', this.onAnswerClick, this);
            }
        });

        this.displayPicture(spriteFrame);

        this.currentImageIndex++;
        if (this.currentImageIndex >= this.spriteFrames.length) {
            this.currentImageIndex = 0;
        }
    }

    private generateOptions(correctAnswer: string): string[] {
        const options = new Set<string>();
        options.add(correctAnswer);

        while (options.size < 4) {
            const randomIndex = Math.floor(Math.random() * this.spriteFrames.length);
            const option = this.spriteFrames[randomIndex].name;
            options.add(option);
        }

        return Array.from(options).sort(() => Math.random() - 0.5);
    }

    private onAnswerClick(buttonNode: Button) {
        const label = buttonNode.getComponentInChildren(Label);
        if (label) {
            this.submitAnswer(label.string);
        }
    }

    private submitAnswer(answer: string) {
        if (!this.currentQuestion) return;

        if (answer === this.currentQuestion.correctAnswer) {
            console.log('Correct Answer!');
            if (ScoreController.getInstance()) {
                ScoreController.getInstance().addPoints(10);
                this.scoreUIController.updateCurrentScoreLabel();
            }
            this.generateQuestion();
        } else {
            console.log('Wrong Answer!');
            this.generateQuestion();
        }
    }

    private displayPicture(spriteFrame: SpriteFrame) {
        if (!this.imageContainer) {
            console.error('Image container node not set');
            return;
        }
        const sprite = this.imageContainer.getComponent(Sprite);
        if (sprite) {
            sprite.spriteFrame = spriteFrame;
        } else {
            const newSprite = this.imageContainer.addComponent(Sprite);
            newSprite.spriteFrame = spriteFrame;
        }
    }

    private endGame() {
        if (this.timerFiller) {
            this.timerFiller.stop();
        }
        if (ScoreController.getInstance()) {
            ScoreController.getInstance().calculateFinalScore();
        }
        director.loadScene("EndGame");
    }
}
