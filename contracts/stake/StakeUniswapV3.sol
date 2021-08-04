// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import "@uniswap/v3-periphery/contracts/interfaces/INonfungiblePositionManager.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/libraries/PoolAddress.sol";

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../interfaces/IStakeRegistry.sol";
import "../interfaces/IStakeUniswapV3.sol";
import "../interfaces/IAutoRefactorCoinageWithTokenId.sol";
import "../interfaces/IIStake2Vault.sol";
import "../libraries/LibTokenStake1.sol";
import {DSMath} from "../libraries/DSMath.sol";
import "../common/AccessibleCommon.sol";
import "../stake/StakeUniswapV3Storage.sol";

/// @title StakeUniswapV3
/// @notice Uniswap V3 Contract for staking LP and mining TOS
contract StakeUniswapV3 is
    StakeUniswapV3Storage,
    AccessibleCommon,
    IStakeUniswapV3,
    DSMath
{
    struct PositionInfo {
        // the amount of liquidity owned by this position
        uint128 liquidity;
        // fee growth per unit of liquidity as of the last update to liquidity or fees owed
        uint256 feeGrowthInside0LastX128;
        uint256 feeGrowthInside1LastX128;
        // the fees owed to the position owner in token0/token1
        uint128 tokensOwed0;
        uint128 tokensOwed1;
    }

    struct Slot0 {
        // the current price
        uint160 sqrtPriceX96;
        // the current tick
        int24 tick;
        // the most-recently updated index of the observations array
        uint16 observationIndex;
        // the current maximum number of observations that are being stored
        uint16 observationCardinality;
        // the next maximum number of observations to store, triggered in observations.write
        uint16 observationCardinalityNext;
        // the current protocol fee as a percentage of the swap fee taken on withdrawal
        // represented as an integer denominator (1/x)%
        uint8 feeProtocol;
        // whether the pool is locked
        bool unlocked;
    }

    modifier lock() {
        require(_lock == 0, "StakeUniswapV3: LOCKED");
        _lock = 1;
        _;
        _lock = 0;
    }

    /// @dev event on staking
    /// @param to the sender
    /// @param poolAddress the pool address of uniswapV3
    /// @param tokenId the uniswapV3 Lp token
    /// @param amount the amount of staking
    event Staked(
        address indexed to,
        address indexed poolAddress,
        uint256 tokenId,
        uint256 amount
    );

    /// @dev event on claim
    /// @param to the sender
    /// @param poolAddress the pool address of uniswapV3
    /// @param tokenId the uniswapV3 Lp token
    /// @param miningAmount the amount of mining
    /// @param nonMiningAmount the amount of non-mining
    event Claimed(
        address indexed to,
        address poolAddress,
        uint256 tokenId,
        uint256 miningAmount,
        uint256 nonMiningAmount
    );

    /// @dev event on withdrawal
    /// @param to the sender
    /// @param tokenId the uniswapV3 Lp token
    /// @param miningAmount the amount of mining
    /// @param nonMiningAmount the amount of non-mining
    event WithdrawalToken(
        address indexed to,
        uint256 tokenId,
        uint256 miningAmount,
        uint256 nonMiningAmount
    );

    /// @dev event on mining in coinage
    /// @param curTime the current time
    /// @param miningInterval mining period (sec)
    /// @param miningAmount the mining amount
    /// @param prevTotalSupply Total amount of coinage before mining
    /// @param afterTotalSupply Total amount of coinage after being mined
    /// @param factor coinage's Factor
    event MinedCoinage(
        uint256 curTime,
        uint256 miningInterval,
        uint256 miningAmount,
        uint256 prevTotalSupply,
        uint256 afterTotalSupply,
        uint256 factor
    );

    /// @dev event on burning in coinage
    /// @param curTime the current time
    /// @param tokenId the token id
    /// @param burningAmount the buring amount
    /// @param prevTotalSupply Total amount of coinage before mining
    /// @param afterTotalSupply Total amount of coinage after being mined
    event BurnedCoinage(
        uint256 curTime,
        uint256 tokenId,
        uint256 burningAmount,
        uint256 prevTotalSupply,
        uint256 afterTotalSupply
    );

    /// @dev constructor of StakeCoinage
    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);

        miningIntervalSeconds = 13;
    }

    /// @dev receive ether - revert
    receive() external payable {
        revert();
    }

    /// @dev Mining interval setting (seconds)
    /// @param _intervalSeconds the mining interval (sec)
    function setMiningIntervalSeconds(uint256 _intervalSeconds)
        external
        onlyOwner
    {
        miningIntervalSeconds = _intervalSeconds;
    }

    /// @dev reset coinage's last mining time variable for tes
    function resetCoinageTime() external onlyOwner {
        // saleStartTime = 0;
        // stakeStartTime = 0;
        coinageLastMintBlockTimetamp = 0;
    }

    /// @dev set sale start time
    /// @param _saleStartTime sale start time
    function setSaleStartTime(uint256 _saleStartTime) external onlyOwner {
        require(
            _saleStartTime > 0 && saleStartTime != _saleStartTime,
            "StakeUniswapV3: zero or same _saleStartTime"
        );
        saleStartTime = _saleStartTime;
    }

    /// @dev calculate the factor of coinage
    /// @param source tsource
    /// @param target target
    /// @param oldFactor oldFactor
    function _calcNewFactor(
        uint256 source,
        uint256 target,
        uint256 oldFactor
    ) internal pure returns (uint256) {
        return rdiv(rmul(target, oldFactor), source);
    }

    /// @dev delete user's token storage of index place
    /// @param _owner tokenId's owner
    /// @param tokenId tokenId
    /// @param _index owner's tokenId's index
    function deleteUserToken(
        address _owner,
        uint256 tokenId,
        uint256 _index
    ) internal {
        uint256 _tokenid = userStakedTokenIds[_owner][_index];
        require(
            _tokenid == tokenId,
            "StakeUniswapV3: deleteUserToken mismatch tokenId"
        );
        uint256 lastIndex = userStakedTokenIds[_owner].length - 1;
        if (tokenId > 0 && _tokenid == tokenId) {
            if (_index < lastIndex) {
                uint256 tokenId_lastIndex =
                    userStakedTokenIds[_owner][lastIndex];
                userStakedTokenIds[_owner][_index] = tokenId_lastIndex;
                depositTokens[tokenId_lastIndex].idIndex = _index;
            }
            userStakedTokenIds[_owner].pop();
        }
    }

    /// @dev mining on coinage, Mining conditions :  the sale start time must pass,
    /// the stake start time must pass, the vault mining start time (sale start time) passes,
    /// the mining interval passes, and the current total amount is not zero,
    function miningCoinage() public lock {
        if (saleStartTime == 0 || saleStartTime > block.timestamp) return;
        if (stakeStartTime == 0 || stakeStartTime > block.timestamp) return;
        if (
            IIStake2Vault(vault).miningStartTime() > block.timestamp ||
            IIStake2Vault(vault).miningEndTime() < block.timestamp
        ) return;

        if (coinageLastMintBlockTimetamp == 0)
            coinageLastMintBlockTimetamp = stakeStartTime;

        if (
            block.timestamp >
            (coinageLastMintBlockTimetamp + miningIntervalSeconds)
        ) {
            uint256 miningInterval =
                block.timestamp - coinageLastMintBlockTimetamp;
            uint256 miningAmount =
                miningInterval * IIStake2Vault(vault).miningPerSecond();
            uint256 prevTotalSupply =
                IAutoRefactorCoinageWithTokenId(coinage).totalSupply();

            if (miningAmount > 0 && prevTotalSupply > 0) {
                uint256 afterTotalSupply =
                    prevTotalSupply + miningAmount * (10**9);
                uint256 factor =
                    IAutoRefactorCoinageWithTokenId(coinage).setFactor(
                        _calcNewFactor(
                            prevTotalSupply,
                            afterTotalSupply,
                            IAutoRefactorCoinageWithTokenId(coinage).factor()
                        )
                    );
                coinageLastMintBlockTimetamp = block.timestamp;

                emit MinedCoinage(
                    block.timestamp,
                    miningInterval,
                    miningAmount,
                    prevTotalSupply,
                    afterTotalSupply,
                    factor
                );
            }
        }
    }

    /// @dev view mining information of tokenId
    /// @param tokenId  tokenId
    function getMiningTokenId(uint256 tokenId)
        public
        view
        override
        nonZeroAddress(poolAddress)
        returns (
            uint256 miningAmount,
            uint256 nonMiningAmount,
            uint256 minableAmount,
            uint160 secondsInside,
            uint160 secondsInsideDiff,
            uint256 liquidity,
            uint256 balanceOfTokenIdRay,
            uint256 minableAmountRay,
            uint160 secondsAbsolute160,
            uint256 secondsInsideDiff256,
            uint256 secondsAbsolute256
        )
    {
        if (
            stakeStartTime < block.timestamp && stakeStartTime < block.timestamp
        ) {
            LibUniswapV3Stake.StakeLiquidity storage _depositTokens =
                depositTokens[tokenId];
            liquidity = _depositTokens.liquidity;
            uint256 tokenId_ = tokenId;
            uint32 currentTime = uint32(block.timestamp);
            uint32 secondsAbsolute = 0;

            if (_depositTokens.liquidity > 0) {
                (, , secondsInside) = IUniswapV3Pool(poolAddress)
                    .snapshotCumulativesInside(
                    _depositTokens.tickLower,
                    _depositTokens.tickUpper
                );

                if (_depositTokens.claimedTime > 0)
                    secondsAbsolute = currentTime - _depositTokens.claimedTime;
                else secondsAbsolute = currentTime - _depositTokens.startTime;

                if (_depositTokens.secondsInsideLast > 0)
                    secondsInsideDiff =
                        secondsInside -
                        _depositTokens.secondsInsideLast;
                else
                    secondsInsideDiff =
                        secondsInside -
                        _depositTokens.secondsInsideInitial;

                balanceOfTokenIdRay = IAutoRefactorCoinageWithTokenId(coinage)
                    .balanceOf(tokenId_);
                if (balanceOfTokenIdRay > 0) {
                    if (
                        balanceOfTokenIdRay > 0 &&
                        balanceOfTokenIdRay > liquidity * (10**9)
                    ) {
                        minableAmountRay =
                            balanceOfTokenIdRay -
                            liquidity *
                            (10**9);
                        minableAmount = minableAmountRay / (10**9);
                    }
                }

                secondsAbsolute160 = uint160(secondsAbsolute);
                secondsInsideDiff256 = uint256(secondsInsideDiff);
                secondsAbsolute256 = uint256(secondsAbsolute160);

                if (
                    minableAmount > 0 &&
                    secondsAbsolute > 0 &&
                    secondsInsideDiff < secondsAbsolute160
                ) {
                    if (secondsAbsolute > 0 && secondsInsideDiff > 0)
                        miningAmount =
                            (minableAmount * secondsInsideDiff256) /
                            secondsAbsolute256;
                    nonMiningAmount = minableAmount - miningAmount;
                } else if (minableAmount > 0 && secondsAbsolute > 0) {
                    miningAmount = minableAmount;
                }
            }
        }
    }

    /// @dev With the given tokenId, information is retrieved from nonfungiblePositionManager,
    ///      and the pool address is calculated and set.
    /// @param tokenId  tokenId
    function setPoolAddress(uint256 tokenId)
        external
        nonZeroAddress(token)
        nonZeroAddress(vault)
        nonZeroAddress(stakeRegistry)
        nonZeroAddress(poolToken0)
        nonZeroAddress(poolToken1)
        nonZeroAddress(address(nonfungiblePositionManager))
        nonZeroAddress(uniswapV3FactoryAddress)
    {
        require(
            poolAddress == address(0),
            "StakeUniswapV3: already set poolAddress"
        );
        (, , address token0, address token1, uint24 fee, , , , , , , ) =
            nonfungiblePositionManager.positions(tokenId);

        require(
            (token0 == poolToken0 && token1 == poolToken1) ||
                (token0 == poolToken1 && token1 == poolToken0),
            "StakeUniswapV3: pool's tokens are different"
        );

        poolAddress = PoolAddress.computeAddress(
            uniswapV3FactoryAddress,
            PoolAddress.PoolKey({token0: token0, token1: token1, fee: fee})
        );
        poolFee = fee;
    }

    /// @dev stake tokenId of UniswapV3
    /// @param tokenId  tokenId
    /// @param deadline the deadline that valid the owner's signature
    /// @param v the owner's signature - v
    /// @param r the owner's signature - r
    /// @param s the owner's signature - s
    function stakePermit(
        uint256 tokenId,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    )
        external
        override
        nonZeroAddress(token)
        nonZeroAddress(vault)
        nonZeroAddress(stakeRegistry)
        nonZeroAddress(poolToken0)
        nonZeroAddress(poolToken1)
        nonZeroAddress(address(nonfungiblePositionManager))
        nonZeroAddress(uniswapV3FactoryAddress)
    {
        require(
            saleStartTime < block.timestamp,
            "StakeUniswapV3: available after saleStartTime"
        );

        require(
            block.timestamp < IIStake2Vault(vault).miningEndTime(),
            "StakeUniswapV3: end mining period"
        );

        require(
            nonfungiblePositionManager.ownerOf(tokenId) == msg.sender,
            "StakeUniswapV3: Caller is not tokenId's owner"
        );

        nonfungiblePositionManager.permit(
            address(this),
            tokenId,
            deadline,
            v,
            r,
            s
        );

        _stake(tokenId);
    }

    /// @dev stake tokenId of UniswapV3
    /// @param tokenId  tokenId
    function stake(uint256 tokenId)
        external
        override
        nonZeroAddress(token)
        nonZeroAddress(vault)
        nonZeroAddress(stakeRegistry)
        nonZeroAddress(poolToken0)
        nonZeroAddress(poolToken1)
        nonZeroAddress(address(nonfungiblePositionManager))
        nonZeroAddress(uniswapV3FactoryAddress)
    {
        require(
            saleStartTime < block.timestamp,
            "StakeUniswapV3: available after saleStartTime"
        );
        require(
            block.timestamp < IIStake2Vault(vault).miningEndTime(),
            "StakeUniswapV3: end mining period"
        );
        require(
            nonfungiblePositionManager.ownerOf(tokenId) == msg.sender,
            "StakeUniswapV3: Caller is not tokenId's owner"
        );

        _stake(tokenId);
    }

    /// @dev stake tokenId of UniswapV3
    /// @param tokenId  tokenId
    function _stake(uint256 tokenId) internal {
        uint256 _tokenId = tokenId;
        (
            ,
            ,
            address token0,
            address token1,
            uint24 fee,
            int24 tickLower,
            int24 tickUpper,
            uint128 liquidity,
            ,
            ,
            ,

        ) = nonfungiblePositionManager.positions(_tokenId);

        require(
            (token0 == poolToken0 && token1 == poolToken1) ||
                (token0 == poolToken1 && token1 == poolToken0),
            "StakeUniswapV3: pool's tokens are different"
        );

        require(liquidity > 0, "StakeUniswapV3: liquidity is zero");

        if (poolAddress == address(0)) {
            poolAddress = PoolAddress.computeAddress(
                uniswapV3FactoryAddress,
                PoolAddress.PoolKey({token0: token0, token1: token1, fee: fee})
            );
        }

        require(
            poolAddress != address(0),
            "StakeUniswapV3: poolAddress is zero"
        );

        (, int24 tick, , , , , bool unlocked) =
            IUniswapV3Pool(poolAddress).slot0();
        require(unlocked, "StakeUniswapV3: pool is closed");
        require(
            tickLower < tick && tick < tickUpper,
            "StakeUniswapV3: out of tick range"
        );

        (, , uint32 secondsInside) =
            IUniswapV3Pool(poolAddress).snapshotCumulativesInside(
                tickLower,
                tickUpper
            );

        uint256 tokenId_ = _tokenId;

        nonfungiblePositionManager.transferFrom(
            msg.sender,
            address(this),
            tokenId_
        );

        // initial start time
        if (stakeStartTime == 0) stakeStartTime = block.timestamp;

        //depositTokens 사용자가 디파짓한 토큰정보
        LibUniswapV3Stake.StakeLiquidity storage _depositTokens =
            depositTokens[tokenId_];
        _depositTokens.owner = msg.sender;
        _depositTokens.idIndex = userStakedTokenIds[msg.sender].length;
        _depositTokens.liquidity = liquidity;
        _depositTokens.tickLower = tickLower;
        _depositTokens.tickUpper = tickUpper;
        _depositTokens.startTime = uint32(block.timestamp);
        _depositTokens.claimedTime = 0;
        _depositTokens.secondsInsideInitial = secondsInside;
        _depositTokens.secondsInsideLast = 0;

        // save tokenid
        userStakedTokenIds[msg.sender].push(tokenId_);

        // 풀에 총 디파짓 되는 정보
        totalStakedAmount += liquidity;
        totalTokens++;

        //StakedTotalTokenAmount 사용자가 총 디파짓한 정보
        LibUniswapV3Stake.StakedTotalTokenAmount storage _userTotalStaked =
            userTotalStaked[msg.sender];
        if (!_userTotalStaked.staked) totalStakers++;
        _userTotalStaked.staked = true;
        _userTotalStaked.totalDepositAmount += liquidity;

        //stakedCoinageTokens 토큰별로 코인에에지에 들어가는 정보
        LibUniswapV3Stake.StakedTokenAmount storage _stakedCoinageTokens =
            stakedCoinageTokens[tokenId_];
        _stakedCoinageTokens.amount = liquidity;
        _stakedCoinageTokens.startTime = uint32(block.timestamp);

        miningCoinage();

        //mint coinage of user amount
        IAutoRefactorCoinageWithTokenId(coinage).mint(
            msg.sender,
            tokenId_,
            liquidity * (10**9)
        );

        emit Staked(msg.sender, poolAddress, tokenId_, liquidity);
    }

    /// @dev The amount mined with the deposited liquidity is claimed and taken.
    ///      The amount of mining taken is changed in proportion to the amount of time liquidity
    ///       has been provided since recent mining
    /// @param tokenId  tokenId
    function claim(uint256 tokenId) external override {
        LibUniswapV3Stake.StakeLiquidity storage _depositTokens =
            depositTokens[tokenId];

        require(
            _depositTokens.owner == msg.sender,
            "StakeUniswapV3: caller is not tokenId's staker"
        );

        miningCoinage();

        (
            uint256 miningAmount,
            uint256 nonMiningAmount,
            uint256 minableAmount,
            uint160 secondsInside,
            ,
            ,
            ,
            uint256 minableAmountRay,
            ,
            ,

        ) = getMiningTokenId(tokenId);

        require(miningAmount > 0, "StakeUniswapV3: miningAmount is zero");

        _depositTokens.claimedTime = uint32(block.timestamp);
        _depositTokens.secondsInsideLast = secondsInside;

        IAutoRefactorCoinageWithTokenId(coinage).burn(
            msg.sender,
            tokenId,
            minableAmountRay
        );

        // storage  stakedCoinageTokens
        LibUniswapV3Stake.StakedTokenAmount storage _stakedCoinageTokens =
            stakedCoinageTokens[tokenId];
        _stakedCoinageTokens.claimedTime = uint32(block.timestamp);
        _stakedCoinageTokens.claimedAmount += miningAmount;
        _stakedCoinageTokens.nonMiningAmount += nonMiningAmount;

        // storage  StakedTotalTokenAmount
        LibUniswapV3Stake.StakedTotalTokenAmount storage _userTotalStaked =
            userTotalStaked[msg.sender];
        _userTotalStaked.totalMiningAmount += miningAmount;
        _userTotalStaked.totalNonMiningAmount += nonMiningAmount;

        // total
        miningAmountTotal += miningAmount;
        nonMiningAmountTotal += nonMiningAmount;

        require(
            IIStake2Vault(vault).claimMining(
                msg.sender,
                minableAmount,
                miningAmount,
                nonMiningAmount
            )
        );
        emit Claimed(
            msg.sender,
            poolAddress,
            tokenId,
            miningAmount,
            nonMiningAmount
        );
    }

    /// @dev withdraw the deposited token.
    ///      The amount mined with the deposited liquidity is claimed and taken.
    ///      The amount of mining taken is changed in proportion to the amount of time liquidity
    ///      has been provided since recent mining
    /// @param tokenId  tokenId
    function withdraw(uint256 tokenId) external override {
        LibUniswapV3Stake.StakeLiquidity storage _depositTokens =
            depositTokens[tokenId];
        require(
            _depositTokens.owner == msg.sender,
            "StakeUniswapV3: caller is not tokenId's staker"
        );

        miningCoinage();

        if (totalStakedAmount >= _depositTokens.liquidity)
            totalStakedAmount -= _depositTokens.liquidity;

        if (totalTokens > 0) totalTokens--;

        (
            uint256 miningAmount,
            uint256 nonMiningAmount,
            uint256 minableAmount,
            ,
            ,
            ,
            ,
            ,
            ,
            ,

        ) = getMiningTokenId(tokenId);

        IAutoRefactorCoinageWithTokenId(coinage).burnTokenId(
            msg.sender,
            tokenId
        );

        // storage  StakedTotalTokenAmount
        LibUniswapV3Stake.StakedTotalTokenAmount storage _userTotalStaked =
            userTotalStaked[msg.sender];
        _userTotalStaked.totalDepositAmount -= _depositTokens.liquidity;
        _userTotalStaked.totalMiningAmount += miningAmount;
        _userTotalStaked.totalNonMiningAmount += nonMiningAmount;

        // total
        miningAmountTotal += miningAmount;
        nonMiningAmountTotal += nonMiningAmount;

        deleteUserToken(_depositTokens.owner, tokenId, _depositTokens.idIndex);

        delete depositTokens[tokenId];
        delete stakedCoinageTokens[tokenId];

        if (_userTotalStaked.totalDepositAmount == 0) {
            totalStakers--;
            delete userTotalStaked[msg.sender];
        }

        if (minableAmount > 0)
            require(
                IIStake2Vault(vault).claimMining(
                    msg.sender,
                    minableAmount,
                    miningAmount,
                    nonMiningAmount
                )
            );

        nonfungiblePositionManager.safeTransferFrom(
            address(this),
            msg.sender,
            tokenId
        );

        emit WithdrawalToken(
            msg.sender,
            tokenId,
            miningAmount,
            nonMiningAmount
        );
    }

    /// @dev Get the list of staked tokens of the user
    /// @param user  user address
    function getUserStakedTokenIds(address user)
        external
        view
        override
        returns (uint256[] memory ids)
    {
        return userStakedTokenIds[user];
    }

    /// @dev tokenId's deposited information
    /// @param tokenId   tokenId
    /// @return _poolAddress   poolAddress
    /// @return tick tick,
    /// @return liquidity liquidity,
    /// @return args liquidity,  startTime, claimedTime, startBlock, claimedBlock, claimedAmount
    /// @return secondsPL secondsPerLiquidityInsideInitialX128, secondsPerLiquidityInsideX128Las
    function getDepositToken(uint256 tokenId)
        external
        view
        override
        returns (
            address _poolAddress,
            int24[2] memory tick,
            uint128 liquidity,
            uint256[5] memory args,
            uint160[2] memory secondsPL
        )
    {
        LibUniswapV3Stake.StakeLiquidity memory _depositTokens =
            depositTokens[tokenId];
        LibUniswapV3Stake.StakedTokenAmount memory _stakedCoinageTokens =
            stakedCoinageTokens[tokenId];

        return (
            poolAddress,
            [_depositTokens.tickLower, _depositTokens.tickUpper],
            _depositTokens.liquidity,
            [
                _depositTokens.startTime,
                _depositTokens.claimedTime,
                _stakedCoinageTokens.startTime,
                _stakedCoinageTokens.claimedTime,
                _stakedCoinageTokens.claimedAmount
            ],
            [
                _depositTokens.secondsInsideInitial,
                _depositTokens.secondsInsideLast
            ]
        );
    }

    /// @dev user's staked total infos
    /// @param user  user address
    /// @return totalDepositAmount  total deposited amount
    /// @return totalMiningAmount total mining amount ,
    /// @return totalNonMiningAmount total non-mining amount,
    function getUserStakedTotal(address user)
        external
        view
        override
        returns (
            uint256 totalDepositAmount,
            uint256 totalMiningAmount,
            uint256 totalNonMiningAmount
        )
    {
        return (
            userTotalStaked[user].totalDepositAmount,
            userTotalStaked[user].totalMiningAmount,
            userTotalStaked[user].totalNonMiningAmount
        );
    }

    /// @dev totalSupply of coinage
    function totalSupplyCoinage() external view returns (uint256) {
        return IAutoRefactorCoinageWithTokenId(coinage).totalSupply();
    }

    /// @dev balanceOf of tokenId's coinage
    function balanceOfCoinage(uint256 tokenId) external view returns (uint256) {
        return IAutoRefactorCoinageWithTokenId(coinage).balanceOf(tokenId);
    }

    /// @dev Give the infomation of this stakeContracts
    /// @return return1  [token, vault, stakeRegistry, coinage]
    /// @return return2  [poolToken0, poolToken1, nonfungiblePositionManager, uniswapV3FactoryAddress]
    /// @return return3  [totalStakers, totalStakedAmount, miningAmountTotal,nonMiningAmountTotal]
    function infos()
        external
        view
        override
        returns (
            address[4] memory,
            address[4] memory,
            uint256[4] memory
        )
    {
        return (
            [token, vault, stakeRegistry, coinage],
            [
                poolToken0,
                poolToken1,
                address(nonfungiblePositionManager),
                uniswapV3FactoryAddress
            ],
            [
                totalStakers,
                totalStakedAmount,
                miningAmountTotal,
                nonMiningAmountTotal
            ]
        );
    }

    /// @dev minable amount of tokenId
    /// @dev tokenId tokenId
    /// @return balanceOfRayTokenId  balanceOf of tokenId with ray unit
    /// @return minableAmountRay  minable amount of tokenId with ray unit
    function canMiningAmountTokenId(uint256 tokenId)
        external
        view
        override
        returns (uint256 balanceOfRayTokenId, uint256 minableAmountRay)
    {
        LibUniswapV3Stake.StakeLiquidity storage _depositTokens =
            depositTokens[tokenId];

        balanceOfRayTokenId = IAutoRefactorCoinageWithTokenId(coinage)
            .balanceOf(tokenId);

        if (
            balanceOfRayTokenId > 0 &&
            balanceOfRayTokenId > _depositTokens.liquidity * (10**9)
        ) {
            minableAmountRay =
                balanceOfRayTokenId -
                (_depositTokens.liquidity * (10**9));
        }
    }

    /// @dev pool's infos
    /// @return factory  pool's factory address
    /// @return token0  token0 address
    /// @return token1  token1 address
    /// @return fee  fee
    /// @return tickSpacing  tickSpacing
    /// @return maxLiquidityPerTick  maxLiquidityPerTick
    /// @return liquidity  pool's liquidity
    function poolInfos()
        external
        view
        override
        nonZeroAddress(poolAddress)
        returns (
            address factory,
            address token0,
            address token1,
            uint24 fee,
            int24 tickSpacing,
            uint128 maxLiquidityPerTick,
            uint128 liquidity
        )
    {
        liquidity = IUniswapV3Pool(poolAddress).liquidity();
        factory = IUniswapV3Pool(poolAddress).factory();
        token0 = IUniswapV3Pool(poolAddress).token0();
        token1 = IUniswapV3Pool(poolAddress).token1();
        fee = IUniswapV3Pool(poolAddress).fee();
        tickSpacing = IUniswapV3Pool(poolAddress).tickSpacing();
        maxLiquidityPerTick = IUniswapV3Pool(poolAddress).maxLiquidityPerTick();
    }

    /// @dev key's info
    /// @param key hash(owner, tickLower, tickUpper)
    /// @return _liquidity  key's liquidity
    /// @return feeGrowthInside0LastX128  key's feeGrowthInside0LastX128
    /// @return feeGrowthInside1LastX128  key's feeGrowthInside1LastX128
    /// @return tokensOwed0  key's tokensOwed0
    /// @return tokensOwed1  key's tokensOwed1
    function poolPositions(bytes32 key)
        external
        view
        override
        nonZeroAddress(poolAddress)
        returns (
            uint128 _liquidity,
            uint256 feeGrowthInside0LastX128,
            uint256 feeGrowthInside1LastX128,
            uint128 tokensOwed0,
            uint128 tokensOwed1
        )
    {
        (
            _liquidity,
            feeGrowthInside0LastX128,
            feeGrowthInside1LastX128,
            tokensOwed0,
            tokensOwed1
        ) = IUniswapV3Pool(poolAddress).positions(key);
    }

    /// @dev pool's slot0 (current position)
    /// @return sqrtPriceX96  The current price of the pool as a sqrt(token1/token0) Q64.96 value
    /// @return tick  The current tick of the pool
    /// @return observationIndex  The index of the last oracle observation that was written,
    /// @return observationCardinality  The current maximum number of observations stored in the pool,
    /// @return observationCardinalityNext  The next maximum number of observations, to be updated when the observation.
    /// @return feeProtocol  The protocol fee for both tokens of the pool
    /// @return unlocked  Whether the pool is currently locked to reentrancy
    function poolSlot0()
        external
        view
        override
        nonZeroAddress(poolAddress)
        returns (
            uint160 sqrtPriceX96,
            int24 tick,
            uint16 observationIndex,
            uint16 observationCardinality,
            uint16 observationCardinalityNext,
            uint8 feeProtocol,
            bool unlocked
        )
    {
        (
            sqrtPriceX96,
            tick,
            observationIndex,
            observationCardinality,
            observationCardinalityNext,
            feeProtocol,
            unlocked
        ) = IUniswapV3Pool(poolAddress).slot0();
    }

    /// @dev _tokenId's position
    /// @param _tokenId  tokenId
    /// @return nonce  the nonce for permits
    /// @return operator  the address that is approved for spending this token
    /// @return token0  The address of the token0 for pool
    /// @return token1  The address of the token1 for pool
    /// @return fee  The fee associated with the pool
    /// @return tickLower  The lower end of the tick range for the position
    /// @return tickUpper  The higher end of the tick range for the position
    /// @return liquidity  The liquidity of the position
    /// @return feeGrowthInside0LastX128  The fee growth of token0 as of the last action on the individual position
    /// @return feeGrowthInside1LastX128  The fee growth of token1 as of the last action on the individual position
    /// @return tokensOwed0  The uncollected amount of token0 owed to the position as of the last computation
    /// @return tokensOwed1  The uncollected amount of token1 owed to the position as of the last computation
    function npmPositions(uint256 _tokenId)
        external
        view
        override
        nonZeroAddress(address(nonfungiblePositionManager))
        returns (
            uint96 nonce,
            address operator,
            address token0,
            address token1,
            uint24 fee,
            int24 tickLower,
            int24 tickUpper,
            uint128 liquidity,
            uint256 feeGrowthInside0LastX128,
            uint256 feeGrowthInside1LastX128,
            uint128 tokensOwed0,
            uint128 tokensOwed1
        )
    {
        return nonfungiblePositionManager.positions(_tokenId);
    }

    /// @dev snapshotCumulativesInside
    /// @param tickLower  The lower tick of the range
    /// @param tickUpper  The upper tick of the range
    /// @return tickCumulativeInside  The snapshot of the tick accumulator for the range
    /// @return secondsPerLiquidityInsideX128  The snapshot of seconds per liquidity for the range
    /// @return secondsInside  The snapshot of seconds per liquidity for the range
    /// @return curTimestamps  current Timestamps
    function snapshotCumulativesInside(int24 tickLower, int24 tickUpper)
        external
        view
        override
        nonZeroAddress(poolAddress)
        returns (
            int56 tickCumulativeInside,
            uint160 secondsPerLiquidityInsideX128,
            uint32 secondsInside,
            uint32 curTimestamps
        )
    {
        tickCumulativeInside;
        secondsPerLiquidityInsideX128;
        secondsInside;
        curTimestamps = uint32(block.timestamp);

        (
            tickCumulativeInside,
            secondsPerLiquidityInsideX128,
            secondsInside
        ) = IUniswapV3Pool(poolAddress).snapshotCumulativesInside(
            tickLower,
            tickUpper
        );
    }

    /// @dev mining end time
    function miningEndTime()
        external
        view
        override
        nonZeroAddress(vault)
        returns (uint256)
    {
        return IIStake2Vault(vault).miningEndTime();
    }
}
