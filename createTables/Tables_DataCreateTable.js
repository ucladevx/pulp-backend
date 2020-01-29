var createTables_DataTable = function createTables_DataTable() {
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
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

//createTables_DataTable()

module.exports.createTables_DataTable = createTables_DataTable
