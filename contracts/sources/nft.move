module nero_protocol::nft {
    use std::signer;
    use std::string::{Self, String};
    use aptos_framework::event;

    /// NFT Collection Name
    const COLLECTION_NAME: vector<u8> = b"Nero AI Chatbot NFTs";
    const COLLECTION_DESCRIPTION: vector<u8> = b"AI-powered chatbot NFTs for learning and interaction";

    /// Error Codes
    const E_NOT_COLLECTION_OWNER: u64 = 1;
    const E_TOKEN_NOT_FOUND: u64 = 2;
    const E_INVALID_PRICE: u64 = 3;

    /// NFT Metadata Struct
    struct NFTMetadata has store, drop {
        name: String,
        description: String,
        image_uri: String,
        admin_address: address,
        price_per_question_move: u64,
        price_per_question_usdt: u64,
        price_per_question_usdc: u64,
    }

    /// NFT Collection Owner
    struct CollectionOwner has key {
        admin: address,
    }

    /// NFT Minting Event
    #[event]
    struct MintEvent has drop, store {
        token_id: String,
        minter: address,
        admin_address: address,
    }

    /// Payment Event
    #[event]
    struct PaymentEvent has drop, store {
        token_id: String,
        payer: address,
        amount: u64,
        token_type: String,
    }

    /// Initialize Collection
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        move_to(admin, CollectionOwner {
            admin: admin_addr,
        });

        event::emit(MintEvent {
            token_id: string::utf8(b"collection_initialized"),
            minter: admin_addr,
            admin_address: admin_addr,
        });
    }

    /// Create NFT (Admin only)
    public entry fun create_nft(
        admin: &signer,
        token_name: String,
        token_description: String,
        image_uri: String,
        price_per_question_move: u64,
        price_per_question_usdt: u64,
        price_per_question_usdc: u64,
    ) acquires CollectionOwner {
        let admin_addr = signer::address_of(admin);
        let owner = borrow_global<CollectionOwner>(admin_addr);
        
        assert!(owner.admin == admin_addr, E_NOT_COLLECTION_OWNER);

        event::emit(MintEvent {
            token_id: token_name,
            minter: admin_addr,
            admin_address: admin_addr,
        });
    }

    /// Mint NFT (Regular user)
    public entry fun mint_nft(
        minter: &signer,
        token_name: String,
    ) {
        let minter_addr = signer::address_of(minter);
        
        event::emit(MintEvent {
            token_id: token_name,
            minter: minter_addr,
            admin_address: minter_addr,
        });
    }

    /// Process Payment
    public entry fun process_payment(
        payer: &signer,
        token_id: String,
        amount: u64,
        token_type: String,
    ) {
        let payer_addr = signer::address_of(payer);
        
        event::emit(PaymentEvent {
            token_id,
            payer: payer_addr,
            amount,
            token_type,
        });
    }
}
