class FishModel extends BaseModel {
    private _data: any;
    constructor() {
        super();
        this._data = JSON.parse(localStorage.getItem('userInfo') || '{"exp":0}');
    }

    getFishConfig() {
        const fishList: Fish[] = RES.getRes('config_json').fish;
        return fishList[Math.floor(Math.random() * fishList.length)];
    }

    getGreenHeight(): number {
        return this.getLevelConfig().height;
    }

    update() {
        localStorage.setItem('userInfo', JSON.stringify(this._data));
    }

    getLevelConfig() {
        const exp: number = this._data.exp;
        const fishLevelList = RES.getRes('config_json').fishLevel;
        for (let index = fishLevelList.length - 1; index >= 0; index--) {
            const conf = fishLevelList[index];
            if (exp >= conf.exp) {
                return conf;
            }
        }
    }

    addExp(exp: number) {
        this._data.exp += exp;
        this.update();
    }



}


