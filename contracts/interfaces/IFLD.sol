//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IFLD {
    // event Approval(address indexed owner, address indexed spender, uint value);
    // event Transfer(address indexed from, address indexed to, uint value);

    function name() external pure returns (string memory);
    function symbol() external pure returns (string memory);
    function decimals() external pure returns (uint8);
    function totalSupply() external view returns (uint);
    function balanceOf(address owner) external view returns (uint);
    function allowance(address owner, address spender) external view returns (uint);

    /**
    * Issue a token.
    */
    function mint(address to, uint256 amount) external returns (bool);

    /**
    * burn a token.
    */
    function burn(address from, uint256 amount) external returns (bool);
    /**
    * The sender authorize spender to spend sender's tokens in the amount.
    */
    function approve(address spender, uint value) external returns (bool);
    /**
    * The sender sends the value of this token to addressTO.
    */
    function transfer(address to, uint value) external returns (bool);
    /**
    * The sender sends the amount of tokens from fromAddress to toAddress.
    */
    function transferFrom(address from, address to, uint value) external returns (bool);

    function DOMAIN_SEPARATOR() external view returns (bytes32);

    //function PERMIT_TYPEHASH() external pure returns (bytes32);
    function nonces(address owner) external view returns (uint);

    /**
    * Authorizes the owner's token to be used by the spender as much as the value.
    * The signature must have the owner's signature.
    */
    function permit(address owner, address spender, uint value, uint deadline, bytes memory signature) external;
}
