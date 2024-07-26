'use strict';

const path = require('path');
const { readStorage, writeStorage } = require('./readWriter');

function createStorageLayer(storageFolder, storageConfigFile) {
    const storageConfig = path.join(storageFolder, storageConfigFile);
    const { storageFile, adapterFile, primary_key, resource } = require(storageConfig);
    const { adapt } = require(path.join(storageFolder, adapterFile));
    const storageFilePath = path.join(storageFolder, storageFile);

    async function getAllFromStorage() {
        return await readStorage(storageFilePath);
    }

    async function getFromStorage(value, key = primary_key) {
        return (await readStorage(storageFilePath)).filter(item => item[key] == value);
    }

    async function addToStorage(newObject) {
        const storage = await readStorage(storageFilePath);
        storage.push(adapt(newObject));
        return await writeStorage(storageFilePath, storage);
    }

    async function updateStorage(modifiedObject) {
        const storage = await readStorage(storageFilePath);
        const oldObject = storage.find(item => item[primary_key] == modifiedObject[primary_key]);
        if (oldObject) {
            Object.assign(oldObject, adapt(modifiedObject));
            return await writeStorage(storageFilePath, storage);
        }
        return false;
    }

    async function removeFromStorage(value) {
        const storage = await readStorage(storageFilePath);
        const i = storage.findIndex(item => item[primary_key] == value);
        if (i < 0) return false;
        storage.splice(i, 1);
        return await writeStorage(storageFilePath, storage);
    }

    async function getKeys() {
        const storage = await readStorage(storageFilePath);
        const keys = new Set(storage.flatMap(item => Object.keys(item)));
        return [...keys];
    }

    async function getNextFreeKey() {
        const storage = await readStorage(storageFilePath);
        return Math.max(...storage.map(item => item.id), 0) + 1;
    }

    return {
        getAllFromStorage,
        getFromStorage,
        addToStorage,
        updateStorage,
        removeFromStorage,
        getKeys,
        getNextFreeKey,
        primary_key,
        resource
    };
}

module.exports = { createStorageLayer };
