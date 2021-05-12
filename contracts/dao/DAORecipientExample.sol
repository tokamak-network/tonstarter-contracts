pragma solidity^0.7.6;
import "hardhat/console.sol";

contract DAORecipientExample {
  address public DAOAddress;
  uint256 fib0 = 0;
  uint256 fib1 = 1;

  constructor (address _DAOAddress) {
    DAOAddress = _DAOAddress;
  }

  modifier onlyDAO {
    require(msg.sender == DAOAddress, "Only DAO can execute this function");
    _;
  }

  function generateNextFib() onlyDAO external {
    fib1 += fib0;
    fib0 = fib1 - fib0;
  }

  function getFib() view external returns (uint256) {
    return fib1;
  }

  fallback () external {
    console.log("RECEIVED");
  }
}
