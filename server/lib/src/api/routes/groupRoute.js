"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importing express package
const express = require("express");
// Router-level middleware works in the same way as application-level middleware, 
// except it is bound to an instance of express.Router().
const router = express.Router();
// Get Order Controller
const groupController_1 = require("../controllers/groupController");
// Creating object for OrdersController Class
const Controller = new groupController_1.default();
// Getting trusted ticket from tableau server
router.get('/groupId/:email', Controller.get_groupId_by_email);
router.get('/groupName/:name', Controller.get_group_by_name);
router.post('/data/', Controller.get_groupData_by_email);
exports.default = router;
