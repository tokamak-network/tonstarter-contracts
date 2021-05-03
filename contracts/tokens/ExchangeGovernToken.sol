//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "../interfaces/IFLD.sol";
import "../interfaces/ISFLD.sol";
import "../interfaces/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";

contract ExchangeGovernToken
    is
    AccessControl,
    Initializable
{
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    IFLD public fld;
    ISFLD public sfld;
    uint256 public exchangeWeight;

    modifier onlyOwner() {
        require(hasRole(ADMIN_ROLE, msg.sender), "ExchangeGovernToken: Caller is not an admin");
        _;
    }
    //////////////////////////////
    // Events
    //////////////////////////////

    event MintedSFLD(address indexed from, uint256 amount, uint256 deadline , uint8 v , bytes32 r, bytes32 s);

    function initialize(
        address _fld,
        address _sfld
    )
        external
        initializer
    {
        require(_fld != address(0) && _sfld != address(0));

        fld = IFLD(_fld);
        sfld = ISFLD(_sfld);
        exchangeWeight = 1;

        _setupRole(ADMIN_ROLE, msg.sender);
    }

    /**
    * external
    */
    function setExchangeWeight(
        uint256 _weight
    )
        external
        onlyOwner
    {
        require(_weight > 0);
        exchangeWeight = _weight;
    }

    function mintSFLD(
        uint256 _amountFLD,
        uint256 deadline,
        bytes memory signature
    )
        external
    {

        require(msg.sender != address(0) && _amountFLD > 0 && exchangeWeight > 0,
            "ExchangeGovernToken: check _amountFLD or exchangeWeight ");
        require(fld.balanceOf(msg.sender) >= _amountFLD, "ExchangeGovernToken: FLD.balanceOf is lack.");

        fld.permit(msg.sender, address(this), _amountFLD, deadline, signature);
        fld.transferFrom(msg.sender, address(this), _amountFLD);
        sfld.mint(msg.sender, _amountFLD * exchangeWeight);
    }

    function burnSFLD(
        uint256 _amountSFLD

    )
        external
    {
        require(msg.sender != address(0) && _amountSFLD > 0 && exchangeWeight > 0);
        require(sfld.balanceOf(msg.sender) >= _amountSFLD);

        uint256 amountFLD = _amountSFLD / exchangeWeight;
        require(fld.balanceOf(address(this)) >= amountFLD);

        sfld.burn(msg.sender, _amountSFLD);
        fld.transfer(msg.sender, amountFLD);
    }

    /**
    * public
    */

    /**
    * internal
    */

    /**
    * private
    */

}
