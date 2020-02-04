var createTables_DataTable = function createTables_DataTable() {
    return new Promise((resolve, reject) => {
        var AWS = require("aws-sdk");


        // UNCOMMENT WHEN TESTING ON LOCAL
        AWS.config.update({
        region: "us-west-2",
        endpoint: "http://localhost:8000"
        });

        // test dynamodb external
        // COMMENT OUT WHEN TESTING ON LOCAL
        // AWS.config.update({region: "us-west-2"});

        var dynamodb = new AWS.DynamoDB();

        var params = {
            TableName : "Tables_Data",
            KeySchema: [
                { AttributeName: "table_id", KeyType: "HASH"},  //Partition key
            ],
            AttributeDefinitions: [
                { AttributeName: "table_id", AttributeType: "N" },
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 10,
                WriteCapacityUnits: 10
            }
        };

        dynamodb.createTable(params, function(err, data) {
            if (err) {
                console.error("");
                console.error("--> Unable to create Tables_Data table!");
                console.error("Error JSON:", JSON.stringify(err, null, 2));
                return reject();
            } else {
                console.log("");
                console.log("--> Created Tables_Data table!");
                console.log("Table description JSON:", JSON.stringify(data, null, 2));
                resolve();
            }
        });
    })
}

//createTables_DataTable()

module.exports.createTables_DataTable = createTables_DataTable
