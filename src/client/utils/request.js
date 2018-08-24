import {task} from 'functional/core/Task';
import {get, post} from 'functional/async/Fetch';
import {storage} from './Storage';

const {assign, keys} = Object;
const memoryCache = storage();

const remoteFetch = ({uri, protocol, host}, force = false) => task({
    credentials: 'include',
    headers:     {
        'X-Local-Request': 'yes',
    },
    protocol,
    host,
    uri
}).through(get)
    .resolve(resp => {
        if (!force) {
            memoryCache.set(uri, resp)
        }
    });

const localFetch = (req) => task().flatMap(async () => await memoryCache.has(req.uri) ? task(() => memoryCache.get(req.uri)) : remoteFetch(req));

const request = req => {
    const {query, search, protocol, host, force} = req;
    const uri = req.uri + (search || '') + (query && keys(query).length > 0 ? `?${keys(query).map(key => key + '=' + query[key]).join(',')}` : '');
    const uriProtocolHost = {uri, protocol, host};
    return (force ? remoteFetch(uriProtocolHost, force) : localFetch(uriProtocolHost))
        .map(data => assign(req, {data}));
};

const update = req => {
    const {protocol, host, uri, body} = req;
    return task({
        credentials: 'include',
        headers:     {
            'X-Local-Request': 'yes',
        },
        protocol,
        host,
        uri,
        body
    })
        .through(post)
        .map(data => assign(req, {data}));
}


export {request, update};