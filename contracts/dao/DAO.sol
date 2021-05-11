pragma solidity ^0.7.6;

import "../interfaces/ISFLD.sol";

contract DAO {
  uint256 public VOTING_DEADLINE_PERIOD = 2 weeks;

  uint256 public agendaIDCounter;
  mapping(uint => Agenda) public agendas;
  ISFLD sfld;


  constructor (address _sfldAddress) {
    agendaIDCounter = 1;
    sfld = ISFLD(_sfldAddress);

  }

  struct Agenda {
    // Check
    bool exists;

    // Agenda info
    uint256 votingDeadline;
    bool open;
    bytes32 agendaHash;

    // Receipient info
    address payable recipient;
    uint256 amount;
    
    // Votes info
    uint256 yesVotes;
    uint256 noVotes;
  }

  /// @dev Create new agenda
  function newAgenda(
    address payable _recipient,
    uint256 _amount,
    bytes memory _transactionData
  ) external returns (uint256 _agendaID) {
    Agenda storage agenda = agendas[agendaIDCounter];

    _agendaID = agendaIDCounter ++;
    agenda.exists = true;

    agenda.votingDeadline = block.timestamp + VOTING_DEADLINE_PERIOD;
    agenda.open = true;

    agenda.recipient = _recipient;
    agenda.amount = _amount;
    agenda.agendaHash = keccak256(abi.encodePacked(_recipient, _amount, _transactionData));

    agenda.yesVotes = 0;
    agenda.noVotes = 0;
  }

  /// @dev Votes for agenda
  function vote(uint _agendaID, bool _yes) external {
    Agenda storage agenda = agendas[_agendaID];
    require(agenda.exists == true, "No such an agenda");
    require(block.timestamp <= agenda.votingDeadline, "Voting deadline has passed");
    require(agenda.open == true, "Agenda is not open");
    
    if (_yes) {
      agenda.yesVotes += 1;
    } else {
      agenda.noVotes += 1;
    }
  }

  /// @dev Executes agenda
  function executeAgenda(
      uint _agendaID,
      bytes memory _transactionData
  ) external returns (bool _success) {
    Agenda storage agenda = agendas[_agendaID];
    require(agenda.exists == true, "No such an agenda");
    require(agenda.votingDeadline < block.timestamp, "Voting deadline has not yet passed");
    require(agenda.open == true, "Agenda is not open");
    require(
      agenda.agendaHash == keccak256(abi.encodePacked(agenda.recipient, agenda.amount, _transactionData)),
      "Given transactionData is not valid"
    );

    if (agenda.yesVotes > agenda.noVotes) {  
      (bool success, ) = agenda.recipient.call{value: agenda.amount}(_transactionData);
      require(success, "Cannot call");
    }

    agenda.open = false;
    _success = true;
  }
}
