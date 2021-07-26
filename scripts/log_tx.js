
require('dotenv').config()
const gasUsedFunctions = require("./save_gasUsedFunctions");

function printGasUsedOfUnits( _fun, _tx){

  if( _tx != null && (
      (_tx.deployTransaction != null && _tx.deployTransaction.hash!=null)
      || _tx.hash !=null )
    ) {
    let name =  _fun;
    let hash = _tx.hash;

    if(_tx.deployTransaction != null && _tx.deployTransaction.hash!=null) hash = _tx.deployTransaction.hash;


    let data = {name:name,tx:hash};

    // deployed_functions.push(_fun);
    // deployed_gasUsed.push(_tx.gasUsed);
    console.log(data);

    gasUsedFunctions(process.env.NETWORK, data);
  }
}

module.exports = {printGasUsedOfUnits}

