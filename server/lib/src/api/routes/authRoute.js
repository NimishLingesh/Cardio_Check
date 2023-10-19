"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importing express package
const express = require("express");
// Router-level middleware works in the same way as application-level middleware, 
// except it is bound to an instance of express.Router().
const router = express.Router();
// Get Order Controller
const authController_1 = require("../controllers/authController");
// Creating object for OrdersController Class
const Controller = new authController_1.default();
// Getting trusted ticket from tableau server
router.post('/login', Controller.check_login);
exports.default = router;
