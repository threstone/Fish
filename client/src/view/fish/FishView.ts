
class FishView extends BaseView<BaseUI.UIFishCom> {
    private _fishDisplayerBar: FishDisplayBar;
    private _curFishConfig: Fish;

    protected init() {
        this.view = BaseUI.UIFishCom.createInstance();
        this._fishDisplayerBar = new FishDisplayBar(this.view.displayBar);
    }


    public open(): void {
        super.open();
        this.AddClick(this.view.startBtn, this.startFish);
    }

    private startFish(evt: egret.TouchEvent) {
        this._curFishConfig = FishModel.ins().getFishConfig();
        this._fishDisplayerBar.start(this._curFishConfig);

        this.view.startBtn.visible = false;
        this.view.timeDesc.visible = true;
        this.view.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this._fishDisplayerBar.startUp, this._fishDisplayerBar);
        this.view.addEventListener(egret.TouchEvent.TOUCH_END, this._fishDisplayerBar.endUp, this._fishDisplayerBar);
        this.observe('GameBeat', this.onUpdate);
        // 防止冒泡到TOUCH_BEGIN TOUCH_END
        evt.stopPropagation();
    }

    private endFish() {
        this.view.startBtn.visible = true;
        this.view.timeDesc.visible = false;
        this.view.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this._fishDisplayerBar.startUp, this._fishDisplayerBar);
        this.view.removeEventListener(egret.TouchEvent.TOUCH_END, this._fishDisplayerBar.endUp, this._fishDisplayerBar);
        this.removeObserve('GameBeat', this.onUpdate);

        const isWin = this.view.displayBar.progressBar.value >= 0;
        FishModel.ins().endFish(this._curFishConfig, isWin, this._fishDisplayerBar.isPerfect);
        TipsView.ins().open(`${isWin === true ?
            `${this._fishDisplayerBar.isPerfect ? `太棒了！完美钓上了${this._curFishConfig.name}钓鱼！` : `成功钓到了${this._curFishConfig.name}(${this.getUseTime()}秒)~`}`
            : '再接再厉'}`);
    }

    private getUseTime() {
        const useTime = Date.now() - this._fishDisplayerBar.startTime;
        return Math.floor(useTime / 100) / 10;
    }

    private onUpdate() {
        this.view.timeDesc.text = `用时:${this.getUseTime()}秒`;
        const isContinue = this._fishDisplayerBar.update();
        if (isContinue === false) {
            this.endFish();
        }
    }
}