import config from '../../../config/db'
import clientDB from '../../lib/db/indexedDB';

import userObject from '../db/localSession';


const isNode = () => ((typeof process !== 'undefined') && (process.release.name === 'node'));

const getSession = () => {

    const {indexedDB} = self;
    const {database, databaseVersion} = config;
    const db = clientDB(database, databaseVersion, indexedDB);
    return userObject(db);
};

export default !isNode() ? getSession() : {};


