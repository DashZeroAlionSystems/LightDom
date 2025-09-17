// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OptimizationRegistry {
    struct Record {
        bytes32 beforeHash;
        bytes32 afterHash;
        uint256 spaceSaved;
        string url;
        uint256 timestamp;
    }

    mapping(bytes32 => Record) public records; // urlHash => record

    event OptimizationRecorded(bytes32 indexed urlHash, bytes32 beforeHash, bytes32 afterHash, uint256 spaceSaved, string url, uint256 timestamp);

    function recordOptimization(bytes32 urlHash, bytes32 beforeHash, bytes32 afterHash, uint256 spaceSaved, string calldata url) external {
        records[urlHash] = Record({
            beforeHash: beforeHash,
            afterHash: afterHash,
            spaceSaved: spaceSaved,
            url: url,
            timestamp: block.timestamp
        });
        emit OptimizationRecorded(urlHash, beforeHash, afterHash, spaceSaved, url, block.timestamp);
    }

    function getOptimization(bytes32 urlHash) external view returns (bytes32 beforeHash, bytes32 afterHash, uint256 spaceSaved, string memory url, uint256 timestamp) {
        Record memory r = records[urlHash];
        return (r.beforeHash, r.afterHash, r.spaceSaved, r.url, r.timestamp);
    }
}


