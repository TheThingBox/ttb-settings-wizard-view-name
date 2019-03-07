const bodyParser = require('body-parser');
const path = require('path')
const fs = require('fs')
const InterfaceUtils = require('ttbd-interface-utils')
const interface_utils = new InterfaceUtils()

const name = 'name'
var settingsPath = null

var stats = {
  initialized: false,
  status: 'nok',
  validateAction: 'reboot',
  renamed: false
}

function init(app, apiToExpose, persistenceDir) {
  settingsPath = path.join(persistenceDir, name)
  try {
    fs.mkdirSync(settingsPath, { recursive: true })
  } catch(e){}
  settingsPath = path.join(settingsPath, 'settings.json')
  syncStats()

  app.use(apiToExpose, bodyParser.json());
  app.get(apiToExpose, function(req, res){
    syncStats()
    res.json(stats)
  });

  app.post(apiToExpose, function(req, res){
    var data = req.body;
    _hostname = InterfaceUtils.formatHostname(data.hostname)
    if(_hostname !== "" ){
      interface_utils.setHostname(_hostname).then( newHostname => {
        stats.status = 'ok'
        stats.renamed = true
        syncStats(true)
        res.json({message: `The hostname was changed for '${newHostname}'`})
      }).catch( err => {
        stats.status = 'nok'
        syncStats(true)
        res.status(403).json({message: `The hostname cannot be set`, error: "hostname_not_settable"})
      })
    } else {
      stats.status = 'nok'
      syncStats(true)
      res.status(403).json({message: `The hostname '${data.hostname}' is not valid`, error: "hostname_not_valid"})
    }
  });
}

function syncStats(update){
  if(!settingsPath){
    return
  }
  var statsFromFile
  try {
    statsFromFile = JSON.parse(fs.readFileSync(settingsPath))
    if(update === true){
      stats = Object.assign({}, statsFromFile, stats)
    } else {
      stats = Object.assign({}, stats, statsFromFile)
    }
  } catch(e){
    try {
      fs.writeFileSync(settingsPath, JSON.stringify(stats, null, 4), { encoding: 'utf8'})
    } catch(e){}
  }
  if(stats.initialized === false || update === true){
    stats.initialized = true
    try {
      fs.writeFileSync(settingsPath, JSON.stringify(stats, null, 4), { encoding: 'utf8'})
    } catch(e){}
  }
}

function getStats(){
  return stats
}

module.exports = {
  init: init,
  getStats: getStats,
  syncStats: syncStats,
  order: 20,
  canIgnore: true
}
