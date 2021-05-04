//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "../interfaces/IFLD.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./VerifySignature.sol";

/**
 * This is a platform token.
 */
contract FLD is IFLD, AccessControl, VerifySignature {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER");

    string public constant override name = "FLD";
    string public constant override symbol = "FLD";
    uint8 public constant override decimals = 18;
    uint256 public override totalSupply;
    mapping(address => uint256) public override balanceOf;
    mapping(address => mapping(address => uint256)) public override allowance;

    bytes32 public override DOMAIN_SEPARATOR;
    // keccak256("Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)");
    // solhint-disable-next-line
    //bytes32 public constant override PERMIT_TYPEHASH = 0x6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9;
    mapping(address => uint256) public override nonces;

    event Approval(address indexed from, address indexed to, uint256 value);
    event Transfer(address indexed from, address indexed to, uint256 value);

    modifier onlyOwner() {
        require(hasRole(ADMIN_ROLE, msg.sender), "FLD: Caller is not an admin");
        _;
    }

    constructor() {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes(name)),
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

    function getChainId() external pure returns (uint256) {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        return chainId;
    }

    function _mint(address to, uint256 value) internal {
        totalSupply += value;
        balanceOf[to] += value;
        emit Transfer(address(0), to, value);
    }

    function _burn(address from, uint256 value) internal {
        balanceOf[from] -= value;
        totalSupply -= value;
        emit Transfer(from, address(0), value);
    }

    function _approve(
        address owner,
        address spender,
        uint256 value
    ) private {
        allowance[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    function _transfer(
        address from,
        address to,
        uint256 value
    ) private {
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
    }

    /**
     * Issue a token.
     */
    function mint(address to, uint256 amount) external override returns (bool) {
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

    /**
     * The sender authorize spender to spend sender's tokens in the amount.
     */
    function approve(address spender, uint256 value)
        external
        override
        returns (bool)
    {
        _approve(msg.sender, spender, value);
        return true;
    }

    /**
     * The sender sends the value of this token to addressTO.
     */
    function transfer(address to, uint256 value)
        external
        override
        returns (bool)
    {
        _transfer(msg.sender, to, value);
        return true;
    }

    /**
     * The sender sends the amount of tokens from fromAddress to toAddress.
     */
    function transferFrom(
        address from,
        address to,
        uint256 value
    ) external override returns (bool) {
        if (allowance[from][msg.sender] != uint256(-1)) {
            allowance[from][msg.sender] -= value;
        }
        _transfer(from, to, value);
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
    ) external override {
        require(deadline >= block.timestamp, "FLD: EXPIRED");
        bytes32 messageHash =
            getPermitMessageHash(owner, spender, value, deadline);
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
        bytes memory signature
    ) public pure returns (bool) {
        bytes32 messageHash =
            getPermitMessageHash(_signer, _to, _amount, _period);

        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        address _addr = recoverSigner(ethSignedMessageHash, signature);

        return (_addr == _signer);
    }
}
