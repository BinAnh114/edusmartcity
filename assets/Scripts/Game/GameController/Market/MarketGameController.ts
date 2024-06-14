import { _decorator, Component, Sprite, SpriteFrame, Node, resources, Label, Button, director, UITransform } from 'cc';
import { ScoreUIController } from '../../../UI/Score/ScoreUIController';
import { TimerFiller } from '../../../UI/Timer/TimerFiller';
import { ScoreController } from '../ScoreController/ScoreController';
const { ccclass, property } = _decorator;

interface MarketMission {
    requiredItems: string[];
    selectedItems: Set<string>;
}

@ccclass('MarketGameController')
export class MarketGameController extends Component {

    private timerFiller: TimerFiller | null = null;

    private currentMission: MarketMission | null = null;

    @property(Node)
    listItems: Node[] = [];

    @property(Node)
    listItemsBG: Node[] = [];

    @property(Node)
    missionLabel: Node | null = null;

    @property(Node)
    timerNode: Node | null = null;

    @property(Node)
    submitBtn: Node | null = null;

    @property(ScoreUIController)
    scoreUIController: ScoreUIController | null = null;

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

    startGame() {
        console.log("Game started!");
        if (ScoreController.getInstance()) {
            ScoreController.getInstance().resetScore();
            this.scoreUIController.updateCurrentScoreLabel();
        }

        this.submitBtn.getComponent(Button).node.on('click', this.submitMission, this);
        this.generateMission();
    }

    private generateMission() {
        this.loadMissionItems();
    }

    private loadMissionItems() {
        resources.loadDir('GameRes/MarketSrc', SpriteFrame, (err, spriteFrames) => {
            if (err) {
                console.error(err);
                return;
            }

            const requiredItems = this.getUniqueRandomItems(spriteFrames, 4).map(item => item.name);
            const uniqueAnswerItems = new Set<string>(requiredItems);

            while (uniqueAnswerItems.size < 8) {
                const randomItem = spriteFrames[Math.floor(Math.random() * spriteFrames.length)].name;
                if (!uniqueAnswerItems.has(randomItem)) {
                    uniqueAnswerItems.add(randomItem);
                }
            }

            const answerItems = Array.from(uniqueAnswerItems);
            this.currentMission = { requiredItems, selectedItems: new Set() };
            console.log(requiredItems.toString());
            console.log(answerItems.toString());
            this.displayMission(answerItems);
        });
    }

    private displayMission(answerItems: string[]) {
        if (this.currentMission) {
            const missionLabelComponent = this.missionLabel.getComponentInChildren(Label);
            if (missionLabelComponent) {
                missionLabelComponent.string = 'Please get me: ' + this.currentMission.requiredItems.join(', ');
            }

            const allItems = [...this.currentMission.requiredItems, ...answerItems];
            const uniqueItems = [...new Set(allItems)];

            for (let i = uniqueItems.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [uniqueItems[i], uniqueItems[j]] = [uniqueItems[j], uniqueItems[i]];
            }

            this.listItems.forEach((buttonNode, index) => {
                if (index < uniqueItems.length) {
                    const itemName = uniqueItems[index];
                    buttonNode.name = itemName;
                    this.loadItemPicture(itemName, buttonNode, this.listItemsBG[index]);
                }
            });
        }
    }

    private loadItemPicture(itemName: string, buttonNode: Node, bgNode: Node) {
        const imagePath = `GameRes/MarketSrc/${itemName}/spriteFrame`;

        resources.load(imagePath, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                console.error(`Failed to load image: ${imagePath}`, err);
                return;
            }
            this.assignSpriteToNode(spriteFrame, buttonNode, bgNode);
        });
    }

    private assignSpriteToNode(spriteFrame: SpriteFrame, buttonNode: Node, bgNode: Node) {
        const sprite = buttonNode.getComponentInChildren(Sprite);
        if (sprite) {
            sprite.spriteFrame = spriteFrame;
            const transform = buttonNode.getComponentInChildren(UITransform);
            transform.setContentSize(100, 100);
        }

        buttonNode.off('click');  
        buttonNode.on('click', this.onItemClick.bind(this, buttonNode, bgNode), this);
    }

    private getUniqueRandomItems(spriteFrames: SpriteFrame[], count: number): SpriteFrame[] {
        const selectedItems = new Set<string>();
        const uniqueItems = [];

        while (uniqueItems.length < count) {
            const randomIndex = Math.floor(Math.random() * spriteFrames.length);
            const item = spriteFrames[randomIndex];
            if (!selectedItems.has(item.name)) {
                selectedItems.add(item.name);
                uniqueItems.push(item);
            }
        }

        return uniqueItems;
    }

    private onItemClick(buttonNode: Node, bgNode: Node) {
        const itemName = buttonNode.name;
        if (this.currentMission) {
            if (this.currentMission.selectedItems.has(itemName)) {
                this.currentMission.selectedItems.delete(itemName);
                this.updateButtonSprite(bgNode, 'GameRes/BackGround/Default/White_Default/spriteFrame');
            } else {
                if (this.currentMission.selectedItems.size < 4) {
                    this.currentMission.selectedItems.add(itemName);
                    this.updateButtonSprite(bgNode, 'GameRes/BackGround/Highlight/HighlightYellow/spriteFrame');
                } else {
                    console.log('Maximum of 4 items can be selected');
                }
            }
        }
    }

    private updateButtonSprite(bgNode: Node, imagePath: string) {
        resources.load(imagePath, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                console.error(`Failed to load image: ${imagePath}`, err);
                return;
            }
            const sprite = bgNode.getComponent(Sprite);
            if (sprite) {
                sprite.spriteFrame = spriteFrame;
            }
        });
    }

    private resetHighlightedButtons() {
        this.listItemsBG.forEach((bgNode, index) => {
            this.updateButtonSprite(bgNode, 'GameRes/BackGround/Default/White_Default/spriteFrame');
        });

        this.listItems.forEach((buttonNode, index) => {
            buttonNode.off('click');  // Remove any existing click listeners
            buttonNode.on('click', this.onItemClick.bind(this, buttonNode, this.listItemsBG[index]), this);
        });
    }

    private submitMission() {
        if (!this.currentMission) return;

        const selectedItemsArray = Array.from(this.currentMission.selectedItems);
        if (this.arraysEqual(selectedItemsArray, this.currentMission.requiredItems) && selectedItemsArray.length == 4) {
            console.log('Mission Completed!');
            if (ScoreController.getInstance()) {
                ScoreController.getInstance().addPoints(10);
                this.scoreUIController.updateCurrentScoreLabel();
            }
            this.resetHighlightedButtons();
            this.generateMission();
        } else {
            console.log('Mission Failed!');
            this.currentMission.selectedItems.clear();
            this.resetHighlightedButtons();
        }
    }

    private arraysEqual(arr1: string[], arr2: string[]): boolean {
        if (arr1.length !== arr2.length) return false;
        const sortedArr1 = arr1.slice().sort();
        const sortedArr2 = arr2.slice().sort();
        for (let i = 0; i < sortedArr1.length; i++) {
            if (sortedArr1[i] !== sortedArr2[i]) return false;
        }
        return true;
    }

    private endGame() {
        if (this.timerFiller) {
            this.timerFiller.stop();
            ScoreController.getInstance().calculateFinalScore();
            director.loadScene("EndGame");
        }
    }
}
