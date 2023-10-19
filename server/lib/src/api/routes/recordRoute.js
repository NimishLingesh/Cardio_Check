"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Importing express package
const express = require("express");
const multer = require("multer");
const multerS3 = require("multer-s3-v3");
const AWS = require("aws-sdk");
const config_1 = require("../../config/config");
// Router-level middleware works in the same way as application-level middleware, 
// except it is bound to an instance of express.Router().
const router = express.Router();
// Get Order Controller
const recordController_1 = require("../controllers/recordController");
// Creating object for OrdersController Class
const Controller = new recordController_1.default();
AWS.config.update({
    region: config_1.default.AWS_REGION,
    accessKeyId: config_1.default.AWS_ACCESS_KEY,
    secretAccessKey: config_1.default.AWS_SECRET_KEY
});
var s3 = new AWS.S3();
let upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: config_1.default.IMAGE_BUCKET,
        acl: 'public-read',
        key: function (req, file, cb) {
            cb(null, file.originalname);
        }
    })
});
// Getting trusted ticket from tableau server
router.post('/create/tabular/', Controller.add_tabular_record);
router.post('/create/image/', upload.single("file"), Controller.add_image_record);
exports.default = router;
