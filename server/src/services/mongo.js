const mongoose = require('mongoose');
require('dotenv').config();

//const MONGO_URL ='mongodb+srv://nasa-api:L45moqrCvWWAdCSm@nasacluster.vwnw0.mongodb.net/nasa?retryWrites=true&w=majority&appName=NASACluster';

mongoose.connection.once('open', ()=>{
  console.log('Mongodb Ready');
});

mongoose.connection.on('error', (err)=>{
  console.error(err, 'database error');
});

async function mongoConnect() {
  return await mongoose.connect(process.env.MONGO_URL);
}

async function mongoDisconnect (){
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};