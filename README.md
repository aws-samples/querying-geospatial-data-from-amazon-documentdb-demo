## Introduction

In this demo, we will show how to store, index and query geospatial data in Amazon DocumentDB (with MongoDB Compatibility). This capability allows developers to build applications that can calculate geometries on a sphere by creating 2dsphere Indexes on Amazon DocumentDB, and also perform proximity querying on data stored on Amazon DocumentDB using MongoDB API's such as `$nearSphere`, `$geoNear`, `$minDistance`, `$maxDistance`

## Prerequisites

- AWS CLI
- A valid AWS Account
- MongoDB client ([Mongo shell](https://docs.mongodb.com/v4.4/mongo/))

## Step 1: Creating Amazon DocumentDB cluster
We will create our cluster from the command line using AWS CLI using the command below:

	aws docdb create-db-cluster \
	    --db-cluster-identifier docdb-demo \
	    --engine docdb \
	    --master-username master-user \
	    --master-user-password password

Alternatively, you can login to your AWS account and create your demo Amazon DocumentDB cluster from the AWS console. Please follow the steps [here](https://docs.aws.amazon.com/documentdb/latest/developerguide/get-started-guide.html#cloud9-cluster).

## Step 2: Install the Mongo shell

To install the Mongo shell on AWS Cloud 9 environment (which is what I am using), we need to run the following commands:

	echo -e "[mongodb-org-4.0] \nname=MongoDB Repository\nbaseurl=https://repo.mongodb.org/yum/amazon/2013.03/mongodb-org/4.0/x86_64/\ngpgcheck=1 \nenabled=1 \ngpgkey=https://www.mongodb.org/static/pgp/server-4.0.asc" | sudo tee /etc/yum.repos.d/mongodb-org-4.0.repo

The first command (above) creates the repository file while the second command (below) installs the Mongo shell.

`sudo yum install -y mongodb-org-shell`

## Step 3: Connect to Amazon DocumentDB cluster

With the mongo shell now install in our demo environment, let's now connect to the Amazon DocumentDB cluster using the command below:

`mongo --ssl --host docdb-demo.cluster-cgdued2pbbld.us-west-2.docdb.amazonaws.com:27017 --sslCAFile rds-combined-ca-bundle.pem --username myuser --password <REPLACE_ME_WITH_PASSWORD>`

We should get an output similar to the following with the mongo shell prompt at the end of it if successful

	MongoDB shell version v4.0.27
	connecting to: mongodb://docdb-demo.cluster-cgdued2pbbld.us-west-2.docdb.amazonaws.com:27017/?gssapiServiceName=mongodb
	Implicit session: session { "id" : UUID("2ccb4437-abd2-42ff-bf63-c0d587bb24c8") }
	MongoDB server version: 4.0.0
	
	Warning: Non-Genuine MongoDB Detected
	
	This server or service appears to be an emulation of MongoDB rather than an official MongoDB product.
	
	Some documented MongoDB features may work differently, be entirely missing or incomplete, or have unexpected performance characteristics.
	
	To learn more please visit: https://dochub.mongodb.org/core/non-genuine-mongodb-server-warning.
	
	rs0:PRIMARY> 

## Step 4: Create a collection on Amazon DocumentDB and insert some test data to it.

Let's create a collection that we call airports and insert a some test data representing coordinates of random airports of major cities in the US.
	
	db.airports.insert(
	        {
	            city: “New York“,
	            location: {type: "Point",coordinates: [1, 2]}
	        });
	db.airports.insert(        
	        {
	            city: "New Jersey",
	            location: {type: "Point",coordinates: [30, 40]}
	        });
	db.airports.insert(        
	        {
	            city: "Washington DC",
	            location: {type: "Point",coordinates: [5, 6]}
	        });
	db.airports.insert(         
	        {
	            city: "Baltimore",
	            location: {type: "Point",coordinates: [75, 80]}
	        });
	db.airports.insert(
	        {         
	            city: "Los Angeles",
	            location: {type: "Point",coordinates: [9, 10]}
	        });
	db.airports.insert(                              
	        {
	            city: "San Francisco",
	            location: {type: "Point",coordinates: [11, 12]}
	        });

We have just added geospatial data as GeoJSON objects to our collections in Amazon DocumentDB. Now, let's enable 2dsphere indexes to be able to run queries that calculate geometries on an earth-like sphere. This indexing is done using the following command:

`db.airports.createIndex({location:"2dsphere"})`

## Step 5: Query geospatial data from Amazon DocumentDB

We are going to use the db.collection.find() api to run our query. In this case, we are using the MongoDB api `$nearSphere` to retrieve geospatial objects in proximity to a point [7, 8] on a sphere.

	rs0:PRIMARY> use airports
	switched to db airports
	rs0:PRIMARY> db.airports.find({
	...     location:{
	...       $nearSphere:{
	...          $geometry:{ type:"Point", "coordinates":[7, 8]
	...           }
	...       }
	...    }
	...  },
	...  {_id:0, city:1, location:1}
	...  ).limit(2)

And as expected the query returns the two nearest points to our reference point [7, 8] which are [9, 10] and [5, 6]
	
	{ "city" : "Los Angeles", "location" : { "type" : "Point", "coordinates" : [ 9, 10 ] } }
	{ "city" : "Washington DC", "location" : { "type" : "Point", "coordinates" : [ 5, 6 ] } }
	rs0:PRIMARY> 

The geometry calculations capability of queries run against geospatial data in GeoJSON coordinates could be applied to many use cases such as finding the nearest restaurants, cinemas, schools, hotels, etc. to a a given location, or the distance between two major landmarks.

## Connecting to DocumentDB and querying geospatial data using a program

The above process could also be done programmatically, that is by using a program to connect to Amazon DocumentDB, inserting and retrieving GeoJSON objects.

We can use the following node.js code to perform these tasks programmatically:

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


## Conclusion
In this demo, we demonstrated how it is now possible to store, query and index geospatial data in Amazon DocumentDB (with MongoDB compatibility). Using a simple example with some dummy data in the format of GeoJSON coordinates [longitude, latitude], we showed how to run proximity query on data stored on DocumentDB using MongoDB API `$nearSphere`

More information on querying geospatial data with Amazon Document DB can be found from our [online documentation](https://docs.aws.amazon.com/documentdb/latest/developerguide/geospatial.html#w2aac37c11b9).

Please remember to clean up your AWS enviroment and free up all resources your created for this demo!

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
