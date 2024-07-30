'use strict';

const http = require('http');
const path = require('path');
const fs = require('fs').promises;

const {
    port,
    host,
    storageEngine,
    storage,
    library
} = require('./config.json');

const {
    read,
    send,
    sendJson,
    sendError,
    isIn,
    getRequestPostBodyData
} = require(path.join(__dirname, library.folder, library.requestHandler));

const storageEnginePath = path.join(__dirname, storageEngine.folder);
const dataStoragePath = path.join(storageEnginePath, storageEngine.dataStorageFile);
const storagePath = path.join(__dirname, storage.folder);

let register;
try {
    const { createDataStorage } = require(dataStoragePath);
    register = createDataStorage(storagePath, storage.storageConfigFile);
} catch (err) {
    console.error('Error loading data storage:', err);
    process.exit(1);
}

// Define routes
const resourceRoutes = [
    '/js/',
    '/pages/'
];

const publicPath = path.join(__dirname, 'public');
const pagesPath = path.join(publicPath, 'pages');
const homePath = path.join(pagesPath, 'index.html');
const stylePath = path.join(pagesPath, 'styles.css');

const server = http.createServer(async (req, res) => {
    const { pathname } = new URL(`http://${req.headers.host}${req.url}`);
    const route = decodeURIComponent(pathname);

    const method = req.method.toUpperCase();

    try {
        if (method === 'GET') {
            if (route === '/') {
                const result = await read(homePath);
                if (result.error) {
                    sendError(res, result.error, 'ERROR', 404);
                } else {
                    send(res, result);
                }
            } else if (route === '/styles.css') {
                const result = await read(stylePath);
                if (result.error) {
                    sendError(res, result.error, 'ERROR', 404);
                } else {
                    send(res, result);
                }
            } else if (route.startsWith('/js/')) {
                const jsFilePath = path.join(publicPath, route);
                const result = await read(jsFilePath);
                if (result.error) {
                    sendError(res, result.error, 'ERROR', 404);
                } else {
                    send(res, result);
                }
            } else if (isIn(route, ...resourceRoutes)) {
                const result = await read(path.join(publicPath, route));
                if (result.fileData) {
                    send(res, result);
                } else {
                    sendError(res, 'Resource not found', 'ERROR', 404);
                }
            } else if (route === '/api/flowers/keys') {
                const keys = Object.keys((await register.getAll())[0] || {});
                sendJson(res, keys);
            } else if (route.startsWith('/api/flowers/')) {
                const parts = route.split('/');
                const key = parts[3];
                const value = parts[4];
                if (key && value) {
                    const flowers = await register.getAll();
                    const filteredFlowers = flowers.filter(flower => flower[key] && flower[key].toString().toLowerCase() === value.toLowerCase());
                    sendJson(res, filteredFlowers);
                } else {
                    sendError(res, 'Invalid key or value', 'ERROR', 400);
                }
            } else if (route === '/api/flowers') {
                const flowers = await register.getAll();
                sendJson(res, flowers);
            } else {
                sendError(res, 'Resource not found', 'ERROR', 404);
            }
        } else if (method === 'POST') {
            const body = await getRequestPostBodyData(req);
            if (route === '/api/flowers') {
                register.insert(body)
                    .then(result => sendJson(res, result))
                    .catch(error => sendError(res, error.message, 'ERROR', 400));
            } else {
                sendError(res, 'Resource not found', 'ERROR', 404);
            }
        } else if (method === 'PUT') {
            const body = await getRequestPostBodyData(req);
            register.update(body)
                .then(result => sendJson(res, result))
                .catch(error => sendError(res, error.message, 'ERROR', 400));
        } else if (method === 'DELETE') {
            const flowerId = route.split('/').pop();
            register.remove(flowerId)
                .then(result => sendJson(res, result))
                .catch(error => sendError(res, error.message, 'ERROR', 400));
        } else {
            sendError(res, 'Method not allowed', 'ERROR', 405);
        }
    } catch (err) {
        console.error('Error handling request:', err);
        sendError(res, 'Internal Server Error', 'ERROR', 500);
    }
});

server.listen(port, host, (err) => {
    if (err) {
        console.error('Error starting server:', err);
    } else {
        console.log(`Server running at http://${host}:${port}/`);
    }
});
