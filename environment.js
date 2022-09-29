export class Environment {
    store;
    outer;
    constructor(store, outer = null){
        this.store = store;
        this.outer = outer;
    }
    newEnclosedEnvironment(outer) {
        const store = new Map();
        const env = new Environment(store);
        env.outer = outer;
        return env;
    }
    get(name) {
        const obj = this.store.get(name);
        if (!obj && this.outer != null) {
            return this.outer.get(name);
        }
        return obj;
    }
    set(name, val) {
        this.store.set(name, val);
        return val;
    }
}
