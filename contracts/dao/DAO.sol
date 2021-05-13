// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.7.6;

import "../interfaces/ISFLD.sol";
import "./DAOProxyStorage.sol";
import "../libraries/LibDAO.sol";

import "hardhat/console.sol";

contract DAO is DAOProxyStorage {
    /// @dev Create new agenda
    function newAgenda(
        address payable _recipient,
        bytes memory _transactionData
    ) external returns (uint256 _agendaID) {
        LibDAO.Agenda storage agenda = agendas[agendaIDCounter];

        _agendaID = agendaIDCounter++;
        agenda.exists = true;

        agenda.votingDeadline = block.timestamp + VOTING_DEADLINE_PERIOD;
        agenda.open = true;

        agenda.recipient = _recipient;
        agenda.agendaHash = keccak256(
            abi.encodePacked(_recipient, _transactionData)
        );
        agenda.passed = false;

        agenda.yesVotesCount = 0;
        agenda.noVotesCount = 0;
    }

    /// @dev Votes for agenda
    function vote(uint256 _agendaID, bool _yes) external {
        LibDAO.Agenda storage agenda = agendas[_agendaID];
        require(agenda.exists == true, "No such an agenda");
        require(
            block.timestamp <= agenda.votingDeadline,
            "Voting deadline has passed"
        );
        require(agenda.open == true, "Agenda is not open");

        // Clear previous vote if any
        if (agenda.yesVotes[msg.sender]) {
            agenda.yesVotesCount -= 1;
            agenda.yesVotes[msg.sender] = false;
        } else if (agenda.noVotes[msg.sender]) {
            agenda.noVotesCount -= 1;
            agenda.noVotes[msg.sender] = false;
        }

        // Add vote
        if (_yes) {
            agenda.yesVotesCount += 1;
            agenda.yesVotes[msg.sender] = true;
        } else {
            agenda.noVotesCount += 1;
            agenda.noVotes[msg.sender] = true;
        }
    }

    /// @dev Executes agenda
    function executeAgenda(uint256 _agendaID, bytes memory _transactionData)
        external
        returns (bool _success)
    {
        LibDAO.Agenda storage agenda = agendas[_agendaID];
        require(agenda.exists == true, "No such an agenda");
        require(
            agenda.votingDeadline < block.timestamp,
            "Voting deadline has not yet passed"
        );
        require(agenda.open == true, "Agenda is not open");
        require(
            agenda.agendaHash ==
                keccak256(abi.encodePacked(agenda.recipient, _transactionData)),
            "Given transactionData is not valid"
        );

        if (agenda.yesVotesCount > agenda.noVotesCount) {
            (bool success, ) = agenda.recipient.call(_transactionData);
            require(success, "Cannot execute function");
            // emit show(res);
            agenda.passed = true;
        }

        agenda.open = false;
        _success = true;
    }

    /// @dev Get agenda info
    function getAgenda(uint256 agendaID)
        external
        view
        returns (
            address,
            uint256,
            bytes32,
            bool,
            bool,
            uint256,
            uint256
        )
    {
        LibDAO.Agenda storage agenda = agendas[agendaID];
        require(agenda.exists == true, "No such an agenda");

        return (
            agenda.recipient,
            agenda.votingDeadline,
            agenda.agendaHash,
            agenda.passed,
            agenda.open,
            agenda.yesVotesCount,
            agenda.noVotesCount
        );
    }
}
