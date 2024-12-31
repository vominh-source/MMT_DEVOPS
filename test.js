require('dotenv').config({ path: '.env1' });
const { MongoClient } = require('mongodb');

async function printFirstRecord() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('AppData'); 
    const collection = db.collection('LOCATION');

    const firstRecord = await collection.findOne();

    if (firstRecord) {
      console.log('First record in AppData.LOCATION:');
      console.log(firstRecord);
    } else {
      console.log('No records found in AppData.LOCATION');
    }
  } catch (error) {
    console.error('Error connecting to MongoDB or fetching data:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

printFirstRecord();