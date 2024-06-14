import { _decorator, Button, Component, director, Label, Node } from 'cc';
import { TimerFiller } from "db://assets/Scripts/UI/Timer/TimerFiller";
import { ScoreController } from "db://assets/Scripts/Game/GameController/ScoreController/ScoreController";
import { ScoreUIController } from '../../../UI/Score/ScoreUIController';

const { ccclass, property } = _decorator;

interface SchoolQuestion {
    num1: number;
    num2: number;
    correctAnswer: number;
    options: number[];
    operation: string;
}

@ccclass('GameController')
export class SchoolGameController extends Component {

    private timerFiller: TimerFiller | null = null;
    private currentQuestion: SchoolQuestion | null = null;
    private questionCount: number = 0;

    @property(Node)
    firstNum: Node | null = null;

    @property(Node)
    secondNum: Node | null = null;

    @property(Node)
    listAnswer: Node[] = [];

    @property(Node)
    timerNode: Node | null = null;

    @property(Node)
    operation: Node | null = null;

    @property(Node)
    questionCountLabel: Node | null = null;

    @property(ScoreUIController)
    scoreUIController: ScoreUIController | null = null;

    @property
    maxQuestions: number = 20;

    @property
    upgradeQuestion: number = 15;

    start() {
        if (this.timerNode) {
            this.timerFiller = this.timerNode.getComponent(TimerFiller);
            if (this.timerFiller) {
                this.timerFiller.setOnTimeUpCallback(this.endGame.bind(this));
                this.timerFiller.start();
            }
        }
        this.startGame();
    }

    private startGame() {
        console.log("Game started!");
        this.questionCount = 0;
        if (ScoreController.getInstance()) {
            ScoreController.getInstance().resetScore();
            this.scoreUIController.updateCurrentScoreLabel();
        }
        this.generateQuestion();
    }

    private generateQuestion() {
        if (this.questionCount >= this.maxQuestions) {
            this.endGame();
            return;
        }

        this.questionCount++;
        this.questionCountLabel.getComponentInChildren(Label).string = "Question Number: " + this.questionCount + " / " + this.maxQuestions;
        const maxNumber = this.questionCount >= this.upgradeQuestion ? 99 : 9;
        let num1, num2, correctAnswer;
        let operation = this.operation.getComponentInChildren(Label).string;

        if (this.questionCount >= this.upgradeQuestion) {
            num1 = Math.floor(Math.random() * 100);
            num2 = Math.floor(Math.random() * (100 - num1));
        } else {
            num1 = Math.floor(Math.random() * (maxNumber + 1));
            num2 = Math.floor(Math.random() * (maxNumber + 1));
        }

        switch (operation) {
            case '+':
                correctAnswer = num1 + num2;
                break;
            case '-':
                if (num1 < num2) { [num1, num2] = [num2, num1] }
                correctAnswer = num1 - num2;
                break;
            case 'x':
                num1 = Math.floor(Math.random() * 10); 
                num2 = Math.floor(Math.random() * 10);
                correctAnswer = num1 * num2;
                break;
            case '÷':
                num2 = Math.floor(Math.random() * 9) + 1;
                correctAnswer = Math.floor(Math.random() * 10);
                num1 = correctAnswer * num2;
                break;
        }
        const options = this.generateOptions(correctAnswer);
        this.currentQuestion = { num1, num2, correctAnswer, options, operation };
        this.displayQuestion(num1, num2);
    }

    private generateOptions(correctAnswer: number) {
        const options = new Set<number>();
        options.add(correctAnswer);

        while (options.size < 4) {
            let option: number;
            do {
                option = correctAnswer + Math.floor(Math.random() * 21) - 10;
            } while (option < 0 || option > 99);

            options.add(option);
        }

        return Array.from(options).sort(() => Math.random() - 0.5);
    }

    private displayQuestion(firstNum: number, secondNum: number) {
        if (!this.currentQuestion) return;

        this.firstNum.getComponentInChildren(Label).string = firstNum.toString();
        this.secondNum.getComponentInChildren(Label).string = secondNum.toString();

        if (Array.isArray(this.listAnswer)) {
            this.listAnswer.forEach((value, index) => {
                if (index < this.listAnswer.length) {
                    const answerBtn = this.listAnswer[index].getComponent(Button);
                }
            });
        }

        if (this.currentQuestion && Array.isArray(this.currentQuestion.options)) {
            this.currentQuestion.options.forEach((option, index) => {
                if (index < this.listAnswer.length) {
                    const labelNode = this.listAnswer[index].getComponentInChildren(Label);
                    if (labelNode) {
                        labelNode.string = option.toString();
                    } else {
                        console.error(`Node at index ${index} does not have a Label component`);
                    }
    
                    const button = this.listAnswer[index].getComponent(Button);
                    if (button) {
                        button.node.off('click', this.onAnswerClick, this);
                        button.node.on('click', this.onAnswerClick, this);
                    }
                }
            });
        }


    }

    private onAnswerClick(buttonNode: Node) {
        const label = buttonNode.getComponentInChildren(Label);

        if (label) {
            const answer = parseInt(label.string);
            this.submitAnswer(answer);
        }
    }

    public submitAnswer(answer: number) {
        if (!this.currentQuestion) return;

        if (answer === this.currentQuestion.correctAnswer) {
            console.log('Correct answer!');
            if (ScoreController.getInstance()) {
                ScoreController.getInstance().addPoints(10); 
                this.scoreUIController.updateCurrentScoreLabel();
            }
            this.generateQuestion();
        } else {
            console.log('Incorrect answer!');
            this.generateQuestion();
        }
    }

    private endGame() {
        if (this.timerFiller) {
            this.timerFiller.stop();
            ScoreController.getInstance().calculateFinalScore();
            director.loadScene("EndGame");
        }
    }
}
