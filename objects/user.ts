export class User {
    _id: string; // https://stackoverflow.com/questions/3298963/how-to-set-a-primary-key-in-mongodb
    _username: string;
    // Just the id for now

    constructor(_uid: string, _uusername: string) {
        this._id = _uid;
        this._username = _uusername;
    }

    print() {
        return this._id + ", " + this._username;
    }
}