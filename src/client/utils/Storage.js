import config from '../../../config/client'
const {cacheVersion} = config;

const currentCache = `md-cache-v${cacheVersion}`;
const isNode = () => ((typeof process !== 'undefined') && (process.release.name === 'node'));

const _map = Symbol('map');

class MemoryStorage {
    constructor() {
        this[_map] = new Map();
    }

    async get(key) {
        return this[_map].get(key);
    }

    async set(key, value) {
        return this[_map].set(key, value);
    }

    async has(key) {
        return this[_map].has(key);
    }
}

const _cache = Symbol('cache');
class CacheStorage extends MemoryStorage {
    constructor() {
        super();
        const {caches} = self;
        this[_cache] = caches.open(currentCache);
    }

    async get(key) {
        return this[_map].has(key) ? this[_map].get(key) : this.getCache(key);
    }

    async getCache(key) {
        return this[_cache].then(_ => _.match(key)).then(_ => _.json());
    }

    async has(key) {
        return this[_map].has(key) || this[_cache].then(_ => _.match(key)).then(_ => !!_);
    }
}


const storage = (...args) => isNode() ? new MemoryStorage(...args) : new CacheStorage(...args);


export {storage};