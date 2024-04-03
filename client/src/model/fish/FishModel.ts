class FishModel extends BaseModel {
    getFishConfig() {
        const fishList: Fish[] = RES.getRes('config_json').fish;
        return fishList[Math.floor(Math.random() * fishList.length)];
    }

    getGreenHeight(): number {
        return 160;
        const fishLevelList = RES.getRes('config_json').fishLevel;
        return fishLevelList[Math.floor(Math.random() * fishLevelList.length)].height;
    }
}

