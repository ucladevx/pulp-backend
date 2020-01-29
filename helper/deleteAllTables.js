var deleteTable = function deleteTable(tableName) {
    var AWS = require("aws-sdk");

    
    // UNCOMMENT WHEN TESTING ON LOCAL
    AWS.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
    });

    var dynamodb = new AWS.DynamoDB();

    var params = {
        TableName : tableName
    };
    
    dynamodb.deleteTable(params, function(err, data) {
        if (err) {
            console.error("Unable to delete table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Deleted table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    });
}

var deleteAllTables = async function deleteAllTables() {
    await deleteTable("Places")
    await deleteTable("Reviews")
    await deleteTable("Users")
    await deleteTable("Tables_Data")
}

deleteAllTables()

module.exports.deleteAllTables = deleteAllTables