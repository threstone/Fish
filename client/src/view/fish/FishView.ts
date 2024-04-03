const G = 9.8;
const UpSpeed = -30;
/** 撞击系数 */
const ImpactCoefficient = 0.4;
/** 速度上限 */
const SpeedLimit = 100;
/** 成功吊起鱼所需的时间(秒) */
const FishSuccessTime = 6;
/** 初始进度条百分比(秒) */
const StartProgress = 20;
class FishView extends BaseView<BaseUI.UIFishCom> {

    /** 当前速度 */
    private _curSpeed: number;
    /** 最大Y轴位置 */
    private _maxYLimit: number;
    /** 每帧下落速度变化 */
    private _downOfFrame: number;
    /** 每帧上升速度变化 */
    private _upOfFrame: number;
    /** 每帧完成度 */
    private _progressChange: number;
    /** 是否完美钓鱼 */
    private _isPerfect: boolean;
    /** 是否点击 */
    private _touchStart: boolean;
    /** 钓鱼开始时间 */
    private _startTime: number;

    /** 鱼行为控制器 */
    private _fishBehavior: FishBehavior;
    private _curFishConfig: Fish;

    protected init() {
        this.view = BaseUI.UIFishCom.createInstance();
        this.initDisplayBar();
        // 数据初始化
        this._curSpeed = 0;
        this._downOfFrame = G / egret.ticker.$frameRate;
        this._upOfFrame = UpSpeed / egret.ticker.$frameRate;
        this._progressChange = 100 / (egret.ticker.$frameRate * FishSuccessTime);
        this._fishBehavior = new FishBehavior(this.view.displayBar.height, this.view.displayBar.fish);
    }

    private initDisplayBar() {
        // 组件初始化
        const bar = this.view.displayBar;
        const lineSize: number = (bar.greenBg as any)._lineSize;
        bar.height = 480;
        bar.greenBg.width = bar.width + lineSize * 2
        bar.greenBg.height = bar.height + lineSize * 2
        bar.greenBg.x = -lineSize;
        bar.greenBg.y = -lineSize;
    }

    public open(): void {
        super.open();
        this.AddClick(this.view.startBtn, this.startFish);
    }

    private startFish(evt: egret.TouchEvent) {
        this.view.startBtn.visible = false;
        this.view.timeDesc.visible = true;
        this._curFishConfig = FishModel.ins().getFishConfig();

        // 设置绿块高度
        this.view.displayBar.green.height = FishModel.ins().getGreenHeight();
        // 最大Y轴值
        this._maxYLimit = this.view.displayBar.height - this.view.displayBar.green.height;
        // 记录开始时间
        this._startTime = Date.now();
        this._isPerfect = true;
        this._curSpeed = 0;
        this.view.displayBar.progressBar.visible = true;
        this.view.displayBar.progressBar.value = StartProgress;
        this.view.displayBar.green.visible = true;
        this.view.displayBar.green.y = this._maxYLimit;
        this.view.displayBar.fish.visible = true;
        this.observe('GameBeat', this.onUpdate);
        this.view.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);
        this.view.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEnd, this);
        this._fishBehavior.start(this._curFishConfig.distanceList, this._curFishConfig.timeList);
        // 防止冒泡到onClick
        evt.stopPropagation();
    }

    private endFish() {
        this.view.startBtn.visible = true;
        this.view.timeDesc.visible = false;

        this._touchStart = false;
        this.view.displayBar.progressBar.visible = false;
        this.view.displayBar.green.y = this._maxYLimit;
        this.view.displayBar.green.visible = false;
        this.view.displayBar.fish.visible = false;
        this.view.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);
        this.view.removeEventListener(egret.TouchEvent.TOUCH_END, this.touchEnd, this);

        this.removeObserve('GameBeat', this.onUpdate);

        const isWin = this.view.displayBar.progressBar.value >= 0;
        TipsView.ins().open(`${isWin === true ?
            `${this._isPerfect ? '太棒了！完美钓鱼！' : `钓鱼成功(${this.getUseTime()}秒)~`}`
            : '再接再厉'}`);
        this._fishBehavior.end();
    }

    private getUseTime() {
        const useTime = Date.now() - this._startTime;
        return Math.floor(useTime / 100) / 10;
    }

    private touchBegin() {
        this._touchStart = true;
    }

    private touchEnd() {
        this._touchStart = false;
    }

    private onUpdate() {
        this.view.timeDesc.text = `用时:${this.getUseTime()}秒`;
        this.checkFish();
        this.greenUpdate();
        this.fishUpdate();
    }

    private checkFish() {
        const green = this.view.displayBar.green;
        const fish = this.view.displayBar.fish;
        if (fish.y >= green.y && fish.y + fish.height <= green.y + green.height) {
            green.alpha = 1;
            this.view.displayBar.progressBar.value += this._progressChange;
        } else {
            green.alpha = 0.5;
            this._isPerfect = false;
            this.view.displayBar.progressBar.value -= this._progressChange;
        }

        const barImg = this.view.displayBar.progressBar.getChild('bar').asGraph;
        if (this.view.displayBar.progressBar.value < 20) {
            barImg.color = 0xFF0000;
        } else {
            barImg.color = 0x00FF00;
        }
        if (this.view.displayBar.progressBar.value >= 100 || this.view.displayBar.progressBar.value <= 0) {
            this.endFish();
        }
    }

    private fishUpdate() {
        this._fishBehavior.update();
    }

    private greenUpdate() {
        console.log(this._curSpeed);

        if (this._touchStart) {
            this._curSpeed += this._upOfFrame;
        }

        if (this._curSpeed > SpeedLimit) {
            this._curSpeed = SpeedLimit;
        }
        if (this._curSpeed < -SpeedLimit) {
            this._curSpeed = -SpeedLimit;
        }
        this._curSpeed += this._downOfFrame;
        this.view.displayBar.green.y += this._curSpeed;
        // 撞击
        if (this.view.displayBar.green.y > this._maxYLimit) {
            this.view.displayBar.green.y = this._maxYLimit;
            // 撞击系数
            this._curSpeed = this._curSpeed * -ImpactCoefficient;
        } else if (this.view.displayBar.green.y < 0) {
            this.view.displayBar.green.y = 0;
            if (this._curSpeed < UpSpeed) {
                this._curSpeed = UpSpeed;
            }
            this._curSpeed = this._curSpeed * ImpactCoefficient;
        }
        this.view.displayBar.green.y = Math.max(0, this.view.displayBar.green.y);
    }
}