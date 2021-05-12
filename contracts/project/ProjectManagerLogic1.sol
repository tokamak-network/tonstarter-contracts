// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;
pragma abicoder v2;

import {SafeMath} from "../utils/math/SafeMath.sol";
import {LibProject} from "../libraries/LibProject.sol";

import "./ProjectManagerStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

import {IProject} from "../interfaces/IProject.sol";
import {IProjectFactory} from "../interfaces/IProjectFactory.sol";
import {IProjectRegistry} from "../interfaces/IProjectRegistry.sol";
import {IProjectTokenFactory} from "../interfaces/IProjectTokenFactory.sol";

contract ProjectManagerLogic1 is ProjectManagerStorage, AccessControl {
    using SafeMath for uint256;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN");

    modifier onlyOwner() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "ProjectManagerLogic1: Caller is not an admin"
        );
        _;
    }

    modifier nonZero(address _addr) {
        require(_addr != address(0), "ProjectManagerLogic1: zero address");
        _;
    }

    //////////////////////////////
    // Events
    //////////////////////////////


    //////////////////////////////////////////////////////////////////////
    // setters
    function setStore(
        address _fld,
        address _projectRegistry,
        address _projectFactory,
        address _projectTokenFactory,
        address _projectStakeVaultFactory,
        address _projectDevVaultFactory
    )
        external onlyOwner
        nonZero(_fld)
        nonZero(_projectRegistry)
        nonZero(_projectFactory)
        nonZero(_projectTokenFactory)
        nonZero(_projectStakeVaultFactory)
        nonZero(_projectDevVaultFactory)
    {
        fld = _fld;
        projectRegistry = _projectRegistry;
        projectFactory = _projectFactory;
        projectTokenFactory = _projectTokenFactory;
        projectStakeVaultFactory = _projectStakeVaultFactory;
        projectDevVaultFactory = _projectDevVaultFactory;
    }

    //////////////////////////////////////////////////////////////////////
    //
    function createProject(
        string memory _projectName,
        string memory _tokenName,
        string memory _symbol,
        uint256 _totalSupply,
        uint256 _tokenPrice,
        uint256 _startBlock
    ) external nonZero(projectRegistry) {

        require(defaultStakingPeriod > 0, "ProjectManagerLogic1: defaultStakingPeriod zero");
        require(payCreateProjectFee(), "ProjectManagerLogic1: payCreateProjectFee fail");

        string memory tokenName = _tokenName;
        string memory symbol = _symbol;

        // 프로젝트를 만든다.
        uint256 startBlock = _startBlock;
        uint256 endBlock = _startBlock + defaultStakingPeriod;

        // 0 is none project
        uint256 _projectId = projectId.length + 1;

        address project = IProjectFactory(projectFactory).deploy(
            _projectId,
            _projectName,
            startBlock,
            endBlock,
            _tokenPrice,
            msg.sender,
            address(0),
            tokenName,
            symbol
        );
        require(project != address(0), "ProjectManagerLogic1: project zero");

        // 토큰을 만든다.
        address projectToken = IProjectTokenFactory(projectTokenFactory).deploy(
                tokenName,
                symbol,
                _totalSupply,
                project
            );
        require(projectToken != address(0), "ProjectManagerLogic1: projectToken zero");
        IProject(project).setToken(projectToken);

        // register Project
        IProjectRegistry(projectRegistry).registerProject(
            _projectId,
            project,
            startBlock,
            endBlock,
            projectToken,
            tokenName,
            symbol
        );
    }

    function payCreateProjectFee()
        public  pure returns (bool)
    {
        return true;
    }

    /// @dev Sets FLD address
    function setFLD(address _fld) public onlyOwner nonZero(_fld) {
        fld = _fld;
    }

    function setFLDRewardVault(address _fldRewardVault)
        public
        onlyOwner
        nonZero(_fldRewardVault)
    {
        require(fldRewardVault != _fldRewardVault, "ProjectManagerLogic1: same");
        fldRewardVault = _fldRewardVault;
    }
    function setAirdropVault(address _airdropVault)
        public
        onlyOwner
        nonZero(_airdropVault)
    {
        require(airdropVault != _airdropVault, "ProjectManagerLogic1: same");
        airdropVault = _airdropVault;
    }

    function setDefaultStakingPeriod(uint256 _defaultStakingPeriod)
        public
        onlyOwner
    {
        require(_defaultStakingPeriod > 0 && defaultStakingPeriod != _defaultStakingPeriod,
            "ProjectManagerLogic1: input zero"
        );

        defaultStakingPeriod = _defaultStakingPeriod;
    }

    function setDefaultAirdrop(uint256 _defaultAirdrop)
        public
        onlyOwner
    {
        require(_defaultAirdrop > 0 && defaultAirdrop != _defaultAirdrop,
            "ProjectManagerLogic1: input zero"
        );

        defaultAirdrop = _defaultAirdrop;
    }

    /// @dev Sets Stake Registry address
    function setProjectRegistry(address _projectRegistry)
        public
        onlyOwner
        nonZero(_projectRegistry)
    {
        projectRegistry = _projectRegistry;
    }

    /// @dev Sets Stake Factory address
    function setProjectFactory(address _projectFactory)
        public
        onlyOwner
        nonZero(_projectFactory)
    {
        projectFactory = _projectFactory;
    }
}
