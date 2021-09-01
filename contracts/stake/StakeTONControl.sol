//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;
pragma abicoder v2;

import "../interfaces/ITokamakStakerUpgrade.sol";
import "../interfaces/IIERC20.sol";
import "../interfaces/IISeigManager.sol";
import "../interfaces/IIIDepositManager.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../common/AccessibleCommon.sol";

contract StakeTONControl is AccessibleCommon {
    using SafeMath for uint256;

    address public ton;
    address public wton;
    address public tos;
    address public depositManager;
    address public seigManager;
    address public layer2;
    uint public countStakeTons;
    mapping(uint => address) public stakeTons;


    modifier nonZeroAddress(address _addr) {
        require(_addr != address(0), "TokamakStaker: zero address");
        _;
    }

    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    function setInfo(
        address _ton,
        address _wton,
        address _tos,
        address _depositManager,
        address _seigManager,
        address _layer2,
        uint _countStakeTons
    ) external onlyOwner
    {
        ton =_ton;
        wton =_wton;
        tos = _tos;
        depositManager = _depositManager;
        seigManager = _seigManager;
        layer2 = _layer2;
        countStakeTons = _countStakeTons;
    }

    function deleteStakeTon(uint _index) external onlyOwner {
         delete stakeTons[_index];
    }

    function addStakeTon(address[] calldata _addr) external onlyOwner {
        require(_addr.length > 0, "StakeTONControl: zero length");
        require(_addr.length == countStakeTons, "StakeTONControl: diff countStakeTons");

        for(uint i = 1; i <= _addr.length; i++){
            stakeTons[i] = _addr[i];
        }
    }

    function canSwappedWTON(uint _index)
        public view
        nonZeroAddress(depositManager)
        nonZeroAddress(seigManager)
        nonZeroAddress(layer2)
        returns (uint256)
    {
        if(stakeTons[_index]==address(0)) return 0;
        uint256 endBlock = ITokamakStakerUpgrade(stakeTons[_index]).endBlock();

        if(block.number < endBlock){
            uint256 _amountWTON = IIERC20(wton).balanceOf(stakeTons[_index]);
            uint256 _amountTON = IIERC20(ton).balanceOf(stakeTons[_index]);
            uint256 totalStakedAmount = ITokamakStakerUpgrade(stakeTons[_index]).totalStakedAmount();

            uint256 stakeOf = 0;

            stakeOf = IISeigManager(seigManager).stakeOf(
                layer2,
                stakeTons[_index]
            );
            stakeOf = stakeOf.add(
                IIIDepositManager(depositManager).pendingUnstaked(
                    layer2,
                    stakeTons[_index]
                )
            );
            uint256 holdAmount = _amountWTON;
            if (_amountTON > 0) holdAmount = holdAmount.add(_amountTON.mul(10**9));

            uint256 totalHoldAmount = holdAmount.add(stakeOf);

            if(totalHoldAmount.sub(100) > totalStakedAmount.mul(10**9) ){
                if(stakeOf.add(100) > totalStakedAmount.mul(10**9)) return holdAmount;
                else {
                uint256 amount = holdAmount.sub(totalStakedAmount.mul(10**9).sub(stakeOf).sub(100));
                return amount;
                }
            } else {
                return 0;
            }
        }else return 0;
    }

    function withdrawLayer2AndSwapTOS(uint _index) public nonZeroAddress(layer2) {

        withdrawLayer2(_index);

        uint256 amountIn = canSwappedWTON(_index);
        if(amountIn > 0 ){
            uint256 deadline = block.timestamp + 1000;
            ITokamakStakerUpgrade(stakeTons[_index]).exchangeWTONtoTOS(
                amountIn, 0, deadline, 0, 0);
        }
    }

    function withdrawLayer2(uint _index) public nonZeroAddress(layer2) {
        require(stakeTons[_index] != address(0), "StakeTONControl: zero stakeTons");

        (uint256 count, uint256 amount) = ITokamakStakerUpgrade(stakeTons[_index]).canTokamakProcessUnStakingCount(layer2);

        if(count > 0 && amount > 0) ITokamakStakerUpgrade(stakeTons[_index]).tokamakProcessUnStaking(layer2);
    }

    function withdrawLayer2All() external nonZeroAddress(layer2) {
        for(uint i = 1 ; i <= countStakeTons; i++){
             withdrawLayer2(i);
        }
    }

    function withdrawLayer2AllAndSwapAll() external {
        for(uint i = 1 ; i <= countStakeTons; i++){
             withdrawLayer2AndSwapTOS(i);
        }
    }

}
