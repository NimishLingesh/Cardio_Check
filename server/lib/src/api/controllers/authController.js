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
const config_1 = require("../../config/config");
AWS.config.update({
    region: config_1.default.AWS_REGION,
    accessKeyId: config_1.default.AWS_ACCESS_KEY,
    secretAccessKey: config_1.default.AWS_SECRET_KEY
});
let documentClient = new AWS.DynamoDB.DocumentClient();
class AuthController {
    constructor() {
        // Create user
        this.check_login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            let bodyParams = req.body;
            try {
                var params = {
                    TableName: config_1.default.DATABASE_NAME,
                    Key: {
                        PK: 'AUTH#' + bodyParams.email,
                        SK: '#METADATA#' + bodyParams.email
                    }
                };
                documentClient.get(params, function (err, data) {
                    if (err)
                        console.log(err);
                    else {
                        if (data.Item && (data.Item.organisationType == bodyParams.organisationType) && (bodyParams.password == data.Item.password)) {
                            res.send({
                                status: 200,
                                data: 'Valid',
                                message: 'OK'
                            });
                        }
                        else {
                            res.send({
                                status: 200,
                                data: 'Invalid',
                                message: 'OK'
                            });
                        }
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
exports.default = AuthController;
