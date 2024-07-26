'use strict';

const { CODES, TYPES, MESSAGES } = require('./statusCodes');
const { createStorageLayer } = require('./storageLayer');

function createDataStorage(storagePath, storageConfig) {
    const {
        getAllFromStorage,
        getFromStorage,
        addToStorage,
        updateStorage,
        removeFromStorage,
        getKeys,
        getNextFreeKey,
        primary_key,
        resource
    } = createStorageLayer(storagePath, storageConfig);

    class DataStorage {
        get CODES() {
            return CODES;
        }

        get TYPES() {
            return TYPES;
        }

        get PRIMARY_KEY() {
            return primary_key;
        }

        get KEYS() {
            return getKeys();
        }

        get NEXT_FREE_KEY() {
            return getNextFreeKey();
        }

        get MESSAGES() {
            return MESSAGES;
        }

        get RESOURCE() {
            return resource;
        }

        async getAll() {
            return await getAllFromStorage();
        }

        async get(value, key = primary_key) {
            return await getFromStorage(value, key);
        }

        async insert(item) {
            if (item && item[primary_key] && !(await getFromStorage(item[primary_key])).length) {
                const success = await addToStorage(item);
                return success ? MESSAGES.INSERT_OK(primary_key, item[primary_key]) : MESSAGES.NOT_INSERTED();
            }
            return MESSAGES.NOT_INSERTED();
        }

        async update(item) {
            if (item) {
                const success = await updateStorage(item);
                return success ? MESSAGES.UPDATE_OK(primary_key, item[primary_key]) : MESSAGES.NOT_UPDATED();
            }
            return MESSAGES.NOT_UPDATED();
        }

        async remove(value) {
            if (value) {
                const success = await removeFromStorage(value);
                return success ? MESSAGES.REMOVE_OK(primary_key, value) : MESSAGES.NOT_REMOVED();
            }
            return MESSAGES.NOT_FOUND(primary_key, '--empty--');
        }
    }

    return new DataStorage();
}

module.exports = { createDataStorage };
