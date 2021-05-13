// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
import "../libraries/LibDAO.sol";
import "../interfaces/ISFLD.sol";

contract DAOProxyStorage {
    uint256 public VOTING_DEADLINE_PERIOD = 2 weeks;
    uint256 public agendaIDCounter;
    mapping(uint256 => LibDAO.Agenda) public agendas;
    ISFLD sfld;
}
