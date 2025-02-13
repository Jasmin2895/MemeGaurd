const { generateMeme } = require("./memeGenerator");
const { uploadToIpfs } = require("./ipfsUploader");
const { ethers } = require("ethers");

exports.handler = async (event) => {
  const prompt = event.prompt;
  console.log(prompt);
  const meme = await generateMeme(prompt);

  console.log(meme);
  const ipfsHash = await uploadToIpfs(meme);

  const nftContractAddress = process.env.NFT_CONTRACT_ADDRESS;
  const safeAddress = process.env.SAFE_ADDRESS;
  const privateKey = process.env.PRIVATE_KEY;
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);

  const nftABI = [
    "function safeMint(address to, uint256 tokenId, string memory uri) public",
  ];
  const nftContract = new ethers.Contract(nftContractAddress, nftABI, wallet);

  const tokenId = Date.now();

  try {
    const tx = await nftContract.safeMint(
      safeAddress,
      tokenId,
      `https://ipfs.io/ipfs/${ipfsHash}`,
      {
        gasLimit: 300000,
      }
    );
    await tx.wait();

    return {
      statusCode: 200,
      body: JSON.stringify({
        ipfsHash: ipfsHash,
        transactionHash: tx.hash,
      }),
    };
  } catch (error) {
    console.error("Error minting NFT:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to mint NFT" }),
    };
  }
};
