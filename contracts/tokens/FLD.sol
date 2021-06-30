//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "../interfaces/IFLD.sol";
import "../libraries/ChainId.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import "../common/AccessibleCommon.sol";

/// @title the platform token. FLD token
contract FLD is ERC20, AccessibleCommon, IFLD {

    bytes32 public constant MINTER_ROLE = keccak256("MINTER");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER");

    // string public constant name1 = "FLD";
    // string public constant symbol1 = "FLD";
    /// @dev The hash of the name used in the permit signature verification
    bytes32 private immutable nameHash;

    /// @dev The hash of the version string used in the permit signature verification
    bytes32 private immutable versionHash;

    //bytes32 public override DOMAIN_SEPARATOR;
    mapping(address => uint256) public override nonces;

    /// @dev Value is equal to keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    bytes32 public constant PERMIT_TYPEHASH =
        0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;

    struct Permit {
        address owner;
        address spender;
        address value;
        address nonce;
        address deadline;
    }


    /// @dev constructor of FLD, ERC20 Token
    constructor(
        string memory name_,
        string memory symbol_,
        string memory version_
    ) ERC20(name_, symbol_) {
        nameHash = keccak256(bytes(name_));
        versionHash = keccak256(bytes(version_));

        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(BURNER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);

        _setupRole(ADMIN_ROLE, msg.sender);
        _setupRole(BURNER_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    function DOMAIN_SEPARATOR() public view override returns (bytes32) {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }

        return
            keccak256(
                abi.encode(
                    // keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)')
                    0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f,
                    nameHash,
                    versionHash,
                    chainId,
                    address(this)
                )
            );
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
    /// @param v the owner's signature - v
    /// @param r the owner's signature - r
    /// @param s the owner's signature - s
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external override {
        require(deadline >= block.timestamp, "FLD: permit EXPIRED");

        bytes32 digest =
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    DOMAIN_SEPARATOR(),
                    keccak256(
                        abi.encode(
                            PERMIT_TYPEHASH,
                            owner,
                            spender,
                            value,
                            nonces[owner]++,
                            deadline
                        )
                    )
                )
            );

        require(owner != spender, "FLD: approval to current owner");

        // if (Address.isContract(owner)) {
        //     require(IERC1271(owner).isValidSignature(digest, abi.encodePacked(r, s, v)) == 0x1626ba7e, 'Unauthorized');
        // } else {
        address recoveredAddress = ecrecover(digest, v, r, s);
        require(recoveredAddress != address(0), "FLD: Invalid signature");
        require(recoveredAddress == owner, "FLD: Unauthorized");
        // }
        _approve(owner, spender, value);
    }

    /// @dev verify the signature
    /// @param signer the signer address
    /// @param owner the token's owner
    /// @param spender the account that spend owner's token
    /// @param value the amount to be approve to spend
    /// @param deadline the deadline that vaild the owner's signature
    /// @param _nounce the _nounce
    /// @param sigR the owner's signature - r
    /// @param sigS the owner's signature - s
    /// @param sigV the owner's signature - v
    function verify(
        address signer,
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint256 _nounce,
        bytes32 sigR,
        bytes32 sigS,
        uint8 sigV
    ) external view override returns (bool) {
        return
            signer ==
            ecrecover(
                hashPermit(owner, spender, value, deadline, _nounce),
                sigV,
                sigR,
                sigS
            );
    }

    /// @dev the hash of Permit
    /// @param owner the token's owner
    /// @param spender the account that spend owner's token
    /// @param value the amount to be approve to spend
    /// @param deadline the deadline that vaild the owner's signature
    /// @param _nounce the _nounce
    function hashPermit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint256 _nounce
    ) public view override returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "\x19\x01",
                    DOMAIN_SEPARATOR(),
                    keccak256(
                        abi.encode(
                            PERMIT_TYPEHASH,
                            owner,
                            spender,
                            value,
                            _nounce,
                            deadline
                        )
                    )
                )
            );
    }
}
