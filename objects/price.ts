export class Price {
    buyPrice: number;
    sellPrice: number;
    
    constructor(_buyPrice: number, _sellPrice: number) {
        this.buyPrice = _buyPrice;
        this.sellPrice = _sellPrice;
    }

    loadFromJSON(jsonObj: any) {
        this.buyPrice = jsonObj["buy_price"];
        this.sellPrice = jsonObj["sell_price"];
    }

    print() {
        return "LOl";
    }
}