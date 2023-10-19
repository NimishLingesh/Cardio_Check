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
const uuid_1 = require("uuid");
const AWS = require("aws-sdk");
const node_fetch_1 = require("node-fetch");
const store = require("node-cache");
const config_1 = require("../../config/config");
AWS.config.update({
    region: config_1.default.AWS_REGION,
    accessKeyId: config_1.default.AWS_ACCESS_KEY,
    secretAccessKey: config_1.default.AWS_SECRET_KEY
});
let documentClient = new AWS.DynamoDB.DocumentClient();
class UserController {
    constructor() {
        // Create user
        this.create_user = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let params = req.body;
            let myCache = new store();
            let groupId;
            let groupType = '';
            try {
                if (params.organisation == 'self') {
                    groupType = 'self';
                    groupId = uuid_1.v4();
                }
                else {
                    groupType = 'org';
                    yield node_fetch_1.default('http://localhost:8080/api/group/groupName/' +
                        params.organisation)
                        .then((res) => res.json())
                        .then((data) => {
                        let orgId = '';
                        if (data.data.length > 0) {
                            orgId = data.data[0]['SK'].split('#')[2];
                        }
                        else {
                            orgId = '';
                        }
                        myCache.mset([
                            { key: 'groupId', val: orgId, ttl: 10000 }
                        ]);
                    });
                    let groupExistsId = myCache.mget(['groupId']).groupId;
                    if (groupExistsId != '') {
                        groupId = groupExistsId;
                    }
                    else {
                        groupId = uuid_1.v4();
                    }
                }
                yield node_fetch_1.default('http://localhost:8080/api/user/userId/' + params.email)
                    .then((res) => res.json())
                    .then((data) => {
                    myCache.mset([
                        { key: 'userId', val: data.data, ttl: 10000 }
                    ]);
                });
                let userExistsId = myCache.mget(['userId']).userId;
                if (userExistsId != '') {
                    yield res.send({
                        status: 200,
                        data: 'Email already exists',
                        message: 'OK'
                    });
                }
                else {
                    // Create unique userid
                    const userId = uuid_1.v4();
                    let params1 = {
                        TableName: config_1.default.DATABASE_NAME,
                        Item: {
                            PK: `USR#${userId}`,
                            SK: `#METADATA#${userId}`,
                            firstName: params.firstName,
                            lastName: params.lastName,
                            dob: params.dob,
                            state: params.state,
                            city: params.city,
                            organisation: params.organisation || 'self',
                            phoneNumber: params.phoneNumber,
                            gender: params.gender,
                            ethnicty: params.ethnicty
                        }
                    };
                    let params2 = {
                        TableName: config_1.default.DATABASE_NAME,
                        Item: {
                            PK: `AUTH#${params.email}`,
                            SK: `#METADATA#${params.email}`,
                            password: params.password,
                            userId: userId,
                            organisationType: groupType
                        }
                    };
                    let params3 = {
                        TableName: config_1.default.DATABASE_NAME,
                        Item: {
                            PK: `USR#${userId}`,
                            SK: `GRP#${groupType}#${groupId}`,
                            name: params.organisation
                        }
                    };
                    yield documentClient.put(params1, function (err, data) {
                        if (err)
                            console.log(err);
                    });
                    yield documentClient.put(params2, function (err, data) {
                        if (err)
                            console.log(err);
                    });
                    yield documentClient.put(params3, function (err, data) {
                        if (err)
                            console.log(err);
                    });
                    yield res.send({
                        status: 200,
                        data: 'Created User Successfully',
                        message: 'OK'
                    });
                }
            }
            catch (err) {
                res.status(500).json({
                    message: err
                });
            }
        });
        // Get userId by email
        this.get_userId_by_email = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let email = req.params.email;
            try {
                var params = {
                    TableName: config_1.default.DATABASE_NAME,
                    Key: {
                        PK: 'AUTH#' + email,
                        SK: '#METADATA#' + email
                    }
                };
                var documentClient = new AWS.DynamoDB.DocumentClient();
                documentClient.get(params, function (err, data) {
                    if (err)
                        console.log(err);
                    else {
                        let userId = '';
                        if (data.Item) {
                            userId = data.Item.userId;
                        }
                        res.send({
                            status: 200,
                            data: userId,
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
        // Get userId by email
        this.get_userData_by_email = (req, res) => __awaiter(this, void 0, void 0, function* () {
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
                    Key: {
                        PK: 'USR#' + userId,
                        SK: '#METADATA#' + userId
                    }
                };
                var documentClient = new AWS.DynamoDB.DocumentClient();
                documentClient.get(params, function (err, data) {
                    if (err)
                        console.log(err);
                    else {
                        let data_res = {
                            firstName: data.Item.firstName,
                            lastName: data.Item.lastName,
                            phoneNumber: data.Item.phoneNumber,
                            city: data.Item.city,
                            state: data.Item.state,
                            dob: data.Item.dob,
                            organisation: data.Item.organisation,
                            gender: data.Item.gender,
                            ethnicty: data.Item.ethnicty
                        };
                        res.send({
                            status: 200,
                            data: data_res,
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
exports.default = UserController;
