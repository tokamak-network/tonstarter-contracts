const fs = require("fs");

module.exports = function (network, _name, params) {
  //console.log('save ', network, deployed);

  if (!fs.existsSync(`${_name}.params.${network}.json`)) {
    fs.writeFileSync(`${_name}.params.${network}.json`, '{}', { flag: 'w' }, function (err) {
      if (err) throw err;
    });
  }

  let data = JSON.parse(fs.readFileSync(`${_name}.params.${network}.json`).toString());
  for(let i=0; i< params.length ; i++){
    data[i] = params[i];
  }

  //console.log('data[deployed.name]', deployed.name, data[deployed.name]);

  fs.writeFileSync(`${_name}.params.${network}.json`, JSON.stringify(data, null, 2))
}
