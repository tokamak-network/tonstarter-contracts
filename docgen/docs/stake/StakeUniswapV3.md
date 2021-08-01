# Functions:

- [`constructor()`](#StakeUniswapV3-constructor--)

- [`receive()`](#StakeUniswapV3-receive--)

- [`setMiningIntervalSeconds(uint256 _intervalSeconds)`](#StakeUniswapV3-setMiningIntervalSeconds-uint256-)

- [`resetCoinageTime()`](#StakeUniswapV3-resetCoinageTime--)

- [`setSaleStartTime(uint256 _saleStartTime)`](#StakeUniswapV3-setSaleStartTime-uint256-)

- [`miningCoinage()`](#StakeUniswapV3-miningCoinage--)

- [`getMiningTokenId(uint256 tokenId)`](#StakeUniswapV3-getMiningTokenId-uint256-)

- [`setPoolAddress(uint256 tokenId)`](#StakeUniswapV3-setPoolAddress-uint256-)

- [`stakePermit(uint256 tokenId, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`](#StakeUniswapV3-stakePermit-uint256-uint256-uint8-bytes32-bytes32-)

- [`stake(uint256 tokenId)`](#StakeUniswapV3-stake-uint256-)

- [`claim(uint256 tokenId)`](#StakeUniswapV3-claim-uint256-)

- [`withdraw(uint256 tokenId)`](#StakeUniswapV3-withdraw-uint256-)

- [`getUserStakedTokenIds(address user)`](#StakeUniswapV3-getUserStakedTokenIds-address-)

- [`getDepositToken(uint256 tokenId)`](#StakeUniswapV3-getDepositToken-uint256-)

- [`getUserStakedTotal(address user)`](#StakeUniswapV3-getUserStakedTotal-address-)

- [`totalSupplyCoinage()`](#StakeUniswapV3-totalSupplyCoinage--)

- [`balanceOfCoinage(uint256 tokenId)`](#StakeUniswapV3-balanceOfCoinage-uint256-)

- [`infos()`](#StakeUniswapV3-infos--)

- [`canMiningAmountTokenId(uint256 tokenId)`](#StakeUniswapV3-canMiningAmountTokenId-uint256-)

- [`poolInfos()`](#StakeUniswapV3-poolInfos--)

- [`poolPositions(bytes32 key)`](#StakeUniswapV3-poolPositions-bytes32-)

- [`poolSlot0()`](#StakeUniswapV3-poolSlot0--)

- [`npmPositions(uint256 _tokenId)`](#StakeUniswapV3-npmPositions-uint256-)

- [`snapshotCumulativesInside(int24 tickLower, int24 tickUpper)`](#StakeUniswapV3-snapshotCumulativesInside-int24-int24-)

# Events:

- [`Staked(address to, address poolAddress, uint256 tokenId, uint256 amount)`](#StakeUniswapV3-Staked-address-address-uint256-uint256-)

- [`Claimed(address to, address poolAddress, uint256 tokenId, uint256 miningAmount, uint256 nonMiningAmount)`](#StakeUniswapV3-Claimed-address-address-uint256-uint256-uint256-)

- [`WithdrawalToken(address to, uint256 tokenId, uint256 miningAmount, uint256 nonMiningAmount)`](#StakeUniswapV3-WithdrawalToken-address-uint256-uint256-uint256-)

- [`MinedCoinage(uint256 curTime, uint256 miningInterval, uint256 miningAmount, uint256 prevTotalSupply, uint256 afterTotalSupply, uint256 factor)`](#StakeUniswapV3-MinedCoinage-uint256-uint256-uint256-uint256-uint256-uint256-)

- [`BurnedCoinage(uint256 curTime, uint256 tokenId, uint256 burningAmount, uint256 prevTotalSupply, uint256 afterTotalSupply)`](#StakeUniswapV3-BurnedCoinage-uint256-uint256-uint256-uint256-uint256-)

###### StakeUniswapV3-constructor--

## Function `constructor()`

constructor of StakeCoinage

###### StakeUniswapV3-receive--

## Function `receive()`

receive ether - revert

###### StakeUniswapV3-setMiningIntervalSeconds-uint256-

## Function `setMiningIntervalSeconds(uint256 _intervalSeconds)`

Mining interval setting (seconds)

### Parameters:

- `_intervalSeconds`: the mining interval (sec)

###### StakeUniswapV3-resetCoinageTime--

## Function `resetCoinageTime()`

reset coinage's last mining time variable for tes

###### StakeUniswapV3-setSaleStartTime-uint256-

## Function `setSaleStartTime(uint256 _saleStartTime)`

set sale start time

### Parameters:

- `_saleStartTime`: sale start time

###### StakeUniswapV3-miningCoinage--

## Function `miningCoinage()`

mining on coinage, Mining conditions :  the sale start time must pass,

the stake start time must pass, the vault mining start time (sale start time) passes,

the mining interval passes, and the current total amount is not zero,

###### StakeUniswapV3-getMiningTokenId-uint256-

## Function `getMiningTokenId(uint256 tokenId)`

view mining information of tokenId

### Parameters:

- `tokenId`:  tokenId

###### StakeUniswapV3-setPoolAddress-uint256-

## Function `setPoolAddress(uint256 tokenId)`

With the given tokenId, information is retrieved from nonfungiblePositionManager,

     and the pool address is calculated and set.

### Parameters:

- `tokenId`:  tokenId

###### StakeUniswapV3-stakePermit-uint256-uint256-uint8-bytes32-bytes32-

## Function `stakePermit(uint256 tokenId, uint256 deadline, uint8 v, bytes32 r, bytes32 s)`

stake tokenId of UniswapV3

### Parameters:

- `tokenId`:  tokenId

- `deadline`: the deadline that valid the owner's signature

- `v`: the owner's signature - v

- `r`: the owner's signature - r

- `s`: the owner's signature - s

###### StakeUniswapV3-stake-uint256-

## Function `stake(uint256 tokenId)`

stake tokenId of UniswapV3

### Parameters:

- `tokenId`:  tokenId

###### StakeUniswapV3-claim-uint256-

## Function `claim(uint256 tokenId)`

No description

### Parameters:

- `tokenId`:  tokenId

    function claim(uint256 tokenId) external override {

        LibUniswapV3Stake.StakeLiquidity

###### StakeUniswapV3-withdraw-uint256-

## Function `withdraw(uint256 tokenId)`

No description

### Parameters:

- `tokenId`:  tokenId

    function withdraw(uint256 tokenId) external override {

        LibUniswapV3Stake.StakeLiquidi

###### StakeUniswapV3-getUserStakedTokenIds-address-

## Function `getUserStakedTokenIds(address user)`

No description

###### StakeUniswapV3-getDepositToken-uint256-

## Function `getDepositToken(uint256 tokenId)`

No description

### Return Values:

- tick tick,

- liquidity liquidity,

- args liquidity,  startTime, claimedTime, startBlock, claimedBlock, claimedAmount

- secondsPL secondsPerLiquidityInsideInitialX128, secondsPerLiquidityInsideX128Las

    function getDepositToken(uint256 tokenId)

        external

        view

        override

###### StakeUniswapV3-getUserStakedTotal-address-

## Function `getUserStakedTotal(address user)`

No description

### Return Values:

- totalMiningAmount total mining amount ,

- totalNonMiningAmount total non-mining amount,

    function getUserStakedTotal(address user)

        external

        view

        override

###### StakeUniswapV3-totalSupplyCoinage--

## Function `totalSupplyCoinage()`

No description

###### StakeUniswapV3-balanceOfCoinage-uint256-

## Function `balanceOfCoinage(uint256 tokenId)`

No description

###### StakeUniswapV3-infos--

## Function `infos()`

No description

### Return Values:

- return2  [poolToken0, poolToken1, nonfungiblePositionManager, uniswapV3FactoryAddress]

- return3  [totalStakers, totalStakedAmount, miningAmountTotal,nonMiningAmountTotal]

    function infos()

        external

        view

        override

        returns (

###### StakeUniswapV3-canMiningAmountTokenId-uint256-

## Function `canMiningAmountTokenId(uint256 tokenId)`

No description

### Return Values:

- minableAmountRay  minable amount of tokenId with ray unit

    function canMiningAmountTokenId(uint256 tokenId)

        external

        view

        return

###### StakeUniswapV3-poolInfos--

## Function `poolInfos()`

No description

### Return Values:

- token1  token1 address

- fee  fee

- tickSpacing  tickSpacing

- maxLiquidityPerTick  maxLiquidityPerTick

- liquidity  pool's liquidity

    function poolInfos()

        external

        view

        nonZeroAddress(poolAddress)

###### StakeUniswapV3-poolPositions-bytes32-

## Function `poolPositions(bytes32 key)`

No description

### Return Values:

- feeGrowthInside0LastX128  key's feeGrowthInside0LastX128

- feeGrowthInside1LastX128  key's feeGrowthInside1LastX128

- tokensOwed0  key's tokensOwed0

- tokensOwed1  key's tokensOwed1

    function poolPositions(bytes32 key)

        external

        view

        nonZeroAddress(pool

###### StakeUniswapV3-poolSlot0--

## Function `poolSlot0()`

No description

### Return Values:

- tick  The current tick of the pool

- observationIndex  The index of the last oracle observation that was written,

- observationCardinality  The current maximum number of observations stored in the pool,

- observationCardinalityNext  The next maximum number of observations, to be updated when the observation.

- feeProtocol  The protocol fee for both tokens of the pool

- unlocked  Whether the pool is currently locked to reentrancy

    function poolSlot0()

        external

        view

        nonZeroAddress(poolAddress)

###### StakeUniswapV3-npmPositions-uint256-

## Function `npmPositions(uint256 _tokenId)`

No description

### Return Values:

- operator  the address that is approved for spending this token

- token0  The address of the token0 for pool

- token1  The address of the token1 for pool

- fee  The fee associated with the pool

- tickLower  The lower end of the tick range for the position

- tickUpper  The higher end of the tick range for the position

- liquidity  The liquidity of the position

- feeGrowthInside0LastX128  The fee growth of token0 as of the last action on the individual position

- feeGrowthInside1LastX128  The fee growth of token1 as of the last action on the individual position

- tokensOwed0  The uncollected amount of token0 owed to the position as of the last computation

- tokensOwed1  The uncollected amount of token1 owed to the position as of the last computation

    function npmPositions(uint256 _tokenId)

        external

        view

        nonZeroAddress(

###### StakeUniswapV3-snapshotCumulativesInside-int24-int24-

## Function `snapshotCumulativesInside(int24 tickLower, int24 tickUpper)`

No description

### Return Values:

- tickCumulativeInside  The snapshot of the tick accumulator for the range

- secondsPerLiquidityInsideX128  The snapshot of seconds per liquidity for the range

- secondsInside  The snapshot of seconds per liquidity for the range

- curTimestamps  current Timestamps

    function snapshotCumulativesInside(int24 tickLower, int24 tickUpper)

        external

###### StakeUniswapV3-Staked-address-address-uint256-uint256-

## Event `Staked(address to, address poolAddress, uint256 tokenId, uint256 amount)`

event on staking

### Parameters:

- `to`: the sender

- `poolAddress`: the pool address of uniswapV3

- `tokenId`: the uniswapV3 Lp token

- `amount`: the amount of staking

###### StakeUniswapV3-Claimed-address-address-uint256-uint256-uint256-

## Event `Claimed(address to, address poolAddress, uint256 tokenId, uint256 miningAmount, uint256 nonMiningAmount)`

event on claim

### Parameters:

- `to`: the sender

- `poolAddress`: the pool address of uniswapV3

- `tokenId`: the uniswapV3 Lp token

- `miningAmount`: the amount of mining

- `nonMiningAmount`: the amount of non-mining

###### StakeUniswapV3-WithdrawalToken-address-uint256-uint256-uint256-

## Event `WithdrawalToken(address to, uint256 tokenId, uint256 miningAmount, uint256 nonMiningAmount)`

event on withdrawal

### Parameters:

- `to`: the sender

- `tokenId`: the uniswapV3 Lp token

- `miningAmount`: the amount of mining

- `nonMiningAmount`: the amount of non-mining

###### StakeUniswapV3-MinedCoinage-uint256-uint256-uint256-uint256-uint256-uint256-

## Event `MinedCoinage(uint256 curTime, uint256 miningInterval, uint256 miningAmount, uint256 prevTotalSupply, uint256 afterTotalSupply, uint256 factor)`

event on mining in coinage

### Parameters:

- `curTime`: the current time

- `miningInterval`: mining period (sec)

- `miningAmount`: the mining amount

- `prevTotalSupply`: Total amount of coinage before mining

- `afterTotalSupply`: Total amount of coinage after being mined

- `factor`: coinage's Factor

###### StakeUniswapV3-BurnedCoinage-uint256-uint256-uint256-uint256-uint256-

## Event `BurnedCoinage(uint256 curTime, uint256 tokenId, uint256 burningAmount, uint256 prevTotalSupply, uint256 afterTotalSupply)`

event on burning in coinage

### Parameters:

- `curTime`: the current time

- `tokenId`: the token id

- `burningAmount`: the buring amount

- `prevTotalSupply`: Total amount of coinage before mining

- `afterTotalSupply`: Total amount of coinage after being mined
