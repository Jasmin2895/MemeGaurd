const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  const MemeGuardianNFT = await hre.ethers.getContractFactory("MemeGaurdian");
  const nft = await MemeGuardianNFT.deploy(deployer.address);

  await nft.waitForDeployment();

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
