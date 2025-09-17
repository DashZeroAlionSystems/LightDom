// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ModelStorageContract
 * @dev Secure storage of model training data with metadata, schema, and connections
 * @notice Only accessible to admin addresses
 */

contract ModelStorageContract {
    // Events
    event ModelDataStored(
        bytes32 indexed modelId,
        address indexed admin,
        uint256 timestamp
    );
    
    event ModelDataUpdated(
        bytes32 indexed modelId,
        address indexed admin,
        uint256 timestamp
    );
    
    event ModelDataDeleted(
        bytes32 indexed modelId,
        address indexed admin,
        uint256 timestamp
    );
    
    event AdminAdded(
        address indexed adminAddress,
        uint8 role,
        address indexed addedBy
    );
    
    event AdminRemoved(
        address indexed adminAddress,
        address indexed removedBy
    );

    // Structs
    struct ModelData {
        string dataHash;        // IPFS hash of training data
        string metadataHash;    // IPFS hash of metadata
        string schemaHash;      // IPFS hash of schema
        string connectionsHash; // IPFS hash of connections
        address[] adminAddresses; // Admin addresses with access
        uint256 timestamp;      // Creation timestamp
        bool exists;            // Whether model exists
    }

    struct AdminInfo {
        uint8 role;             // Admin role (0=super_admin, 1=admin, 2=data_admin, 3=model_admin)
        bool isActive;          // Whether admin is active
        uint256 addedAt;        // When admin was added
        address addedBy;        // Who added the admin
    }

    // State variables
    mapping(bytes32 => ModelData) public models;
    mapping(address => AdminInfo) public admins;
    bytes32[] public modelIds;
    address[] public adminAddresses;
    address public owner;
    uint256 public modelCount;

    // Role constants
    uint8 public constant SUPER_ADMIN = 0;
    uint8 public constant ADMIN = 1;
    uint8 public constant DATA_ADMIN = 2;
    uint8 public constant MODEL_ADMIN = 3;

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAdmin() {
        require(admins[msg.sender].isActive, "Only admins can call this function");
        _;
    }

    modifier onlySuperAdmin() {
        require(
            admins[msg.sender].isActive && admins[msg.sender].role == SUPER_ADMIN,
            "Only super admin can call this function"
        );
        _;
    }

    modifier modelExists(bytes32 modelId) {
        require(models[modelId].exists, "Model does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
        // Add owner as super admin
        admins[msg.sender] = AdminInfo({
            role: SUPER_ADMIN,
            isActive: true,
            addedAt: block.timestamp,
            addedBy: address(0)
        });
        adminAddresses.push(msg.sender);
    }

    /**
     * @dev Store model training data
     * @param modelId Unique identifier for the model
     * @param dataHash IPFS hash of the training data
     * @param metadataHash IPFS hash of the metadata
     * @param schemaHash IPFS hash of the schema
     * @param connectionsHash IPFS hash of the connections
     * @param adminAddresses Array of admin addresses with access
     */
    function storeModelData(
        bytes32 modelId,
        string memory dataHash,
        string memory metadataHash,
        string memory schemaHash,
        string memory connectionsHash,
        address[] memory adminAddresses
    ) external onlyAdmin {
        require(!models[modelId].exists, "Model already exists");
        require(bytes(dataHash).length > 0, "Data hash cannot be empty");
        require(bytes(metadataHash).length > 0, "Metadata hash cannot be empty");
        require(bytes(schemaHash).length > 0, "Schema hash cannot be empty");
        require(bytes(connectionsHash).length > 0, "Connections hash cannot be empty");
        require(adminAddresses.length > 0, "At least one admin address required");

        // Validate admin addresses
        for (uint256 i = 0; i < adminAddresses.length; i++) {
            require(admins[adminAddresses[i]].isActive, "Invalid admin address");
        }

        models[modelId] = ModelData({
            dataHash: dataHash,
            metadataHash: metadataHash,
            schemaHash: schemaHash,
            connectionsHash: connectionsHash,
            adminAddresses: adminAddresses,
            timestamp: block.timestamp,
            exists: true
        });

        modelIds.push(modelId);
        modelCount++;

        emit ModelDataStored(modelId, msg.sender, block.timestamp);
    }

    /**
     * @dev Get model data
     * @param modelId Unique identifier for the model
     * @return dataHash IPFS hash of the training data
     * @return metadataHash IPFS hash of the metadata
     * @return schemaHash IPFS hash of the schema
     * @return connectionsHash IPFS hash of the connections
     * @return adminAddresses Array of admin addresses with access
     */
    function getModelData(bytes32 modelId)
        external
        view
        onlyAdmin
        modelExists(modelId)
        returns (
            string memory dataHash,
            string memory metadataHash,
            string memory schemaHash,
            string memory connectionsHash,
            address[] memory adminAddresses
        )
    {
        ModelData storage model = models[modelId];
        return (
            model.dataHash,
            model.metadataHash,
            model.schemaHash,
            model.connectionsHash,
            model.adminAddresses
        );
    }

    /**
     * @dev Update model data
     * @param modelId Unique identifier for the model
     * @param dataHash New IPFS hash of the training data
     * @param metadataHash New IPFS hash of the metadata
     * @param schemaHash New IPFS hash of the schema
     * @param connectionsHash New IPFS hash of the connections
     */
    function updateModelData(
        bytes32 modelId,
        string memory dataHash,
        string memory metadataHash,
        string memory schemaHash,
        string memory connectionsHash
    ) external onlyAdmin modelExists(modelId) {
        require(bytes(dataHash).length > 0, "Data hash cannot be empty");
        require(bytes(metadataHash).length > 0, "Metadata hash cannot be empty");
        require(bytes(schemaHash).length > 0, "Schema hash cannot be empty");
        require(bytes(connectionsHash).length > 0, "Connections hash cannot be empty");

        ModelData storage model = models[modelId];
        model.dataHash = dataHash;
        model.metadataHash = metadataHash;
        model.schemaHash = schemaHash;
        model.connectionsHash = connectionsHash;

        emit ModelDataUpdated(modelId, msg.sender, block.timestamp);
    }

    /**
     * @dev Delete model data
     * @param modelId Unique identifier for the model
     */
    function deleteModelData(bytes32 modelId)
        external
        onlyAdmin
        modelExists(modelId)
    {
        models[modelId].exists = false;
        modelCount--;

        // Remove from modelIds array
        for (uint256 i = 0; i < modelIds.length; i++) {
            if (modelIds[i] == modelId) {
                modelIds[i] = modelIds[modelIds.length - 1];
                modelIds.pop();
                break;
            }
        }

        emit ModelDataDeleted(modelId, msg.sender, block.timestamp);
    }

    /**
     * @dev Add admin address
     * @param adminAddress Address to add as admin
     * @param role Admin role
     */
    function addAdmin(address adminAddress, uint8 role) external onlySuperAdmin {
        require(adminAddress != address(0), "Invalid admin address");
        require(role <= MODEL_ADMIN, "Invalid role");
        require(!admins[adminAddress].isActive, "Admin already exists");

        admins[adminAddress] = AdminInfo({
            role: role,
            isActive: true,
            addedAt: block.timestamp,
            addedBy: msg.sender
        });

        adminAddresses.push(adminAddress);

        emit AdminAdded(adminAddress, role, msg.sender);
    }

    /**
     * @dev Remove admin address
     * @param adminAddress Address to remove from admins
     */
    function removeAdmin(address adminAddress) external onlySuperAdmin {
        require(admins[adminAddress].isActive, "Admin does not exist");
        require(adminAddress != owner, "Cannot remove owner");

        admins[adminAddress].isActive = false;

        // Remove from adminAddresses array
        for (uint256 i = 0; i < adminAddresses.length; i++) {
            if (adminAddresses[i] == adminAddress) {
                adminAddresses[i] = adminAddresses[adminAddresses.length - 1];
                adminAddresses.pop();
                break;
            }
        }

        emit AdminRemoved(adminAddress, msg.sender);
    }

    /**
     * @dev Check if address is admin
     * @param adminAddress Address to check
     * @return isAdmin Whether address is admin
     */
    function isAdmin(address adminAddress) external view returns (bool isAdmin) {
        return admins[adminAddress].isActive;
    }

    /**
     * @dev Get admin role
     * @param adminAddress Address to check
     * @return role Admin role
     */
    function getAdminRole(address adminAddress) external view returns (uint8 role) {
        require(admins[adminAddress].isActive, "Admin does not exist");
        return admins[adminAddress].role;
    }

    /**
     * @dev Get model count
     * @return count Number of models
     */
    function getModelCount() external view returns (uint256 count) {
        return modelCount;
    }

    /**
     * @dev Get all model IDs
     * @return ids Array of model IDs
     */
    function getModelIds() external view returns (bytes32[] memory ids) {
        return modelIds;
    }

    /**
     * @dev Get model by index
     * @param index Index in the modelIds array
     * @return modelId Model ID
     * @return dataHash IPFS hash of the training data
     * @return metadataHash IPFS hash of the metadata
     * @return schemaHash IPFS hash of the schema
     * @return connectionsHash IPFS hash of the connections
     * @return adminAddresses Array of admin addresses with access
     */
    function getModelByIndex(uint256 index)
        external
        view
        onlyAdmin
        returns (
            bytes32 modelId,
            string memory dataHash,
            string memory metadataHash,
            string memory schemaHash,
            string memory connectionsHash,
            address[] memory adminAddresses
        )
    {
        require(index < modelIds.length, "Index out of bounds");
        modelId = modelIds[index];
        ModelData storage model = models[modelId];
        return (
            modelId,
            model.dataHash,
            model.metadataHash,
            model.schemaHash,
            model.connectionsHash,
            model.adminAddresses
        );
    }

    /**
     * @dev Get all admin addresses
     * @return addresses Array of admin addresses
     */
    function getAllAdminAddresses() external view onlyAdmin returns (address[] memory addresses) {
        return adminAddresses;
    }

    /**
     * @dev Get admin info
     * @param adminAddress Address to check
     * @return role Admin role
     * @return isActive Whether admin is active
     * @return addedAt When admin was added
     * @return addedBy Who added the admin
     */
    function getAdminInfo(address adminAddress)
        external
        view
        onlyAdmin
        returns (
            uint8 role,
            bool isActive,
            uint256 addedAt,
            address addedBy
        )
    {
        AdminInfo storage admin = admins[adminAddress];
        return (admin.role, admin.isActive, admin.addedAt, admin.addedBy);
    }

    /**
     * @dev Check if model exists
     * @param modelId Model ID to check
     * @return exists Whether model exists
     */
    function modelExists(bytes32 modelId) external view returns (bool exists) {
        return models[modelId].exists;
    }

    /**
     * @dev Get model timestamp
     * @param modelId Model ID
     * @return timestamp Creation timestamp
     */
    function getModelTimestamp(bytes32 modelId)
        external
        view
        onlyAdmin
        modelExists(modelId)
        returns (uint256 timestamp)
    {
        return models[modelId].timestamp;
    }

    /**
     * @dev Get model admin addresses
     * @param modelId Model ID
     * @return adminAddresses Array of admin addresses with access
     */
    function getModelAdminAddresses(bytes32 modelId)
        external
        view
        onlyAdmin
        modelExists(modelId)
        returns (address[] memory adminAddresses)
    {
        return models[modelId].adminAddresses;
    }

    /**
     * @dev Check if address has access to model
     * @param modelId Model ID
     * @param adminAddress Address to check
     * @return hasAccess Whether address has access
     */
    function hasModelAccess(bytes32 modelId, address adminAddress)
        external
        view
        onlyAdmin
        modelExists(modelId)
        returns (bool hasAccess)
    {
        address[] memory modelAdmins = models[modelId].adminAddresses;
        for (uint256 i = 0; i < modelAdmins.length; i++) {
            if (modelAdmins[i] == adminAddress) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Get contract statistics
     * @return totalModels Total number of models
     * @return totalAdmins Total number of admins
     * @return contractBalance Contract balance in wei
     */
    function getContractStats()
        external
        view
        onlyAdmin
        returns (
            uint256 totalModels,
            uint256 totalAdmins,
            uint256 contractBalance
        )
    {
        return (modelCount, adminAddresses.length, address(this).balance);
    }

    /**
     * @dev Emergency pause function (only owner)
     */
    function pause() external onlyOwner {
        // Implementation would pause the contract
        // This is a placeholder for emergency functionality
    }

    /**
     * @dev Emergency unpause function (only owner)
     */
    function unpause() external onlyOwner {
        // Implementation would unpause the contract
        // This is a placeholder for emergency functionality
    }

    /**
     * @dev Transfer ownership
     * @param newOwner New owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        owner = newOwner;
    }

    /**
     * @dev Fallback function to receive ETH
     */
    receive() external payable {}

    /**
     * @dev Fallback function
     */
    fallback() external payable {}
}
