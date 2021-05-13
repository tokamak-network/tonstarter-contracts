//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

library LibDAO {
    struct Agenda {
        // Check
        bool exists;
        // Agenda info
        uint256 votingDeadline;
        bool open;
        bytes32 agendaHash;
        bool passed;
        // Receipient info
        address payable recipient;
        // Votes info
        uint256 yesVotesCount;
        uint256 noVotesCount;
        mapping(address => bool) yesVotes;
        mapping(address => bool) noVotes;
    }
}
