const {
    getAllLaunches,
    scheduleNewLaunch,
    existLaunchWithId,
    abortLaunchById,    
} = require('../../models/launches.model');

const {
    getPagination
} = require('../../services/query');                           ``

async function httpGetAllLaunches(req, res) {
    const {skip , limit} = getPagination(req.query);
    return res.status(200).json( await getAllLaunches(skip, limit));
  }

async function httpAddNewLaunch (req, res) {
    const launch = req.body;
    if(!launch.mission || !launch.launchDate || !launch.rocket || !launch.target) {
        return res.status(400).json({
             error:'missing required launch property'           
        });
    }
    launch.launchDate = new Date(launch.launchDate);
    if(isNaN(launch.launchDate)) {
        return res.status(400).json({
             error:'Invalid Date'           
        });
    }
    await scheduleNewLaunch(launch);
    return res.status(201).json(launch);
   }

async function httpAbortLaunch(req, res){
    const launchId = Number(req.params.id);
    
    //  if launch corresponding to launchId doesnot exist then we give status 404

    const existLaunch = await existLaunchWithId(launchId);
    if(!existLaunch){
        return res.status(404).json({
            error:'launch not found',
        });
    }else {
        const aborted = await abortLaunchById(launchId);
        //const launch = getAllLaunches();
        if(!aborted){
            return res.status(400).json({
                error: 'launch not found'
            })
        }else{
            return res.status(200).json({
                ok: true,
                message:'launch aborted'
            });
        }
        
    }
        
    
    

}
   
module.exports = {
    httpGetAllLaunches,
    httpAddNewLaunch,
    httpAbortLaunch,
};