import { _decorator, Button, Component, director, Enum } from 'cc';
const { ccclass, property } = _decorator;

enum SceneName {
    School = "School",
    Zoo = "Zoo",
    Market = "Market"
}

const switchScene = (sceneName: string) => {
    director.loadScene(sceneName);
};

@ccclass('GameSelectionButton')
export class GameSelectionButton extends Component {

    @property(Button)
    selectionBtn: Button = null;

    @property
    private sceneName: string = ""; 

    protected onLoad(): void {
        this.selectionBtn.node.on('click', this.onButtonClick, this);
    }

    private onButtonClick() {
        if(this.sceneName !=="")
            {
                switchScene(this.sceneName); 
            }
    }
}