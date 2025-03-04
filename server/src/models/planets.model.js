const planets = require('./planets.mongo')
const {parse} = require('csv-parse');
const fs = require('fs');
const path = require('path');

//const results = [];
function isHabitablePlanet(data){
  return data['koi_disposition'] === 'CONFIRMED' && data['koi_insol']>0.36 && data['koi_insol']<1.11 && data['koi_prad']<1.6; 
  
}

function loadPlanetsData(){
  return new Promise((resolve, reject) => {fs.createReadStream(path.join(__dirname,'..','..','data','kepler_data.csv'))
  .pipe(parse({
    comment: '#',
    columns: true,
  }))
  .on('data', async (data) => {
    if(isHabitablePlanet(data)){
      savePlanet(data);
    }
    
  })
  .on('error', (err) => {
    console.log(err);
    reject(err);
  })
  .on('end', async () => {
    const countPlanetsFound = (await getAllPlanets()).length;

    console.log(`${countPlanetsFound} is the amount of habitable planets`);
    resolve();
   });
  });
};

  async function getAllPlanets(){
    //return results;
    return await planets.find({}, {
      '_id':0, '__v':0
    });
  }
  async function savePlanet(data){
    try{
       //results.push(data);
      //await planets.create({
        //kepler_name:data.kepler_name,
      //});
      await planets.updateOne({
        kepler_name:data.kepler_name,
      }, {
        kepler_name:data.kepler_name,
      },{
        upsert:true
    });
    } catch(err){
      console.error(`planet not saved ${err}`);
    }
    
  }
  module.exports = {
    loadPlanetsData,
    getAllPlanets,
  };