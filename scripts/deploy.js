const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const MemeGuardianNFT = await hre.ethers.getContractFactory("MemeGaurdian");
  const nft = await MemeGuardianNFT.deploy(deployer.address);

  await nft.waitForDeployment();

  console.log("MemeGuardianNFT deployed to:", await nft.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
