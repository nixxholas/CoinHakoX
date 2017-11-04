export class User {
    id: string;
    // Just the id for now

    constructor(_id: string) {
        this.id = _id;
    }

    print() {
        return this.id;
    }
}