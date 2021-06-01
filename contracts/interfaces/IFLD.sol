//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

interface IFLD {

    /// @dev Issue a token.
    /// @param to  who takes the issue
    /// @param amount the amount to issue
    function mint(address to, uint256 amount) external returns (bool);

    // @dev burn a token.
    /// @param from Whose tokens are burned
    /// @param amount the amount to burn
    function burn(address from, uint256 amount) external returns (bool);

    function DOMAIN_SEPARATOR() external view returns (bytes32);

    function nonces(address owner) external view returns (uint256);

    /// @dev Authorizes the owner's token to be used by the spender as much as the value.
    /// @dev The signature must have the owner's signature.
    /// @param owner the token's owner
    /// @param spender the account that spend owner's token
    /// @param value the amount to be approve to spend
    /// @param deadline the deadline that vaild the owner's signature
    /// @param signature the owner's signature
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        bytes memory signature
    ) external;

    /// @dev Check sure the signature is correct.
    /// @param _signer the token's owner
    /// @param _to the account that spend owner's token
    /// @param _amount the amount to be approve to spend
    /// @param _period the deadline that vaild the owner's signature
    /// @param _nonce the account's nonce
    /// @param signature the owner's signature
    /// @return bool
    function permitVerify(
        address _signer,
        address _to,
        uint256 _amount,
        uint256 _period,
        uint256 _nonce,
        bytes memory signature
    ) external returns (bool);
}
