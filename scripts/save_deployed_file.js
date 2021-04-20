const fs = require('fs')

module.exports = function (network, deployed) {
  if (!fs.existsSync(`../deployed.${network}.json`)) {
    fs.writeFileSync(`../deployed.${network}.json`, '{}', { flag: 'w' }, function (err) {
      if (err) throw err;
    });
  }

  fs.writeFileSync(`deployed.${network}.json`, JSON.stringify(deployed, null, 2))

}
