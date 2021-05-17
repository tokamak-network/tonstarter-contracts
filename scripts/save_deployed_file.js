const fs = require("fs");
/*
module.exports = function (network, deployed) {
  if (!fs.existsSync(`../deployed.${network}.json`)) {
    fs.writeFileSync(
      `../deployed.${network}.json`,
      "{}",
      { flag: "w" },
      function (err) {
        if (err) throw err;
      }
    );
  }

  fs.writeFileSync(
    `deployed.${network}.json`,
    JSON.stringify(deployed, null, 2)
  );
};
*/

module.exports = function (network, deployed) {
  if (!fs.existsSync(`deployed.${network}.json`)) {
    fs.writeFileSync(`deployed.${network}.json`, '{}', { flag: 'w' }, function (err) {
      if (err) throw err;
    });
  }

  let data = JSON.parse(fs.readFileSync(`deployed.${network}.json`).toString());
  data[deployed.name] = deployed.address;

  fs.writeFileSync(`deployed.${network}.json`, JSON.stringify(data, null, 2))
}
