import wallet from "../wba-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import {
    createMetadataAccountV3,
    CreateMetadataAccountV3InstructionAccounts,
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

// Define our Mint address
const MINT_ADDRESS = "5PfvFTM6Jpy4wbGh95HxEaBjqDRjCpTb9Wd47tVfTMsr";
const mint = publicKey(MINT_ADDRESS);

// Create a UMI connection
const umi = createUmi('https://api.devnet.solana.com');
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, keypair)));

(async () => {
    try {
        const metadataProgramId = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
        const metadataSeeds = [
            Buffer.from('metadata'),
            metadataProgramId.toBuffer(),
            new PublicKey(MINT_ADDRESS).toBuffer()
        ];
        const [pda] = PublicKey.findProgramAddressSync(metadataSeeds, metadataProgramId)
        const pdaUmi = publicKey(pda.toString());

        // Start here
        let accounts: CreateMetadataAccountV3InstructionAccounts = {
            metadata: pdaUmi,
            mint,
            mintAuthority: signer,
        }

        let data: DataV2Args = {
            name: 'Baliw ka UMI',
            symbol: 'BAKAUMI',
            uri: 'https://arweave.net/judvAOVJdBnulCCMH-ImLDrUl8DIziEwiONJ-J4Z6M0',
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