'use strict';

const fs = require('fs');
const path = require('path');

// MIME types for various file extensions
const MIMETYPES = {
    ".html": { "type": "text/html", "encoding": "utf8" },
    ".js": { "type": "text/javascript", "encoding": "utf8" },
    ".css": { "type": "text/css", "encoding": "utf8" },
    ".json": { "type": "application/json", "encoding": "utf8" },
    ".png": { "type": "image/png", "encoding": "binary" },
    ".jpeg": { "type": "image/jpeg", "encoding": "binary" },
    ".jpg": { "type": "image/jpeg", "encoding": "binary" },
    ".gif": { "type": "image/gif", "encoding": "binary" },
    ".ico": { "type": "image/vnd.microsoft.icon", "encoding": "binary" }
};

// Read file based on its extension and MIME type
const read = async (filepath) => {
    try {
        const extension = path.extname(filepath).toLowerCase();
        const mime = MIMETYPES[extension] || { type: 'application/octet-stream', encoding: 'binary' };
        const fileData = await fs.promises.readFile(filepath, mime.encoding);
        return { fileData, mime };
    } catch (err) {
        console.error('Error reading file:', err);
        return { error: 'File not found or read error', mime: { type: 'text/plain', encoding: 'utf8' }, fileData: 'File not found or read error' };
    }
};

// Send file data as a response
const send = (res, resource) => {
    res.writeHead(200, {
        'Content-Type': resource.mime.type,
        'Content-Length': Buffer.byteLength(resource.fileData, resource.mime.encoding)
    });
    res.end(resource.fileData, resource.mime.encoding);
};

// Send JSON data as a response
const sendJson = (res, jsonResource) => {
    const jsonData = JSON.stringify(jsonResource, null, 4); // Pretty print JSON
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(jsonData);
};

// Send error response with a specific message, type, and code
const sendError = (res, message, type, code = 404) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message, type }));
};

// Check if a route matches any of the given start routes
const isIn = (route, ...routes) => {
    for (let start of routes) {
        if (route.startsWith(start)) return true;
    }
    return false;
}

// Allowed content types for POST requests
const allowedFormats = [
    'application/x-www-form-urlencoded',
    'application/json'
];

// Get POST request body data based on content type
const getRequestPostBodyData = request =>
    new Promise((resolve, reject) => {
        const type = request.headers['content-type'];
        if (allowedFormats.includes(type)) {
            const databuffer = [];

            request.on('data', datapart => databuffer.push(datapart));

            request.on('end', () => {
                const data = Buffer.concat(databuffer).toString();

                if (type === 'application/json') {
                    resolve(JSON.parse(data));
                } else {
                    const params = new URLSearchParams(data);
                    const jsonResult = {};
                    params.forEach((value, key) => jsonResult[key] = value);
                    resolve(jsonResult);
                }
            });

            request.on('error', () => reject('Error in transmission'));
        } else {
            reject('Wrong Content-Type');
        }
    });

module.exports = { read, send, sendJson, sendError, isIn, getRequestPostBodyData };
