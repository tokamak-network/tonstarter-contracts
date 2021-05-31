//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./VerifySignature.sol";

/**
 * This is a platform token.
 */
contract FLD is ERC20, AccessControl, VerifySignature {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER");

    string public constant name1 = "FLD";
    string public constant symbol1 = "FLD";

    bytes32 public DOMAIN_SEPARATOR;
    mapping(address => uint256) public nonces;

    modifier onlyOwner() {
        require(hasRole(ADMIN_ROLE, msg.sender), "FLD: Caller is not an admin");
        _;
    }

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

    function transferOwnership(address newOwner) external onlyOwner {
        require(msg.sender != newOwner, "FLD:same owner");
        grantRole(ADMIN_ROLE, newOwner);
        revokeRole(ADMIN_ROLE, msg.sender );
    }

    /**
     * Issue a token.
     */
    function mint(address to, uint256 amount) external returns (bool) {
        require(
            hasRole(MINTER_ROLE, msg.sender),
            "FLD: Caller is not a minter"
        );
        _mint(to, amount);
        return true;
    }

    /**
     * burn a token.
     */
    function burn(address from, uint256 amount) external returns (bool) {
        require(
            hasRole(BURNER_ROLE, msg.sender),
            "FLD: Caller is not a burner"
        );
        _burn(from, amount);
        return true;
    }

    /**
     * Authorizes the owner's token to be used by the spender as much as the value.
     * The signature must have the owner's signature.
     */
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        bytes memory signature
    ) external {
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

    /**
     * Authorizes the owner's token to be used by the spender as much as the value.
     * The signature must have the owner's signature.
     * Make sure the signature is correct.
     */
    function permitVerify(
        address _signer,
        address _to,
        uint256 _amount,
        uint256 _period,
        uint256 _nonce,
        bytes memory signature
    ) public pure returns (bool) {
        bytes32 messageHash =
            getPermitMessageHash(_signer, _to, _amount, _nonce, _period);

        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        address _addr = recoverSigner(ethSignedMessageHash, signature);

        return (_addr == _signer);
    }
}
