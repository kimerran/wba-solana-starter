import wallet from "../wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import {
    createMetadataAccountV3,
    CreateMetadataAccountV3InstructionAccounts,
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";

// Define our Mint address
const mint = publicKey("5txD3zoTHDjtTo5FHpkiSBVSHs8GnSiCAwFAnhZsyeZg")

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

(async () => {
    try {
        // Start here
        let accounts: CreateMetadataAccountV3InstructionAccounts = {
            mint,
            mintAuthority: signer,
        }

        let data: DataV2Args = {
            name: 'My Awesome Token',
            symbol: 'MAT',
            uri: 'https://example.com',
            sellerFeeBasisPoints: 10000,
            creators: [
                {
                    address: keypair.publicKey,
                    verified: true,
                    share: 100
                }
            ],
            collection: null,
            uses: null,
        }

        let args: CreateMetadataAccountV3InstructionArgs = {
            data,
            isMutable: true,
            collectionDetails: {
                size: 1,
                __kind: 'V1'
            }
        }

        let tx = createMetadataAccountV3(
            umi,
            {
                ...accounts,
                ...args
            }
        )

        let result = await tx.sendAndConfirm(umi).then(r => r.signature.toString());
        console.log(result);
    } catch (e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();