"use strict";
exports.__esModule = true;
var Price = /** @class */ (function () {
    function Price(_buyPrice, _sellPrice) {
        this.buyPrice = _buyPrice;
        this.sellPrice = _sellPrice;
    }
    Price.prototype.loadFromJSON = function (jsonObj) {
        this.buyPrice = jsonObj["buy_price"];
        this.sellPrice = jsonObj["sell_price"];
    };
    Price.prototype.print = function () {
        return "LOl";
    };
    return Price;
}());
exports.Price = Price;
