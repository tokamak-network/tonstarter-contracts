# Functions:

- [`constructor()`](#StakeUniswapV3-constructor--)

- [`receive()`](#StakeUniswapV3-receive--)

- [`stake(uint256 tokenId, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`](#StakeUniswapV3-stake-uint256-uint256-uint8-bytes32-bytes32-)

- [`getClaimLiquidity(uint256 tokenId)`](#StakeUniswapV3-getClaimLiquidity-uint256-)

- [`claim(uint256 tokenId)`](#StakeUniswapV3-claim-uint256-)

- [`withdraw(uint256 tokenId)`](#StakeUniswapV3-withdraw-uint256-)

- [`getUserStakedTokenIds(address user)`](#StakeUniswapV3-getUserStakedTokenIds-address-)

- [`getDepositToken(uint256 tokenId)`](#StakeUniswapV3-getDepositToken-uint256-)

- [`getUserStakedTotal(address user)`](#StakeUniswapV3-getUserStakedTotal-address-)

- [`infos()`](#StakeUniswapV3-infos--)

# Events:

- [`Staked(address to, uint256 amount)`](#StakeUniswapV3-Staked-address-uint256-)

- [`Claimed(address to, uint256 amount, uint256 claimBlock)`](#StakeUniswapV3-Claimed-address-uint256-uint256-)

- [`WithdrawalToken(address to, uint256 tokenId)`](#StakeUniswapV3-WithdrawalToken-address-uint256-)

###### StakeUniswapV3-constructor--

## Function `constructor()`

constructor of StakeCoinage

###### StakeUniswapV3-receive--

## Function `receive()`

receive ether - revert

###### StakeUniswapV3-stake-uint256-uint256-uint8-bytes32-bytes32-

## Function `stake(uint256 tokenId, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`

No description

###### StakeUniswapV3-getClaimLiquidity-uint256-

## Function `getClaimLiquidity(uint256 tokenId)`

No description

###### StakeUniswapV3-claim-uint256-

## Function `claim(uint256 tokenId)`

No description

###### StakeUniswapV3-withdraw-uint256-

## Function `withdraw(uint256 tokenId)`

No description

###### StakeUniswapV3-getUserStakedTokenIds-address-

## Function `getUserStakedTokenIds(address user)`

No description

###### StakeUniswapV3-getDepositToken-uint256-

## Function `getDepositToken(uint256 tokenId)`

No description

### Return Values:

- liquidity liquidity,

- args liquidity,  startTime, endTime, claimedTime, startBlock, claimedBlock, claimedAmount

- secondsPL secondsPerLiquidityInsideInitialX128, secondsPerLiquidityInsideX128Las

    function getDepositToken(uint256 tokenId)

        external

        view

        override

        returns (

            address poolAddress,

###### StakeUniswapV3-getUserStakedTotal-address-

## Function `getUserStakedTotal(address user)`

No description

###### StakeUniswapV3-infos--

## Function `infos()`

No description

### Return Values:

- return3  [totalStakers, totalStakedAmount, rewardClaimedTotal,rewardNonLiquidityClaimTotal]

    function infos()

        external

        view

        override

        returns (

            address[4] memory,

            address[4] memor

###### StakeUniswapV3-Staked-address-uint256-

## Event `Staked(address to, uint256 amount)`

event on staking

### Parameters:

- `to`: the sender

- `amount`: the amount of staking

###### StakeUniswapV3-Claimed-address-uint256-uint256-

## Event `Claimed(address to, uint256 amount, uint256 claimBlock)`

event on claim

### Parameters:

- `to`: the sender

- `amount`: the amount of claim

- `claimBlock`: the block of claim

###### StakeUniswapV3-WithdrawalToken-address-uint256-

## Event `WithdrawalToken(address to, uint256 tokenId)`

event on withdrawal

### Parameters:

- `to`: the sender

- `tokenId`: the uniswapV3 Lp token
