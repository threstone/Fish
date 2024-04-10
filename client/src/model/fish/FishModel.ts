class FishModel extends BaseModel {
    private _data: any;
    constructor() {
        super();
        this._data = JSON.parse(localStorage.getItem('userInfo') || '{"exp":0}');
    }

    /** 获取钓到的鱼的配置 */
    getFishConfig() {
        const fishList = ConfigModel.ins().allConfig.fish;
        return fishList[Math.floor(Math.random() * fishList.length)];
    }

    /** 获取绿块高度 */
    getGreenHeight(): number {
        return this.getLevelConfig().height;
    }

    /** 同步玩家信息 */
    syncUserInfo() {
        localStorage.setItem('userInfo', JSON.stringify(this._data));
    }

    /** 获取当前钓鱼等级配置 */
    getLevelConfig() {
        const exp: number = this._data.exp;
        const fishLevelList = ConfigModel.ins().allConfig.fishLevel;
        for (let index = fishLevelList.length - 1; index >= 0; index--) {
            const conf = fishLevelList[index];
            if (exp >= conf.exp) {
                return conf;
            }
        }
    }

    endFish(fishConfig: Fish, isWin: boolean, isPerfect: boolean) {
        if (isWin) {
            FishModel.ins().addExp(fishConfig.exp * (isPerfect ? 2.4 : 1));
        }
    }

    /** 增加钓鱼经验 */
    addExp(exp: number) {
        this._data.exp += exp;
        this.syncUserInfo();
    }

    /** 鱼线完成度 */
    getFishLineProgressAdd() {
        return 0;
    }
}


