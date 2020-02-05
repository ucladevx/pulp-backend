var createUsersTable = function createUsersTable() {
    return new Promise((resolve, reject) => {
        var AWS = require("aws-sdk");

        // UNCOMMENT WHEN TESTING ON LOCAL
        AWS.config.update({
        region: "us-west-2",
        endpoint: "http://localhost:8000"
        });

        // test dynamodb external
        // COMMENT OUT WHEN TESTING ON LOCAL
        AWS.config.update({region: "us-west-2"});

        var dynamodb = new AWS.DynamoDB();

        var params = {
            TableName : "Users",
            KeySchema: [
                { AttributeName: "user_id", KeyType: "HASH"}, //Partition key
            ],
            AttributeDefinitions: [
                { AttributeName: "user_id", AttributeType: "N" },
                { AttributeName: "facebook_id", AttributeType: "S"},
            ],
            GlobalSecondaryIndexes: [
                {
                    IndexName: "facebook_id_index",
                    Projection: {
                        ProjectionType: "ALL"
                    },
                    ProvisionedThroughput: {
                        "WriteCapacityUnits": 5,
                        "ReadCapacityUnits": 10
                    },
                    //IndexStatus: "CREATING",
                    KeySchema: [
                        {
                            KeyType: "HASH",
                            AttributeName: "facebook_id",
                        }
                    ]
                }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 10,
                WriteCapacityUnits: 10
            },

        };

        dynamodb.createTable(params, function(err, data) {
            if (err) {
                console.error("");
                console.error("--> Unable to create Users table!");
                console.error("Error JSON:", JSON.stringify(err, null, 2));
                return reject();
            } else {
                console.log("");
                console.log("--> Created Users table!");
                console.log("Table description JSON:", JSON.stringify(data, null, 2));
                resolve();
            }
        });
    })
}

//createUsersTable()

module.exports.createUsersTable = createUsersTable
