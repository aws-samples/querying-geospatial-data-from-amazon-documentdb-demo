var MongoClient = require('mongodb').MongoClient

//Create a MongoDB client, open a connection to DocDB


var client = MongoClient.connect(
'mongodb://<insertYourUser>:<insertYourPassword>@docdb-demo.cgdued2pbbld.us-west-2.docdb.amazonaws.com:27017/?ssl=true&ssl_ca_certs=rds-combined-ca-bundle.pem&retryWrites=false',
{
  tlsCAFile: `rds-combined-ca-bundle` //Specify the DocDB; cert
},
function(err, client) {
    if(err)
        throw err;

    //Specify the database to be used
    db = client.db('airports');

    //Specify the collection to be used
    col = db.collection('airports');

    //Insert a single document
    col.insertOne({ city: "Las Vegas", location: {type: "Point",coordinates: [-10, 16]}, function(err, result){

      //Find the document that was previously written
      col.findOne(city: "Las Vegas", location: {type: "Point",coordinates: [-10, 16]}, function(err, result){

        //Print the result to the screen
        console.log(result);

        //Close the connection
        client.close()
      });
   });
});