const G = 9.8;
const UpSpeed = -20;
/** 撞击系数 */
const ImpactCoefficient = 0.4;
/** 速度上限 */
const SpeedLimit = 100;
/** 成功吊起鱼所需的时间(秒) */
const FishSuccessTime = 6;
/** 初始进度条百分比(秒) */
const StartProgress = 20;
/** 鱼缓冲像素值 */
const BufferPx = 10;
class FishDisplayBar {

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
    public isPerfect: boolean;
    /** 是否点击 */
    private _isUp: boolean;
    /** 钓鱼开始时间 */
    public startTime: number;

    /** 鱼行为控制器 */
    private _fishBehavior: FishBehavior;
    private _curFishConfig: Fish;

    private _displayBar: BaseUI.UIDisplayBar;
    constructor(displayBar: BaseUI.UIDisplayBar) {
        this._displayBar = displayBar;

        // 数据初始化
        this._curSpeed = 0;
        this._downOfFrame = G / egret.ticker.$frameRate;
        this._upOfFrame = UpSpeed / egret.ticker.$frameRate;
        this._progressChange = 100 / (egret.ticker.$frameRate * FishSuccessTime);
        this._fishBehavior = new FishBehavior(displayBar.height, displayBar.fish);
    }

    startUp() {
        this._isUp = true;
    }

    endUp() {
        this._isUp = false;
    }

    start(fishConfig: Fish) {
        this._curFishConfig = fishConfig;

        // 记录开始时间
        this.startTime = Date.now();
        this.isPerfect = true;
        this._curSpeed = 0;

        const greenHeight = FishModel.ins().getGreenHeight();
        // 最大Y轴值
        this._maxYLimit = this._displayBar.height - greenHeight;

        // 设置绿块高度
        this._displayBar.green.height = greenHeight;
        this._displayBar.progressBar.visible = true;
        this._displayBar.fish.visible = true;
        this._displayBar.progressBar.value = StartProgress + FishModel.ins().getFishLineProgressAdd();
        this._displayBar.green.visible = true;
        this._displayBar.green.y = this._maxYLimit;

        this._fishBehavior.start(this._curFishConfig.distanceList, this._curFishConfig.timeList);
    }

    /** 返回是否继续 */
    update() {
        this._displayBar.f.skewX += 10;
        this._displayBar.f.skewY += 10;
        this.greenUpdate();
        this.fishUpdate();
        return this.checkFish();
    }

    end() {
        this._displayBar.f.skewX += 0;
        this._displayBar.f.skewY += 0;

        this._isUp = false;
        this._displayBar.progressBar.visible = false;
        this._displayBar.green.y = this._maxYLimit;
        this._displayBar.green.visible = false;
        this._displayBar.fish.visible = false;
        this._fishBehavior.end();
    }

    /** 返回是否继续 */
    private checkFish() {
        const green = this._displayBar.green;
        const fish = this._displayBar.fish;
        if ((fish.y + BufferPx) >= green.y && (fish.y + fish.height - BufferPx) <= (green.y + green.height)) {
            green.alpha = 1;
            this._displayBar.progressBar.value += this._progressChange;
        } else {
            green.alpha = 0.5;
            this.isPerfect = false;
            this._displayBar.progressBar.value -= this._progressChange;
        }

        const barImg = this._displayBar.progressBar.getChild('bar').asGraph;
        if (this._displayBar.progressBar.value < 20) {
            barImg.color = 0xFF0000;
        } else {
            barImg.color = 0x00FF00;
        }
        if (this._displayBar.progressBar.value >= 100 || this._displayBar.progressBar.value <= 0) {
            this.end();
            return false;
        }
        return true;
    }

    private fishUpdate() {
        this._fishBehavior.update();
    }

    private greenUpdate() {
        if (this._isUp) {
            this._curSpeed += this._upOfFrame;
        }

        if (this._curSpeed > SpeedLimit) {
            this._curSpeed = SpeedLimit;
        }
        if (this._curSpeed < -SpeedLimit) {
            this._curSpeed = -SpeedLimit;
        }
        this._curSpeed += this._downOfFrame;
        this._displayBar.green.y += this._curSpeed;
        // 撞击
        if (this._displayBar.green.y > this._maxYLimit) {
            this._displayBar.green.y = this._maxYLimit;
            // 撞击系数
            this._curSpeed = this._curSpeed * -ImpactCoefficient;
        } else if (this._displayBar.green.y < 0) {
            this._displayBar.green.y = 0;
            if (this._curSpeed < UpSpeed) {
                this._curSpeed = UpSpeed;
            }
            this._curSpeed = this._curSpeed * ImpactCoefficient;
        }
        this._displayBar.green.y = Math.max(0, this._displayBar.green.y);
    }
}