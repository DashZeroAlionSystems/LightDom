// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./StorageContract.sol";
import "./StorageToken.sol";

/**
 * @title HostManager
 * @dev Manages host registration, reputation, and performance tracking
 * @notice This contract handles host lifecycle and quality management
 */
contract HostManager is Ownable, ReentrancyGuard {
    StorageContract public immutable storageContract;
    StorageToken public immutable storageToken;
    
    // Host status
    enum HostStatus { Inactive, Active, Suspended, Banned }
    
    // Host information
    struct HostDetails {
        address hostAddress;
        string name;
        string description;
        string location;
        uint256 totalStorage; // in bytes
        uint256 availableStorage; // in bytes
        uint256 pricePerGBPerMonth; // in wei
        HostStatus status;
        uint256 reputation;
        uint256 totalContracts;
        uint256 successfulContracts;
        uint256 failedContracts;
        uint256 uptime; // in seconds
        uint256 lastSeen;
        uint256 registrationTime;
        bool isVerified;
        mapping(string => bool) supportedRegions;
    }
    
    // Host performance metrics
    struct HostMetrics {
        uint256 averageResponseTime; // in milliseconds
        uint256 dataIntegrityScore; // 0-100
        uint256 availabilityScore; // 0-100
        uint256 customerSatisfactionScore; // 0-100
        uint256 totalDataStored; // in bytes
        uint256 totalDataRetrieved; // in bytes
        uint256 lastUpdated;
    }
    
    // Host requirements
    struct HostRequirements {
        uint256 minReputation;
        uint256 minUptime;
        uint256 maxPricePerGBPerMonth;
        uint256 minStorageCapacity;
        bool requireVerification;
    }
    
    // State variables
    mapping(address => HostDetails) public hosts;
    mapping(address => HostMetrics) public hostMetrics;
    mapping(address => bool) public isHost;
    mapping(string => address[]) public hostsByRegion;
    mapping(address => string[]) public hostRegions;
    
    address[] public allHosts;
    HostRequirements public hostRequirements;
    
    // Events
    event HostRegistered(address indexed host, string name, uint256 totalStorage, uint256 pricePerGBPerMonth);
    event HostUpdated(address indexed host, string name, uint256 pricePerGBPerMonth);
    event HostStatusChanged(address indexed host, HostStatus oldStatus, HostStatus newStatus);
    event HostSuspended(address indexed host, string reason);
    event HostBanned(address indexed host, string reason);
    event HostVerified(address indexed host);
    event HostMetricsUpdated(address indexed host, HostMetrics metrics);
    event HostRequirementsUpdated(HostRequirements newRequirements);
    
    // Modifiers
    modifier onlyHost() {
        require(isHost[msg.sender], "Not a registered host");
        _;
    }
    
    modifier hostExists(address host) {
        require(isHost[host], "Host does not exist");
        _;
    }
    
    modifier onlyActiveHost() {
        require(isHost[msg.sender], "Not a registered host");
        require(hosts[msg.sender].status == HostStatus.Active, "Host not active");
        _;
    }
    
    constructor(address _storageContract, address _storageToken) {
        storageContract = StorageContract(_storageContract);
        storageToken = StorageToken(_storageToken);
        
        // Set default host requirements
        hostRequirements = HostRequirements({
            minReputation: 50,
            minUptime: 30 days,
            maxPricePerGBPerMonth: 1000 * 10**18, // 1000 tokens per GB per month
            minStorageCapacity: 100 * 1024 * 1024 * 1024, // 100 GB
            requireVerification: false
        });
    }
    
    /**
     * @dev Register a new host
     * @param name Host name
     * @param description Host description
     * @param location Host location
     * @param totalStorage Total storage capacity in bytes
     * @param pricePerGBPerMonth Price per GB per month in wei
     * @param regions Supported regions
     */
    function registerHost(
        string memory name,
        string memory description,
        string memory location,
        uint256 totalStorage,
        uint256 pricePerGBPerMonth,
        string[] memory regions
    ) external nonReentrant {
        require(!isHost[msg.sender], "Host already registered");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(totalStorage >= hostRequirements.minStorageCapacity, "Insufficient storage capacity");
        require(pricePerGBPerMonth <= hostRequirements.maxPricePerGBPerMonth, "Price too high");
        require(regions.length > 0, "Must support at least one region");
        
        // Create host details
        HostDetails storage host = hosts[msg.sender];
        host.hostAddress = msg.sender;
        host.name = name;
        host.description = description;
        host.location = location;
        host.totalStorage = totalStorage;
        host.availableStorage = totalStorage;
        host.pricePerGBPerMonth = pricePerGBPerMonth;
        host.status = HostStatus.Active;
        host.reputation = 100; // Start with 100 reputation
        host.totalContracts = 0;
        host.successfulContracts = 0;
        host.failedContracts = 0;
        host.uptime = 0;
        host.lastSeen = block.timestamp;
        host.registrationTime = block.timestamp;
        host.isVerified = false;
        
        // Add supported regions
        for (uint256 i = 0; i < regions.length; i++) {
            host.supportedRegions[regions[i]] = true;
            hostsByRegion[regions[i]].push(msg.sender);
            hostRegions[msg.sender].push(regions[i]);
        }
        
        isHost[msg.sender] = true;
        allHosts.push(msg.sender);
        
        emit HostRegistered(msg.sender, name, totalStorage, pricePerGBPerMonth);
    }
    
    /**
     * @dev Update host information
     * @param name New host name
     * @param description New host description
     * @param pricePerGBPerMonth New price per GB per month
     * @param regions New supported regions
     */
    function updateHostInfo(
        string memory name,
        string memory description,
        uint256 pricePerGBPerMonth,
        string[] memory regions
    ) external onlyHost {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(pricePerGBPerMonth <= hostRequirements.maxPricePerGBPerMonth, "Price too high");
        
        HostDetails storage host = hosts[msg.sender];
        host.name = name;
        host.description = description;
        host.pricePerGBPerMonth = pricePerGBPerMonth;
        
        // Update regions
        for (uint256 i = 0; i < hostRegions[msg.sender].length; i++) {
            string memory region = hostRegions[msg.sender][i];
            host.supportedRegions[region] = false;
        }
        
        delete hostRegions[msg.sender];
        
        for (uint256 i = 0; i < regions.length; i++) {
            host.supportedRegions[regions[i]] = true;
            hostRegions[msg.sender].push(regions[i]);
        }
        
        emit HostUpdated(msg.sender, name, pricePerGBPerMonth);
    }
    
    /**
     * @dev Update host metrics
     * @param host Host address
     * @param averageResponseTime Average response time in milliseconds
     * @param dataIntegrityScore Data integrity score (0-100)
     * @param availabilityScore Availability score (0-100)
     * @param customerSatisfactionScore Customer satisfaction score (0-100)
     * @param totalDataStored Total data stored in bytes
     * @param totalDataRetrieved Total data retrieved in bytes
     */
    function updateHostMetrics(
        address host,
        uint256 averageResponseTime,
        uint256 dataIntegrityScore,
        uint256 availabilityScore,
        uint256 customerSatisfactionScore,
        uint256 totalDataStored,
        uint256 totalDataRetrieved
    ) external onlyOwner hostExists(host) {
        require(dataIntegrityScore <= 100, "Invalid data integrity score");
        require(availabilityScore <= 100, "Invalid availability score");
        require(customerSatisfactionScore <= 100, "Invalid customer satisfaction score");
        
        HostMetrics storage metrics = hostMetrics[host];
        metrics.averageResponseTime = averageResponseTime;
        metrics.dataIntegrityScore = dataIntegrityScore;
        metrics.availabilityScore = availabilityScore;
        metrics.customerSatisfactionScore = customerSatisfactionScore;
        metrics.totalDataStored = totalDataStored;
        metrics.totalDataRetrieved = totalDataRetrieved;
        metrics.lastUpdated = block.timestamp;
        
        // Update host reputation based on metrics
        uint256 newReputation = (dataIntegrityScore + availabilityScore + customerSatisfactionScore) / 3;
        hosts[host].reputation = newReputation;
        
        emit HostMetricsUpdated(host, metrics);
    }
    
    /**
     * @dev Update host uptime
     * @param uptime New uptime in seconds
     */
    function updateHostUptime(uint256 uptime) external onlyActiveHost {
        hosts[msg.sender].uptime = uptime;
        hosts[msg.sender].lastSeen = block.timestamp;
    }
    
    /**
     * @dev Suspend a host
     * @param host Host address to suspend
     * @param reason Reason for suspension
     */
    function suspendHost(address host, string memory reason) external onlyOwner hostExists(host) {
        HostStatus oldStatus = hosts[host].status;
        hosts[host].status = HostStatus.Suspended;
        
        emit HostStatusChanged(host, oldStatus, HostStatus.Suspended);
        emit HostSuspended(host, reason);
    }
    
    /**
     * @dev Ban a host
     * @param host Host address to ban
     * @param reason Reason for ban
     */
    function banHost(address host, string memory reason) external onlyOwner hostExists(host) {
        HostStatus oldStatus = hosts[host].status;
        hosts[host].status = HostStatus.Banned;
        
        emit HostStatusChanged(host, oldStatus, HostStatus.Banned);
        emit HostBanned(host, reason);
    }
    
    /**
     * @dev Verify a host
     * @param host Host address to verify
     */
    function verifyHost(address host) external onlyOwner hostExists(host) {
        hosts[host].isVerified = true;
        emit HostVerified(host);
    }
    
    /**
     * @dev Update host requirements
     * @param newRequirements New host requirements
     */
    function updateHostRequirements(HostRequirements memory newRequirements) external onlyOwner {
        require(newRequirements.minReputation > 0, "Invalid min reputation");
        require(newRequirements.minUptime > 0, "Invalid min uptime");
        require(newRequirements.maxPricePerGBPerMonth > 0, "Invalid max price");
        require(newRequirements.minStorageCapacity > 0, "Invalid min storage capacity");
        
        hostRequirements = newRequirements;
        emit HostRequirementsUpdated(newRequirements);
    }
    
    /**
     * @dev Get host details
     * @param host Host address
     * @return name, description, location, totalStorage, availableStorage, pricePerGBPerMonth, status, reputation, totalContracts, successfulContracts, failedContracts, uptime, lastSeen, registrationTime, isVerified
     */
    function getHostDetails(address host) 
        external 
        view 
        hostExists(host) 
        returns (
            string memory name,
            string memory description,
            string memory location,
            uint256 totalStorage,
            uint256 availableStorage,
            uint256 pricePerGBPerMonth,
            HostStatus status,
            uint256 reputation,
            uint256 totalContracts,
            uint256 successfulContracts,
            uint256 failedContracts,
            uint256 uptime,
            uint256 lastSeen,
            uint256 registrationTime,
            bool isVerified
        ) 
    {
        HostDetails storage hostData = hosts[host];
        return (
            hostData.name,
            hostData.description,
            hostData.location,
            hostData.totalStorage,
            hostData.availableStorage,
            hostData.pricePerGBPerMonth,
            hostData.status,
            hostData.reputation,
            hostData.totalContracts,
            hostData.successfulContracts,
            hostData.failedContracts,
            hostData.uptime,
            hostData.lastSeen,
            hostData.registrationTime,
            hostData.isVerified
        );
    }
    
    /**
     * @dev Get host metrics
     * @param host Host address
     * @return averageResponseTime, dataIntegrityScore, availabilityScore, customerSatisfactionScore, totalDataStored, totalDataRetrieved, lastUpdated
     */
    function getHostMetrics(address host) 
        external 
        view 
        hostExists(host) 
        returns (
            uint256 averageResponseTime,
            uint256 dataIntegrityScore,
            uint256 availabilityScore,
            uint256 customerSatisfactionScore,
            uint256 totalDataStored,
            uint256 totalDataRetrieved,
            uint256 lastUpdated
        ) 
    {
        HostMetrics storage metrics = hostMetrics[host];
        return (
            metrics.averageResponseTime,
            metrics.dataIntegrityScore,
            metrics.availabilityScore,
            metrics.customerSatisfactionScore,
            metrics.totalDataStored,
            metrics.totalDataRetrieved,
            metrics.lastUpdated
        );
    }
    
    /**
     * @dev Get hosts by region
     * @param region Region name
     * @return Array of host addresses
     */
    function getHostsByRegion(string memory region) external view returns (address[] memory) {
        return hostsByRegion[region];
    }
    
    /**
     * @dev Get host regions
     * @param host Host address
     * @return Array of region names
     */
    function getHostRegions(address host) external view hostExists(host) returns (string[] memory) {
        return hostRegions[host];
    }
    
    /**
     * @dev Check if host supports a region
     * @param host Host address
     * @param region Region name
     * @return Whether the host supports the region
     */
    function hostSupportsRegion(address host, string memory region) 
        external 
        view 
        hostExists(host) 
        returns (bool) 
    {
        return hosts[host].supportedRegions[region];
    }
    
    /**
     * @dev Get all hosts
     * @return Array of all host addresses
     */
    function getAllHosts() external view returns (address[] memory) {
        return allHosts;
    }
    
    /**
     * @dev Get active hosts
     * @return Array of active host addresses
     */
    function getActiveHosts() external view returns (address[] memory) {
        address[] memory activeHosts = new address[](0);
        uint256 count = 0;
        
        for (uint256 i = 0; i < allHosts.length; i++) {
            if (hosts[allHosts[i]].status == HostStatus.Active) {
                count++;
            }
        }
        
        activeHosts = new address[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allHosts.length; i++) {
            if (hosts[allHosts[i]].status == HostStatus.Active) {
                activeHosts[index] = allHosts[i];
                index++;
            }
        }
        
        return activeHosts;
    }
    
    /**
     * @dev Get host requirements
     * @return Current host requirements
     */
    function getHostRequirements() external view returns (HostRequirements memory) {
        return hostRequirements;
    }
    
    /**
     * @dev Get host count
     * @return Total number of hosts
     */
    function getHostCount() external view returns (uint256) {
        return allHosts.length;
    }
    
    /**
     * @dev Get active host count
     * @return Number of active hosts
     */
    function getActiveHostCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < allHosts.length; i++) {
            if (hosts[allHosts[i]].status == HostStatus.Active) {
                count++;
            }
        }
        return count;
    }
}