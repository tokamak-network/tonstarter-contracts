//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.6;

import "@openzeppelin/contracts/access/AccessControl.sol";
import './VerifySignature.sol';

contract WETH is AccessControl, VerifySignature {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER");

    string public name     = "Wrapped Ether";
    string public symbol   = "WETH";
    uint8  public decimals = 18;

    event  Approval(address indexed src, address indexed guy, uint256 wad);
    event  Transfer(address indexed src, address indexed dst, uint256 wad);
    event  EventSwapEthToWeth(address indexed from, uint256 wad);
    event  EventSwapWethToEth(address indexed from, uint256 wad);

    uint256  public totalSupply;
    mapping (address => uint256)                       public  balanceOf;
    mapping (address => mapping (address => uint256))  public  allowance;
    mapping (address => uint)                       private  userLocked;

    modifier lock(address user) {
        require(userLocked[user] == 0, "WETH: LOCKED");
        userLocked[user] = 1;
        _;
        userLocked[user] = 0;
    }

    constructor() {
         _setupRole(ADMIN_ROLE, msg.sender);

        _setRoleAdmin(BURNER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(MINTER_ROLE, ADMIN_ROLE);

        _setupRole(BURNER_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    receive() external payable {
        swapEthToWeth();
    }

    function swapEthToWeth() public payable {
        _mint(msg.sender, msg.value);
        emit EventSwapEthToWeth(msg.sender, msg.value);
    }

    function swapWethToEth(uint256 wad) external lock(msg.sender) {
        require(balanceOf[msg.sender] >= wad);
        _burn(msg.sender, wad);

        //msg.sender.transfer(wad);
        address payable self = address(uint160(address(this)));
        uint256 contractBalance  = self.balance;
        require(contractBalance >= wad);

        (bool success, ) = msg.sender.call{value: wad}("");
        require(success, "WETH: swapWethToEth failed.");

        emit EventSwapWethToEth(msg.sender, wad);
    }

    function balanceEther() external view returns (uint) {
        return address(this).balance;
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

    function _approve(address owner, address spender, uint256 value) private {
        allowance[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    function mint(address to, uint256 amount) external returns (bool) {
        require(hasRole(MINTER_ROLE, msg.sender), "FLD: Caller is not a minter");
        _mint(to, amount);
        return true;
    }

    function burn(address from, uint256 amount) external returns (bool) {
        require(hasRole(BURNER_ROLE, msg.sender), "FLD: Caller is not a burner");
        _burn(from, amount);
        return true;
    }

    function approve(address guy, uint wad) external returns (bool) {
        _approve(msg.sender, guy, wad) ;
        return true;
    }

    function transfer(address dst, uint wad) external returns (bool) {
        return transferFrom(msg.sender, dst, wad);
    }

    function transferFrom(address src, address dst, uint wad)
        public
        returns (bool)
    {
        require(balanceOf[src] >= wad);

        if (src != msg.sender && allowance[src][msg.sender] != uint(-1)) {
            require(allowance[src][msg.sender] >= wad);
            allowance[src][msg.sender] -= wad;
        }

        balanceOf[src] -= wad;
        balanceOf[dst] += wad;

        emit Transfer(src, dst, wad);

        return true;
    }

    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        bytes memory signature
    )
        external
    {
        require(deadline >= block.timestamp, 'WETH: EXPIRED');
        bytes32 messageHash = getPermitMessageHash(owner, spender, value, deadline);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
        address recoveredAddress = recoverSigner(ethSignedMessageHash, signature);
        require(recoveredAddress != address(0) && recoveredAddress == owner, 'WETH: INVALID_SIGNATURE');
        _approve(owner, spender, value);
    }

    function permitVerify(
        address _signer,
        address _to, uint256 _amount,  uint256 _period,
        bytes memory signature
    )
        public pure returns (bool)
    {
        bytes32 messageHash = getPermitMessageHash(_signer, _to, _amount,  _period);

        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        address _addr = recoverSigner(ethSignedMessageHash, signature);

        return (_addr == _signer);
    }

}

