# Functions:

- [`stake(uint256 tokenId, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`](#IStakeUniswapV3-stake-uint256-uint256-uint8-bytes32-bytes32-)

- [`getClaimLiquidity(uint256 tokenId)`](#IStakeUniswapV3-getClaimLiquidity-uint256-)

- [`withdraw(uint256 tokenId)`](#IStakeUniswapV3-withdraw-uint256-)

- [`claim(uint256 tokenId)`](#IStakeUniswapV3-claim-uint256-)

- [`getUserStakedTokenIds(address user)`](#IStakeUniswapV3-getUserStakedTokenIds-address-)

- [`getDepositToken(uint256 tokenId)`](#IStakeUniswapV3-getDepositToken-uint256-)

- [`getUserStakedTotal(address user)`](#IStakeUniswapV3-getUserStakedTotal-address-)

- [`infos()`](#IStakeUniswapV3-infos--)

###### IStakeUniswapV3-stake-uint256-uint256-uint8-bytes32-bytes32-

## Function `stake(uint256 tokenId, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`

Stake amount

### Parameters:

- `tokenId`:  uniswapV3 LP Token

- `deadline`:  the deadline that valid the owner's signature

- `v`: the owner's signature - v

- `r`: the owner's signature - r

- `s`: the owner's signature - s

###### IStakeUniswapV3-getClaimLiquidity-uint256-

## Function `getClaimLiquidity(uint256 tokenId)`

No description

###### IStakeUniswapV3-withdraw-uint256-

## Function `withdraw(uint256 tokenId)`

withdraw

###### IStakeUniswapV3-claim-uint256-

## Function `claim(uint256 tokenId)`

Claim for reward

###### IStakeUniswapV3-getUserStakedTokenIds-address-

## Function `getUserStakedTokenIds(address user)`

No description

###### IStakeUniswapV3-getDepositToken-uint256-

## Function `getDepositToken(uint256 tokenId)`

tokenId's deposited information

### Parameters:

- `tokenId`:   tokenId

### Return Values:

- poolAddress   poolAddress

- tick tick,

- liquidity liquidity,

- args liquidity,  startTime, endTime, claimedTime, startBlock, claimedBlock, claimedAmount

- secondsPL secondsPerLiquidityInsideInitialX128, secondsPerLiquidityInsideX128Las

###### IStakeUniswapV3-getUserStakedTotal-address-

## Function `getUserStakedTotal(address user)`

No description

###### IStakeUniswapV3-infos--

## Function `infos()`

Give the infomation of this stakeContracts

### Return Values:

- return1  [token, vault, stakeRegistry, coinage]

- return2  [poolToken0, poolToken1, nonfungiblePositionManager, uniswapV3FactoryAddress]

- return3  [totalStakers, totalStakedAmount, rewardClaimedTotal,rewardNonLiquidityClaimTotal]
