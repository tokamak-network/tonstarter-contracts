const fs = require('fs')

module.exports = function (network, name) {
  let data = JSON.parse(fs.readFileSync(`deployed.${network}.input.json`).toString());

  return data[name];
}
