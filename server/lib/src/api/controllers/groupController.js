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
const AWS = require("aws-sdk");
const node_fetch_1 = require("node-fetch");
const store = require("node-cache");
const config_1 = require("../../config/config");
AWS.config.update({
    region: config_1.default.AWS_REGION,
    accessKeyId: config_1.default.AWS_ACCESS_KEY,
    secretAccessKey: config_1.default.AWS_SECRET_KEY
});
class GroupController {
    constructor() {
        // Get userId by email
        this.get_groupId_by_email = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let email = req.params.email;
            let myCache = new store();
            try {
                yield node_fetch_1.default('http://localhost:8080/api/user/userId/' + email)
                    .then((res) => res.json())
                    .then((data) => {
                    myCache.mset([
                        { key: 'userId', val: data.data, ttl: 10000 }
                    ]);
                });
                let userId = myCache.mget(['userId']).userId;
                var params = {
                    TableName: config_1.default.DATABASE_NAME,
                    KeyConditionExpression: "#PK = :PK and begins_with(#SK, :SK)",
                    ExpressionAttributeNames: { "#PK": "PK", "#SK": "SK" },
                    ExpressionAttributeValues: {
                        ":PK": "USR#" + userId,
                        ":SK": "GRP#"
                    }
                };
                var documentClient = new AWS.DynamoDB.DocumentClient();
                documentClient.query(params, function (err, data) {
                    var _a;
                    if (err)
                        console.log(err);
                    else {
                        res.send({
                            status: 200,
                            data: (_a = data === null || data === void 0 ? void 0 : data.Items[0]) === null || _a === void 0 ? void 0 : _a.SK.split('#')[2],
                            message: 'OK'
                        });
                    }
                });
            }
            catch (err) {
                res.status(500).json({
                    message: err
                });
            }
        });
        this.get_groupData_by_email = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let email = req.body.email;
            let type = req.body.type;
            let myCache = new store();
            try {
                yield node_fetch_1.default('http://localhost:8080/api/group/groupId/' + email)
                    .then((res) => res.json())
                    .then((data) => {
                    myCache.mset([
                        { key: 'groupId', val: data.data, ttl: 10000 }
                    ]);
                });
                let groupId = myCache.mget(['groupId']).groupId;
                var params = {
                    TableName: config_1.default.DATABASE_NAME,
                    KeyConditionExpression: "#PK = :PK and begins_with(#SK, :SK)",
                    ExpressionAttributeNames: { "#PK": "PK", "#SK": "SK" },
                    ExpressionAttributeValues: {
                        ":PK": "GRP#" + groupId,
                        ":SK": "REC#" + type + '#'
                    }
                };
                var documentClient = new AWS.DynamoDB.DocumentClient();
                documentClient.query(params, function (err, data) {
                    if (err)
                        console.log(err);
                    else {
                        res.send({
                            status: 200,
                            data: data === null || data === void 0 ? void 0 : data.Items,
                            message: 'OK'
                        });
                    }
                });
            }
            catch (err) {
                res.status(500).json({
                    message: err
                });
            }
        });
        this.get_group_by_name = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let name = req.params.name;
            console.log('Name : ', name);
            try {
                var params = {
                    TableName: 'user_data',
                    IndexName: 'Group-By-Name',
                    KeyConditionExpression: '#PK = :PK',
                    ExpressionAttributeNames: { '#PK': 'name' },
                    ExpressionAttributeValues: {
                        ':PK': name
                    }
                };
                var documentClient = new AWS.DynamoDB.DocumentClient();
                documentClient.query(params, function (err, data) {
                    if (err)
                        console.log(err);
                    else {
                        res.send({
                            status: 200,
                            data: data.Items,
                            message: 'OK'
                        });
                    }
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
exports.default = GroupController;
