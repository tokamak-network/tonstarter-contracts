# Functions:

- [`newAgenda(address payable _recipient, bytes _transactionData)`](#DAO-newAgenda-address-payable-bytes-)

- [`vote(uint256 _agendaID, bool _yes)`](#DAO-vote-uint256-bool-)

- [`executeAgenda(uint256 _agendaID, bytes _transactionData)`](#DAO-executeAgenda-uint256-bytes-)

- [`getAgenda(uint256 agendaID)`](#DAO-getAgenda-uint256-)

## Function `newAgenda(address payable _recipient, bytes _transactionData) → uint256 _agendaID` {#DAO-newAgenda-address-payable-bytes-}

Create new agenda

## Function `vote(uint256 _agendaID, bool _yes)` {#DAO-vote-uint256-bool-}

Votes for agenda

## Function `executeAgenda(uint256 _agendaID, bytes _transactionData) → bool _success` {#DAO-executeAgenda-uint256-bytes-}

Executes agenda

## Function `getAgenda(uint256 agendaID) → address, uint256, bytes32, bool, bool, uint256, uint256` {#DAO-getAgenda-uint256-}

Get agenda info
