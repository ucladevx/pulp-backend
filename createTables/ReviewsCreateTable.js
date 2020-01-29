var createReviewsTable = function createReviewsTable() {
    var AWS = require("aws-sdk");

    // UNCOMMENT WHEN TESTING ON LOCAL
    AWS.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
    });

    // test dynamodb external
    // COMMENT THIS OUT WHEN TESTING ON LOCAL
    // AWS.config.update({region: "us-west-2"});

    var dynamodb = new AWS.DynamoDB();

    var params = {
        TableName : "Reviews",
        KeySchema: [
            { AttributeName: "review_id", KeyType: "HASH"},  //Partition key
        ],
        AttributeDefinitions: [
            { AttributeName: "review_id", AttributeType: "N" },
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 10
        }
    };

    dynamodb.createTable(params, function(err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

//createReviewsTable()

module.exports.createReviewsTable = createReviewsTable