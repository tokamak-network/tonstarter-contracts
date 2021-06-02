//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "../interfaces/IFLD.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./VerifySignature.sol";

/// @title the platform token. FLD token
contract FLD is ERC20, AccessControl, VerifySignature, IFLD {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER");

    string public constant name1 = "FLD";
    string public constant symbol1 = "FLD";

    bytes32 public override DOMAIN_SEPARATOR;
    mapping(address => uint256) public override nonces;

    modifier onlyOwner() {
        require(hasRole(ADMIN_ROLE, msg.sender), "FLD: Caller is not an admin");
        _;
    }

    /// @dev constructor of FLD, ERC20 Token
    constructor() ERC20(name1, symbol1) {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes(name1)),
                keccak256(bytes("1")),
                chainId,
                address(this)
            )
        );
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(BURNER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);

        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(BURNER_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    /// @dev transfer Ownership
    /// @param newOwner new owner address
    function transferOwnership(address newOwner) external onlyOwner {
        require(msg.sender != newOwner, "FLD:same owner");
        grantRole(ADMIN_ROLE, newOwner);
        revokeRole(ADMIN_ROLE, msg.sender);
    }

    /// @dev Issue a token.
    /// @param to  who takes the issue
    /// @param amount the amount to issue
    function mint(address to, uint256 amount) external override returns (bool) {
        require(
            hasRole(MINTER_ROLE, msg.sender),
            "FLD: Caller is not a minter"
        );
        _mint(to, amount);
        return true;
    }

    /// @dev burn a token.
    /// @param from Whose tokens are burned
    /// @param amount the amount to burn
    function burn(address from, uint256 amount)
        external
        override
        returns (bool)
    {
        require(
            hasRole(BURNER_ROLE, msg.sender),
            "FLD: Caller is not a burner"
        );
        _burn(from, amount);
        return true;
    }

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
    ) external override {
        require(deadline >= block.timestamp, "FLD: EXPIRED");
        bytes32 messageHash =
            getPermitMessageHash(
                owner,
                spender,
                value,
                nonces[owner]++,
                deadline
            );
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        address recoveredAddress =
            recoverSigner(ethSignedMessageHash, signature);
        require(
            recoveredAddress != address(0) && recoveredAddress == owner,
            "FLD: INVALID_SIGNATURE"
        );
        _approve(owner, spender, value);
    }

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
    ) public pure override returns (bool) {
        bytes32 messageHash =
            getPermitMessageHash(_signer, _to, _amount, _nonce, _period);

        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        address _addr = recoverSigner(ethSignedMessageHash, signature);

        return (_addr == _signer);
    }
}
