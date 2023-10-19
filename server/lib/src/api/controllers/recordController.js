"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const json2csv_1 = require("json2csv");
const AWS = require("aws-sdk");
const uuid_1 = require("uuid");
const config_1 = require("../../config/config");
const store = require("node-cache");
const node_fetch_1 = require("node-fetch");
const python_shell_1 = require("python-shell");
AWS.config.update({
    region: config_1.default.AWS_REGION,
    accessKeyId: config_1.default.AWS_ACCESS_KEY,
    secretAccessKey: config_1.default.AWS_SECRET_KEY
});
class RecordController {
    constructor() {
        // Adding Tabular Record
        this.add_tabular_record = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let bodyParams = req.body;
            let fields = [
                'gender',
                'age',
                'hypertension',
                'heart_disease',
                'ever_married',
                'work_type',
                'Residence_type',
                'avg_glucose_level',
                'bmi',
                'smoking_status'
            ];
            let opts = { fields };
            let myCache = new store();
            var s3 = new AWS.S3();
            const recordId = uuid_1.v4();
            try {
                const csv = json2csv_1.parse(bodyParams, opts);
                var base64data = Buffer.from(csv, 'binary');
                let fileName = bodyParams.fileName;
                yield node_fetch_1.default('http://localhost:8080/api/group/groupId/' + bodyParams.email)
                    .then((res) => res.json())
                    .then((data) => {
                    myCache.mset([
                        { key: 'groupId', val: data.data, ttl: 10000 }
                    ]);
                });
                let groupId = myCache.mget(['groupId']).groupId;
                var params = {
                    Body: base64data,
                    Bucket: config_1.default.TABLE_BUCKET,
                    Key: fileName
                };
                s3.putObject(params, function (err, data) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (err) {
                            console.log(err, err.stack);
                        }
                        else {
                            let options = {
                                pythonPath: config_1.default.Python_Path,
                                scriptPath: 'src/api/controllers',
                                args: [fileName]
                            };
                            yield python_shell_1.PythonShell.run('deployTable.py', options, function (err, results) {
                                return __awaiter(this, void 0, void 0, function* () {
                                    if (err) {
                                        throw err;
                                    }
                                    let params2;
                                    if (bodyParams.level == 'organisation') {
                                        params2 = {
                                            TableName: config_1.default.DATABASE_NAME,
                                            Item: {
                                                PK: `GRP#${groupId}`,
                                                SK: `REC#table#${recordId}`,
                                                firstName: bodyParams.firstName,
                                                lastName: bodyParams.lastName,
                                                gender: bodyParams.gender,
                                                age: bodyParams.age,
                                                hypertension: bodyParams.hypertension,
                                                heart_disease: bodyParams.heart_disease,
                                                ever_married: bodyParams.ever_married,
                                                work_type: bodyParams.work_type,
                                                Residence_type: bodyParams.Residence_type,
                                                avg_glucose_level: bodyParams.avg_glucose_level,
                                                bmi: bodyParams.bmi,
                                                smoking_status: bodyParams.smoking_status,
                                                time_created: bodyParams.time_created,
                                                time_stamp: bodyParams.time_stamp,
                                                score: Math.floor(results[0] * 100) + ' %'
                                            }
                                        };
                                    }
                                    else {
                                        params2 = {
                                            TableName: config_1.default.DATABASE_NAME,
                                            Item: {
                                                PK: `GRP#${groupId}`,
                                                SK: `REC#table#${recordId}`,
                                                gender: bodyParams.gender,
                                                age: bodyParams.age,
                                                hypertension: bodyParams.hypertension,
                                                heart_disease: bodyParams.heart_disease,
                                                ever_married: bodyParams.ever_married,
                                                work_type: bodyParams.work_type,
                                                Residence_type: bodyParams.Residence_type,
                                                avg_glucose_level: bodyParams.avg_glucose_level,
                                                bmi: bodyParams.bmi,
                                                smoking_status: bodyParams.smoking_status,
                                                time_created: bodyParams.time_created,
                                                time_stamp: bodyParams.time_stamp,
                                                score: Math.floor(results[0] * 100) + ' %'
                                            }
                                        };
                                    }
                                    var documentClient = new AWS.DynamoDB.DocumentClient();
                                    yield documentClient.put(params2, function (err, data) {
                                        if (err)
                                            console.log(err);
                                        else {
                                            res.send({
                                                status: 200,
                                                data: 'Created Record Successfully. Please find your risk score in Check Scores section',
                                                message: 'OK'
                                            });
                                        }
                                    });
                                });
                            });
                        }
                    });
                });
            }
            catch (err) {
                res.status(500).json({
                    message: err
                });
            }
        });
        // Adding Image Record
        this.add_image_record = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let myCache = new store();
            let req_params = req.body;
            var s3 = new AWS.S3();
            const recordId = uuid_1.v4();
            let groupType;
            if (req_params.level == 'personal') {
                groupType = 'self';
            }
            else {
                groupType = 'org';
            }
            try {
                yield node_fetch_1.default('http://localhost:8080/api/group/groupId/' + req_params.email)
                    .then((res) => res.json())
                    .then((data) => {
                    myCache.mset([
                        { key: 'groupId', val: data.data, ttl: 10000 }
                    ]);
                });
                let groupId = myCache.mget(['groupId']).groupId;
                var params = {
                    Bucket: config_1.default.IMAGE_BUCKET,
                    Key: req_params.fileName
                };
                yield s3.waitFor('objectExists', params, function (err, data) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (err) {
                            console.log(err, err.stack); // an error occurred
                        }
                        else {
                            let url = 'https://' +
                                config_1.default.IMAGE_BUCKET +
                                '.s3.' +
                                config_1.default.AWS_REGION +
                                '.amazonaws.com/' +
                                req_params.fileName;
                            let options = {
                                pythonPath: config_1.default.Python_Path,
                                scriptPath: 'src/api/controllers',
                                args: [url, req_params.fileName]
                            };
                            yield python_shell_1.PythonShell.run('deploy.py', options, function (err, results) {
                                return __awaiter(this, void 0, void 0, function* () {
                                    if (err) {
                                        throw err;
                                    }
                                    let params1;
                                    if (req_params.level == 'personal') {
                                        params1 = {
                                            TableName: config_1.default.DATABASE_NAME,
                                            Item: {
                                                PK: `GRP#${groupId}`,
                                                SK: `REC#image#${recordId}`,
                                                name: req_params.fileName.split('-')[1],
                                                size: Math.round((req_params.size * 10) /
                                                    1024) / 10,
                                                lastModified: req_params.lastModified,
                                                url: url,
                                                time_stamp: req_params.time_stamp,
                                                score: Math.floor(results[0] * 100) +
                                                    ' %'
                                            }
                                        };
                                    }
                                    else {
                                        params1 = {
                                            TableName: config_1.default.DATABASE_NAME,
                                            Item: {
                                                PK: `GRP#${groupId}`,
                                                SK: `REC#image#${recordId}`,
                                                firstName: req_params.firstName,
                                                lastName: req_params.lastName,
                                                gender: req_params.gender,
                                                age: req_params.age,
                                                name: req_params.fileName.split('-')[1],
                                                size: Math.round((req_params.size * 10) /
                                                    1024) / 10,
                                                lastModified: req_params.lastModified,
                                                url: url,
                                                time_stamp: req_params.time_stamp,
                                                score: Math.floor(results[0] * 100) +
                                                    ' %'
                                            }
                                        };
                                    }
                                    var documentClient = new AWS.DynamoDB.DocumentClient();
                                    yield documentClient.put(params1, function (err, data) {
                                        if (err)
                                            console.log(err);
                                        else {
                                            res.send({
                                                status: 200,
                                                data: 'Created Record Successfully. Please find your risk score in Check Scores section',
                                                message: 'OK'
                                            });
                                        }
                                    });
                                });
                            });
                        }
                    });
                });
            }
            catch (err) {
                res.status(500).json({
                    message: err
                });
            }
        });
    }
}
exports.default = RecordController;
