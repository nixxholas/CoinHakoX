"use strict";
exports.__esModule = true;
var User = /** @class */ (function () {
    // Just the id for now
    function User(_id) {
        this.id = _id;
    }
    User.prototype.print = function () {
        return this.id;
    };
    return User;
}());
exports.User = User;
