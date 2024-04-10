class ConfigModel extends BaseModel {
    allConfig: {
        fish:Fish[],
        fishLevel:FishLevel[]
    }
    
    constructor() {
        super();
        this.allConfig = RES.getRes('config_json');
    }
}