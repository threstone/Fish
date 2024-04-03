class FishBehavior {

    private _fish: BaseUI.UIFish;
    private _maxHeight: number;

    private _isFirstMove: boolean;
    private _moveFrame: number;
    private _pxOfFrame: number;

    private _distanceList: number[];
    private _timeList: number[];
    private _barHeight: number;
    constructor(barHeight: number, fish: BaseUI.UIFish) {
        this._barHeight = barHeight;
        this._fish = fish;
    }

    start(distanceList: number[], timeList: number[]) {
        this._maxHeight = this._barHeight - this._fish.height;
        this._fish.y = this._maxHeight;
        this._distanceList = distanceList;
        this._timeList = timeList;
        this._isFirstMove = true;
    }

    update() {
        if (this._moveFrame > 0) {
            this._fish.y += this._pxOfFrame;
            if (this._fish.y > this._maxHeight) {
                this._fish.y = this._maxHeight;
            }
            if (this._fish.y <= 0) {
                this._fish.y = 0;
            }
            this._moveFrame--;
        } else {
            this.confirmTarget();
        }
    }

    end() {

    }

    /** 确定目标 */
    private confirmTarget() {
        let isUp = Math.random() < 0.5;
        if (this._isFirstMove) {
            this._isFirstMove = false;
            isUp = true;
        }

        const distance = (isUp ? -1 : 1) * this._distanceList[Math.floor(Math.random() * this._distanceList.length)] * this._maxHeight;
        this._moveFrame = Math.ceil(this._timeList[Math.floor(Math.random() * this._timeList.length)] * egret.ticker.$frameRate);
        this._pxOfFrame = distance / this._moveFrame;
    }
}