// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Metaverse Marketplace
 * @dev Marketplace for trading metaverse items (NFTs)
 * Supports listings, offers, auctions, and trading
 */
contract MetaverseMarketplace is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _listingIdCounter;
    
    // Listing types
    enum ListingType {
        FixedPrice,    // 0 - Fixed price sale
        Auction,       // 1 - Auction with bids
        Offer          // 2 - Accept offers
    }
    
    // Listing status
    enum ListingStatus {
        Active,        // 0 - Active listing
        Sold,          // 1 - Item sold
        Cancelled,     // 2 - Listing cancelled
        Expired        // 3 - Listing expired
    }
    
    // Listing structure
    struct Listing {
        uint256 listingId;
        address seller;
        address nftContract;
        uint256 itemId;
        uint256 amount;
        ListingType listingType;
        ListingStatus status;
        uint256 price;
        uint256 minBid;
        uint256 highestBid;
        address highestBidder;
        uint256 expiresAt;
        uint256 createdAt;
    }
    
    // Offer structure
    struct Offer {
        address offerer;
        uint256 amount;
        uint256 price;
        uint256 expiresAt;
        bool accepted;
    }
    
    // Mappings
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer[]) public listingOffers;
    mapping(address => uint256[]) public userListings;
    
    // Platform fee (2.5%)
    uint256 public platformFeePercent = 250; // 2.5% = 250/10000
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Supported NFT contracts
    mapping(address => bool) public supportedNFTs;
    
    // Payment token (DSH token address)
    address public paymentToken;
    
    // Events
    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        address nftContract,
        uint256 itemId,
        uint256 amount,
        ListingType listingType,
        uint256 price
    );
    
    event ListingSold(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 amount,
        uint256 price
    );
    
    event ListingCancelled(uint256 indexed listingId);
    
    event BidPlaced(
        uint256 indexed listingId,
        address indexed bidder,
        uint256 bidAmount
    );
    
    event OfferMade(
        uint256 indexed listingId,
        address indexed offerer,
        uint256 amount,
        uint256 price
    );
    
    event OfferAccepted(
        uint256 indexed listingId,
        address indexed offerer,
        uint256 amount,
        uint256 price
    );
    
    constructor(address _paymentToken) {
        paymentToken = _paymentToken;
    }
    
    /**
     * @dev Add supported NFT contract
     */
    function addSupportedNFT(address nftContract) external onlyOwner {
        supportedNFTs[nftContract] = true;
    }
    
    /**
     * @dev Remove supported NFT contract
     */
    function removeSupportedNFT(address nftContract) external onlyOwner {
        supportedNFTs[nftContract] = false;
    }
    
    /**
     * @dev Create a fixed price listing
     */
    function createListing(
        address nftContract,
        uint256 itemId,
        uint256 amount,
        uint256 price,
        uint256 duration
    ) external returns (uint256) {
        require(supportedNFTs[nftContract], "NFT contract not supported");
        require(amount > 0, "Amount must be greater than 0");
        require(price > 0, "Price must be greater than 0");
        
        // Transfer NFT to marketplace
        IERC1155(nftContract).safeTransferFrom(
            msg.sender,
            address(this),
            itemId,
            amount,
            ""
        );
        
        _listingIdCounter.increment();
        uint256 listingId = _listingIdCounter.current();
        
        listings[listingId] = Listing({
            listingId: listingId,
            seller: msg.sender,
            nftContract: nftContract,
            itemId: itemId,
            amount: amount,
            listingType: ListingType.FixedPrice,
            status: ListingStatus.Active,
            price: price,
            minBid: 0,
            highestBid: 0,
            highestBidder: address(0),
            expiresAt: block.timestamp + duration,
            createdAt: block.timestamp
        });
        
        userListings[msg.sender].push(listingId);
        
        emit ListingCreated(
            listingId,
            msg.sender,
            nftContract,
            itemId,
            amount,
            ListingType.FixedPrice,
            price
        );
        
        return listingId;
    }
    
    /**
     * @dev Create an auction listing
     */
    function createAuction(
        address nftContract,
        uint256 itemId,
        uint256 amount,
        uint256 minBid,
        uint256 duration
    ) external returns (uint256) {
        require(supportedNFTs[nftContract], "NFT contract not supported");
        require(amount > 0, "Amount must be greater than 0");
        require(minBid > 0, "Minimum bid must be greater than 0");
        
        // Transfer NFT to marketplace
        IERC1155(nftContract).safeTransferFrom(
            msg.sender,
            address(this),
            itemId,
            amount,
            ""
        );
        
        _listingIdCounter.increment();
        uint256 listingId = _listingIdCounter.current();
        
        listings[listingId] = Listing({
            listingId: listingId,
            seller: msg.sender,
            nftContract: nftContract,
            itemId: itemId,
            amount: amount,
            listingType: ListingType.Auction,
            status: ListingStatus.Active,
            price: 0,
            minBid: minBid,
            highestBid: 0,
            highestBidder: address(0),
            expiresAt: block.timestamp + duration,
            createdAt: block.timestamp
        });
        
        userListings[msg.sender].push(listingId);
        
        emit ListingCreated(
            listingId,
            msg.sender,
            nftContract,
            itemId,
            amount,
            ListingType.Auction,
            minBid
        );
        
        return listingId;
    }
    
    /**
     * @dev Buy a fixed price listing
     */
    function buyListing(uint256 listingId, uint256 amount) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.status == ListingStatus.Active, "Listing not active");
        require(listing.listingType == ListingType.FixedPrice, "Not a fixed price listing");
        require(amount <= listing.amount, "Insufficient amount available");
        require(block.timestamp < listing.expiresAt, "Listing expired");
        
        uint256 totalPrice = listing.price * amount;
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // Calculate platform fee
        uint256 platformFee = (totalPrice * platformFeePercent) / FEE_DENOMINATOR;
        uint256 sellerAmount = totalPrice - platformFee;
        
        // Update listing
        listing.amount -= amount;
        if (listing.amount == 0) {
            listing.status = ListingStatus.Sold;
        }
        
        // Transfer NFT to buyer
        IERC1155(listing.nftContract).safeTransferFrom(
            address(this),
            msg.sender,
            listing.itemId,
            amount,
            ""
        );
        
        // Transfer payment to seller
        payable(listing.seller).transfer(sellerAmount);
        
        emit ListingSold(listingId, msg.sender, amount, totalPrice);
        
        // Refund excess payment
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
    }
    
    /**
     * @dev Place a bid on an auction
     */
    function placeBid(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.status == ListingStatus.Active, "Listing not active");
        require(listing.listingType == ListingType.Auction, "Not an auction");
        require(block.timestamp < listing.expiresAt, "Auction expired");
        require(msg.value >= listing.minBid, "Bid below minimum");
        require(msg.value > listing.highestBid, "Bid not higher than current highest");
        
        // Refund previous highest bidder
        if (listing.highestBidder != address(0)) {
            payable(listing.highestBidder).transfer(listing.highestBid);
        }
        
        // Update highest bid
        listing.highestBid = msg.value;
        listing.highestBidder = msg.sender;
        
        emit BidPlaced(listingId, msg.sender, msg.value);
    }
    
    /**
     * @dev Finalize an auction
     */
    function finalizeAuction(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.status == ListingStatus.Active, "Listing not active");
        require(listing.listingType == ListingType.Auction, "Not an auction");
        require(block.timestamp >= listing.expiresAt, "Auction not ended");
        
        if (listing.highestBidder != address(0)) {
            // Calculate platform fee
            uint256 platformFee = (listing.highestBid * platformFeePercent) / FEE_DENOMINATOR;
            uint256 sellerAmount = listing.highestBid - platformFee;
            
            // Transfer NFT to winner
            IERC1155(listing.nftContract).safeTransferFrom(
                address(this),
                listing.highestBidder,
                listing.itemId,
                listing.amount,
                ""
            );
            
            // Transfer payment to seller
            payable(listing.seller).transfer(sellerAmount);
            
            listing.status = ListingStatus.Sold;
            
            emit ListingSold(listingId, listing.highestBidder, listing.amount, listing.highestBid);
        } else {
            // No bids, return NFT to seller
            IERC1155(listing.nftContract).safeTransferFrom(
                address(this),
                listing.seller,
                listing.itemId,
                listing.amount,
                ""
            );
            
            listing.status = ListingStatus.Expired;
        }
    }
    
    /**
     * @dev Make an offer on a listing
     */
    function makeOffer(
        uint256 listingId,
        uint256 amount,
        uint256 duration
    ) external payable {
        Listing storage listing = listings[listingId];
        
        require(listing.status == ListingStatus.Active, "Listing not active");
        require(amount <= listing.amount, "Amount exceeds available");
        require(msg.value > 0, "Offer must be greater than 0");
        
        listingOffers[listingId].push(Offer({
            offerer: msg.sender,
            amount: amount,
            price: msg.value,
            expiresAt: block.timestamp + duration,
            accepted: false
        }));
        
        emit OfferMade(listingId, msg.sender, amount, msg.value);
    }
    
    /**
     * @dev Accept an offer
     */
    function acceptOffer(uint256 listingId, uint256 offerIndex) external nonReentrant {
        Listing storage listing = listings[listingId];
        
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.status == ListingStatus.Active, "Listing not active");
        
        Offer storage offer = listingOffers[listingId][offerIndex];
        
        require(!offer.accepted, "Offer already accepted");
        require(block.timestamp < offer.expiresAt, "Offer expired");
        
        // Calculate platform fee
        uint256 platformFee = (offer.price * platformFeePercent) / FEE_DENOMINATOR;
        uint256 sellerAmount = offer.price - platformFee;
        
        // Update listing
        listing.amount -= offer.amount;
        if (listing.amount == 0) {
            listing.status = ListingStatus.Sold;
        }
        
        // Mark offer as accepted
        offer.accepted = true;
        
        // Transfer NFT to buyer
        IERC1155(listing.nftContract).safeTransferFrom(
            address(this),
            offer.offerer,
            listing.itemId,
            offer.amount,
            ""
        );
        
        // Transfer payment to seller
        payable(listing.seller).transfer(sellerAmount);
        
        emit OfferAccepted(listingId, offer.offerer, offer.amount, offer.price);
    }
    
    /**
     * @dev Cancel a listing
     */
    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];
        
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.status == ListingStatus.Active, "Listing not active");
        
        // Return NFT to seller
        IERC1155(listing.nftContract).safeTransferFrom(
            address(this),
            listing.seller,
            listing.itemId,
            listing.amount,
            ""
        );
        
        // Refund highest bidder if auction
        if (listing.listingType == ListingType.Auction && listing.highestBidder != address(0)) {
            payable(listing.highestBidder).transfer(listing.highestBid);
        }
        
        listing.status = ListingStatus.Cancelled;
        
        emit ListingCancelled(listingId);
    }
    
    /**
     * @dev Get listing details
     */
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }
    
    /**
     * @dev Get offers for a listing
     */
    function getOffers(uint256 listingId) external view returns (Offer[] memory) {
        return listingOffers[listingId];
    }
    
    /**
     * @dev Get user's listings
     */
    function getUserListings(address user) external view returns (uint256[] memory) {
        return userListings[user];
    }
    
    /**
     * @dev Update platform fee
     */
    function updatePlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 1000, "Fee too high"); // Max 10%
        platformFeePercent = newFeePercent;
    }
    
    /**
     * @dev Withdraw platform fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Required for receiving NFTs
     */
    function onERC1155Received(
        address,
        address,
        uint256,
        uint256,
        bytes memory
    ) public pure returns (bytes4) {
        return this.onERC1155Received.selector;
    }
    
    /**
     * @dev Required for receiving batch NFTs
     */
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public pure returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}
