"use strict";
// Express application which will make handling requests
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
// For more reference on express middleware refer
// https://expressjs.com/en/guide/using-middleware.html
// Importing express package
const express = require("express");
// Executing the function stored in express variable
// And storing the result into app variable 
exports.app = express();
// HTTP request logger middleware for node.js
const morgan = require("morgan");
// BodyParser - Node.js body parsing middleware.
// Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
const bodyParser = require("body-parser");
const userRoute_1 = require("./api/routes/userRoute");
const authRoute_1 = require("./api/routes/authRoute");
const groupRoute_1 = require("./api/routes/groupRoute");
const recordRoute_1 = require("./api/routes/recordRoute");
exports.app.use(morgan('dev'));
// Making Uploads folder static - Publically available
exports.app.use('/uploads', express.static('uploads'));
// BodyParsing URLEncoded and JSON Formats
exports.app.use(bodyParser.urlencoded({ extended: false }));
exports.app.use(bodyParser.json());
// Handling CORS Errors
exports.app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});
// Routes which should handle requests
exports.app.use('/api/user', userRoute_1.default);
exports.app.use('/api/auth', authRoute_1.default);
exports.app.use('/api/group', groupRoute_1.default);
exports.app.use('/api/record', recordRoute_1.default);
exports.app.use((req, res, next) => {
    const error = new Error('Not found');
    // res.status = 404;
    next(error);
});
exports.app.use((error, req, res, next) => {
    res.status = error.status || 500;
    res.json({
        error: {
            message: error.message
        }
    });
});
