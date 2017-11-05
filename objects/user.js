"use strict";
exports.__esModule = true;
var User = /** @class */ (function () {
    // Just the id for now
    function User(_uid, _uusername) {
        this._id = _uid;
        this._username = _uusername;
    }
    User.prototype.print = function () {
        return this._id + ", " + this._username;
    };
    return User;
}());
exports.User = User;
