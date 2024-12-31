require('dotenv').config({path: '.env'});
const { MongoClient } = require('mongodb');
const fs = require('fs');


async function loadData() {
  const client = new MongoClient(process.env.MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('AppData');

    // Save data to global variable
    global.data = {
      locations: await db.collection('LOCATION').find({}).toArray(),
      tags: await db.collection('TAG').find({}).toArray(),
      users: await db.collection('users').find({}).toArray(),
    };

    console.log('Found', global.data.locations.length, 'records in LOCATION.');
    console.log('Found', global.data.tags.length, 'records in TAG.');
    console.log('Found', global.data.users.length, 'records in users.');

  } catch (error) {
    console.error('Error connecting to MongoDB or fetching data:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}


async function getAllLocations() {
    const client = new MongoClient(process.env.MONGODB_URI);
  
    try {
      await client.connect();
      console.log('Connected to MongoDB');
  
      const db = client.db('AppData');
      const collection = db.collection('LOCATION');
  
      // Sử dụng .find() và .toArray() để lấy tất cả record
      const allRecords = await collection.find({}).toArray();
  
      if (allRecords.length > 0) {
        console.log('Found', allRecords.length, 'records in LOCATION.');
        return allRecords;
      } else {
        console.log('No locations found in the database.');
        return [];
      }
    } catch (error) {
      console.error('Error connecting to MongoDB or fetching data:', error);
      return [];
    } finally {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  }
  
// getAllLocations();
  
module.exports = { loadData };