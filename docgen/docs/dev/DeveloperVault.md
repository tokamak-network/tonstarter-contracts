# Functions:

- [`constructor(address admin)`](#DeveloperVault-constructor-address-)

- [`initialize(address _tos, uint256 _cap, uint256 _rewardPeriod, uint256 _startRewardBlock, uint256 _claimsNumberMax, address[] _developers, uint256[] _claimAmounts)`](#DeveloperVault-initialize-address-uint256-uint256-uint256-uint256-address---uint256---)

- [`claimReward()`](#DeveloperVault-claimReward--)

- [`currentRewardBlock()`](#DeveloperVault-currentRewardBlock--)

###### DeveloperVault-constructor-address-

## Function `constructor(address admin)`

constructor of DeveloperVault

### Parameters:

- `admin`: the admin address

###### DeveloperVault-initialize-address-uint256-uint256-uint256-uint256-address---uint256---

## Function `initialize(address _tos, uint256 _cap, uint256 _rewardPeriod, uint256 _startRewardBlock, uint256 _claimsNumberMax, address[] _developers, uint256[] _claimAmounts)`

set initial storage

### Parameters:

- `_tos`: the TOS address

- `_cap`: the allocated TOS amount to devs

- `_rewardPeriod`: given only once per _rewardPeriod.

- `_startRewardBlock`: the start block to give .

- `_claimsNumberMax`: Total number of payments

- `_developers`: the developer list

- `_claimAmounts`: How much do you pay at one time?

###### DeveloperVault-claimReward--

## Function `claimReward()`

Developers can receive their TOSs

###### DeveloperVault-currentRewardBlock--

## Function `currentRewardBlock()`

Returns current reward block for sender
