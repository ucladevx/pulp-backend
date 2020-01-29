var createPlacesTable = function createPlacesTable() {
    console.log("in create places table")
    var AWS = require("aws-sdk");

    // UNCOMMENT WHEN TESTING ON LOCAL
    AWS.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
    });

    // test dynamodb external
    // COMMENT OUT WHEN TESTING ON LOCAL
    //AWS.config.update({region: "us-west-2"});

    var dynamodb = new AWS.DynamoDB();

    var params = {
        TableName : "Places",
        KeySchema: [
            { AttributeName: "place_id", KeyType: "HASH"},  //Partition key
        ],
        AttributeDefinitions: [
            { AttributeName: "place_id", AttributeType: "N" },
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

//createPlacesTable()

module.exports.createPlacesTable = createPlacesTable