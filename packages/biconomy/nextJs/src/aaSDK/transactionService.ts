import { providers } from "ethers";
import { SupportedSigner, createSmartAccountClient } from "@biconomy/account";
import { MpcSdk } from "@silencelaboratories/mpc-sdk";
import { MpcSigner } from "@silencelaboratories/mpc-sdk/lib/esm/domain/signer";

export async function sendTransaction(
    recipientAddress: string,
    amount: string,
    mpcSdk: MpcSdk
) {
    const eoa = mpcSdk.accountManager.getEoa();
    if (!eoa) {
        throw new Error("Eoa not found");
    }
    const provider = new providers.JsonRpcProvider("https://rpc.sepolia.org");
    const distributedKey = mpcSdk.getDistributionKey();
    const client = new MpcSigner(
        eoa,
        distributedKey?.publicKey ?? "",
        distributedKey?.keyShareData,
        { distributedKey },
        mpcSdk,
        provider
    );

    const biconomySmartAccount = await createSmartAccountClient({
        signer: client as SupportedSigner,
        bundlerUrl: `https://bundler.biconomy.io/api/v2/11155111/${process.env.API_KEY}`,
    });

    const requestData = {
        to: recipientAddress,
        value: convertEtherToWei(amount),
    };

    try {
        const userOpResponse = await biconomySmartAccount.sendTransaction(
            requestData
        );
        const { transactionHash } = await userOpResponse.waitForTxHash();
        console.log("Transaction Hash:", transactionHash);
        const userOpReceipt = await userOpResponse.wait();
        return { userOpReceipt, transactionHash };
    } catch (error) {
        console.error("Transaction error:", error);
        return { success: false, error };
    }
}
function convertEtherToWei(etherString: string) {
    const ether = Number(etherString);
    const weiString = (ether * 1e18).toString();
    return BigInt(weiString);
}
