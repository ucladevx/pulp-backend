var createPlacesTable = function createPlacesTable() {
    return new Promise((resolve, reject) => {
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
                console.error("");
                console.error("--> Unable to create Places table!");
                console.error("Error JSON:", JSON.stringify(err, null, 2));
                return reject();
            } else {
                console.log("");
                console.log("--> Created Places table!");
                console.log("Table description JSON:", JSON.stringify(data, null, 2));
                resolve();
            }
        });
    })
}

//createPlacesTable()

module.exports.createPlacesTable = createPlacesTable
