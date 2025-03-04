require('dotenv').config();

const PORT = process.env.PORT || 8000;
const {mongoConnect} = require('../src/services/mongo.js')
//const mongoose = require('mongoose');

const app = require('./app');
const http = require('http');
const {loadPlanetsData} = require('./models/planets.model');
const {loadLaunchesData} = require('./models/launches.model.js')

//const MONGO_URL ='mongodb+srv://nasa-api:L45moqrCvWWAdCSm@nasacluster.vwnw0.mongodb.net/nasa?retryWrites=true&w=majority&appName=NASACluster';

const server = http.createServer(app);



async function startServer() {
    await mongoConnect();
    await loadPlanetsData();
    // await loadLaunchesData();
    
  server.listen(PORT, ()=>{
    console.log(`Listening at PORT : ${PORT}`);
  });  
};

startServer();

