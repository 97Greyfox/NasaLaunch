const axios = require('axios');
const launchesDatabase = require('./launches.mongo')
const planets = require('./planets.mongo')
const launches = new Map();

const SPACEX_URI = 'https://api.spacexdata.com/v4/launches/query';

const DEFLAUT_LAUNCH_NUMBER = 100;

// const launch = {
//   flightNumber : 100,// flight_number
//   mission: 'Kepler Exploration X',//name
//   rocket: 'Explorer IS1',// rocket.name
//   launchDate : new Date('December 27, 2030'),//date_local
//   target: 'Kepler-442 b',// not applicable
//   customer: ['ZTM', 'NASA'],// payload.customers
//   upcoming:true,//upcoming
//   success: true // success
// };
// saveLaunch(launch);
//launches.set(launch.flightNumber, launch);

async function populateLaunchesData() {
  const response = await axios.post(SPACEX_URI, {
    query: {},
    options: {
       pagination: false,
        populate:[
            {
                path:'rocket',
                select:{
                    name:1
                }
            },
            {
              path:'payloads',
              select:{
                  customers:1
              }
          }
        ]
    }
});

const launchDocs = response.data.docs;

for (const launchDoc of launchDocs){
  const payloads = launchDoc['payloads'];
   const customers = payloads.flatMap((payload)=>{
    return payload['customers'];
   });

  const launch = {
    flightNumber : launchDoc['flight_number'],
    mission : launchDoc['name'],
    rocket : launchDoc['rocket']['name'],
    launchDate:launchDoc['date_local'],
    upcoming : launchDoc['upcoming'],
    success : launchDoc['success'],
    customers : customers, 
  };
  console.log(launch);
  await saveLaunch(launch);
}
}

async function loadLaunchesData() {
  console.log('downoading launches data');
  const firstLaunch = await firstLaunchData({
    flightNumber : 1,
    mission : 'Falcon 1',
    rocket : 'FalconSat',
  });

  if(firstLaunch){
    console.log('launches are loaded');
    return;
  }else{
    await populateLaunchesData();
  }

}

async function firstLaunchData(filter){
  return await launchesDatabase.findOne(filter);
}


async function existLaunchWithId(launchId){
   return await launchesDatabase.findOne({flightNumber:launchId});
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort('-flightNumber' );
  if(!latestLaunch){
    return DEFLAUT_LAUNCH_NUMBER;
  }
  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit){
  return await launchesDatabase.find({},{
    '_id':0, '__v':0
  })
  .sort({flightNumber:1})
  .skip(skip)
  .limit(limit);
}

async function saveLaunch(launch){
  await launchesDatabase.findOneAndUpdate({
    flightNumber:launch.flightNumber,
  }, launch,
{
  upsert: true
});
}

/*function addNewLaunch (launch) {
  lastFlightNumber++;
  launches.set(lastFlightNumber, Object.assign(launch, {
    customer: ['Zero to Mastery', 'NASA'],
    flightNumber: lastFlightNumber,
    upcoming:true,
    success:true
  }));
}*/

async function scheduleNewLaunch (launch){
  const planet = await planets.findOne({
    kepler_name: launch.target,
  })
  if(!planet){
    throw new Error('no matching planet');
  }

  const newFlightNumber = await getLatestFlightNumber() +1;
  const newLaunch = Object.assign(launch, {
    success:true,
    upcoming: true,
    customer: ['Zero to Mastery', 'NASA'],
    flightNumber:newFlightNumber,
  });
  await saveLaunch(newLaunch);
}


async function abortLaunchById (launchId){
   /*const aborted = launches.get(launchId);
   aborted.upcoming =false;
   aborted.success = false;
   //launches.delete(launchId);
   return aborted;*/

   const aborted = await launchesDatabase.updateOne({flightNumber:launchId}, {
    upcoming:false,
    success:false
   });
   return aborted.acknowledged === true && aborted.modifiedCount === 1;
   
}

module.exports = {
  getAllLaunches,
  scheduleNewLaunch,
  existLaunchWithId,
  abortLaunchById,
  loadLaunchesData,
};