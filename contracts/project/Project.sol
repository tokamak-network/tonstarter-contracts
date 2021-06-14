//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;
pragma abicoder v2;

import "../libraries/LibProject.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import {
    IProjectStakeVaultFactory
} from "../interfaces/IProjectStakeVaultFactory.sol";
import {
    IProjectDevVaultFactory
} from "../interfaces/IProjectDevVaultFactory.sol";

interface IManager {
    function airdropVault() external view returns (address);

    function projectRegistry() external view returns (address);

    function projectDevVaultFactory() external view returns (address);

    function projectStakeVaultFactory() external view returns (address);

    function defaultAirdrop() external view returns (uint256);
}

contract Project is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");
    bytes32 public constant DEV_ROLE = keccak256("DEVELOPER");
    uint256 public projectId;
    uint256 public startBlock;
    uint256 public endBlock;
    uint256 public tokenPrice;

    address public token;
    address public pair;
    address public developer;
    address public manager;

    string public projectName;
    string public tokenName;
    string public symbol;
    string public webpage;
    string public refurl;

    address public devVault;
    address public stakeVault;
    address public stakeLPVault;

    // index zero is none index.
    uint256[] public tokenSalesIndex;
    mapping(uint256 => LibProject.TokenSale) public tokenSales;
    mapping(uint256 => uint256) public tokenSaledAmount;
    mapping(uint256 => mapping(address => uint256)) private tokenBuyer;
    mapping(uint256 => address[]) public whitelist;

    bool public boolTokenDistribution;
    LibProject.TokenDistribution public tokenDistribution;
    LibProject.SaleIncomeDistribution public saleIncomeDistribution;

    modifier onlyOwner() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "Project: Caller is not an admin"
        );
        _;
    }
    modifier onlyDev() {
        require(
            hasRole(DEV_ROLE, msg.sender),
            "Project: Caller is not an developer"
        );
        _;
    }
    modifier nonZero(address _addr) {
        require(_addr != address(0), "Project: zero address");
        _;
    }

    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(DEV_ROLE, DEV_ROLE);
        _setupRole(ADMIN_ROLE, msg.sender);
    }

    receive() external payable {}

    function initialize(
        uint256 _projectId,
        string memory _projectName,
        uint256 _startBlock,
        uint256 _endBlock,
        uint256 _tokenPrice,
        address _developer,
        address _manager,
        address _token,
        string memory _tokenName,
        string memory _symbol
    ) external onlyOwner {
        require(
            _projectId > 0 && _startBlock > 0 && _endBlock > _startBlock,
            "Project: input error"
        );

        projectId = _projectId;
        startBlock = _startBlock;
        endBlock = _endBlock;
        tokenPrice = _tokenPrice;
        projectName = _projectName;
        token = _token;
        tokenName = _tokenName;
        symbol = _symbol;
        developer = _developer;
        manager = _manager;
    }

    function setToken(address _token) external onlyOwner nonZero(_token) {
        token = _token;
    }

    function setPair(address _pair) external onlyDev nonZero(_pair) {
        pair = _pair;
    }

    function setTokenDistribution(
        uint256 airdrop,
        uint256 dev,
        uint256 rewardGeneral,
        uint256 rewardLP
    ) external onlyDev {
        require(
            boolTokenDistribution == false,
            "Project: execTokenDistribution done"
        );
        uint256 defaultAirdrop = IManager(manager).defaultAirdrop();
        require(
            airdrop >= defaultAirdrop && dev > 0 && rewardGeneral > 0,
            "Project: setTokenDistribution input fail"
        );

        tokenDistribution.airdrop = airdrop;
        tokenDistribution.dev = dev;
        tokenDistribution.rewardGeneral = rewardGeneral;
        tokenDistribution.rewardLP = rewardLP;
    }

    function createDevVault() external onlyDev nonZero(manager) {
        address factory = IManager(manager).projectDevVaultFactory();
        require(factory != address(0), "Project: ProjectDevVaultFactory zero");
        address vault = IProjectDevVaultFactory(factory).deploy(address(this));
        require(vault != address(0), "Project: vault zero");
        devVault = vault;
    }

    function createStakeVault(bool boolPair) external onlyDev nonZero(manager) {
        address factory = IManager(manager).projectStakeVaultFactory();
        require(
            factory != address(0),
            "Project: ProjectStakeVaultFactory zero"
        );
        address vault;

        if (!boolPair) {
            require(stakeVault == address(0), "Project: already create");
            vault = IProjectStakeVaultFactory(factory).deploy(
                address(this),
                token
            );
            require(vault != address(0), "Project: vault zero");
            stakeVault = vault;
        } else {
            require(stakeLPVault == address(0), "Project: already create");
            vault = IProjectStakeVaultFactory(factory).deploy(
                address(this),
                pair
            );
            require(vault != address(0), "Project: vault zero");
            stakeLPVault = vault;
        }
    }

    function execTokenDistribution() external onlyDev nonZero(manager) {
        require(
            boolTokenDistribution == false,
            "Project: execTokenDistribution done"
        );
        uint256 balance = IERC20(token).balanceOf(address(this));
        uint256 total = IERC20(token).totalSupply();
        require(balance == total, "Project: balance is not total");
        address airdropVault = IManager(manager).airdropVault();
        require(
            devVault != address(0) &&
                stakeVault != address(0) &&
                airdropVault != address(0),
            "Project: vault is zero"
        );

        require(
            tokenDistribution.airdrop > 0 &&
                tokenDistribution.dev > 0 &&
                tokenDistribution.rewardGeneral > 0,
            "Project: tokenDistribution is zero"
        );

        boolTokenDistribution = true;

        tokenDistribution.airdropAmount =
            (total * tokenDistribution.airdrop) /
            10**18;
        tokenDistribution.devAmount = (total * tokenDistribution.dev) / 10**18;
        tokenDistribution.rewardGeneralAmount =
            (total * tokenDistribution.rewardGeneral) /
            10**18;

        IERC20(token).transfer(airdropVault, tokenDistribution.airdropAmount);
        IERC20(token).transfer(devVault, tokenDistribution.devAmount);
        IERC20(token).transfer(
            stakeVault,
            tokenDistribution.rewardGeneralAmount
        );
    }

    function createTokenSale(
        uint256 startTime,
        uint256 endTime,
        uint256 softCap,
        uint256 hardCap,
        uint256 price
    ) external onlyOwner {
        require(
            startTime > 0 && endTime > startTime && hardCap > 0 && price > 0,
            "Project: input error"
        );

        // we don't use index zero
        uint256 index = tokenSalesIndex.length + 1;
        LibProject.TokenSale storage sale = tokenSales[index];
        sale.index = index;
        sale.startTime = startTime;
        sale.endTime = endTime;
        sale.softCap = softCap;
        sale.hardCap = hardCap;
        sale.price = price;
        tokenSalesIndex.push(index);
    }
}
