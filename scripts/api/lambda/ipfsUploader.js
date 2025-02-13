const axios = require("axios");
const FormData = require("form-data");
const { PinataSDK } = require("pinata-web3");

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: "example-gateway.mypinata.cloud", // Change this if you have a dedicated gateway
});

async function uploadToIpfs(imageBuffer) {
  try {
    const file = new File([imageBuffer], "meme.png", { type: "image/png" });
    const result = await pinata.upload.file(file);
    return result.IpfsHash;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw error;
  }
}

module.exports = { uploadToIpfs };
