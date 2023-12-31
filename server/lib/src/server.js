"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importing 'http' package
const http = require("http");
// Importing app variable from app.js
const app_1 = require("./app");
// Importing config file 
const config_1 = require("./config/config");
// Accessing environment variables in Node.js is supported right out of the box. 
// When your Node.js process boots up it will automatically provide access to all existing
// environment variables by creating an 'env' object as property of the 'process' global object. 
// For example, On the server you deploy it on most hosting providers offer you to inject
// environment variables into your running project and then you would simply add this
// port environment variable. If its not set however we will use 3000 as a default port.
const port = config_1.default.PORT || 8080;
// Creating server
// http.createServer() method turns your computer into an HTTP server
// http.createServer() method creates an HTTP Server Object
// The HTTP Server object can listen to ports on your computer and execute a function, 
// a 'requestListener', each time a request is made.
// 'requestListener' - Specifies a function to be executed every time the server gets a request. 
// This function is called a requestListener, and handles request from the user, as well as response 
// back to the user.
const server = http.createServer(app_1.app);
// server.listen() method creates a listener on the specified port or path
app_1.app.listen(port);
