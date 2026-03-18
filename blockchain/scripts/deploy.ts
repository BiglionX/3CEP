const hre = require('hardhat');

async function main() {
  // 获取 ethers 对象
  const { ethers } = hre;

  console.info('========================================');
  console.info('Deploying ProductAuth Smart Contract...');
  console.info('========================================\n');

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.info(`Deployer address: ${deployer.address}`);
  console.info(
    `Deployer balance: ${(await ethers.provider.getBalance(deployer.address)).toString()} ETH\n`
  );

  // 部署 ProductAuth 合约
  const ProductAuth = await ethers.getContractFactory('ProductAuth');
  const productAuth = await ProductAuth.deploy();

  await productAuth.waitForDeployment();
  const contractAddress = await productAuth.getAddress();

  console.info('========================================');
  console.info('Contract deployed successfully!');
  console.info('========================================');
  console.info(`Contract Address: ${contractAddress}`);
  console.info(`Network: ${(await ethers.provider.getNetwork()).name}`);
  console.info(`Chain ID: ${(await ethers.provider.getNetwork()).chainId}`);
  console.info(`Block Number: ${await ethers.provider.getBlockNumber()}`);
  console.info(`Version: ${await productAuth.getVersion()}`);
  console.info('========================================\n');

  // 保存部署信息到文件
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    timestamp: new Date().toISOString(),
    version: await productAuth.getVersion(),
  };

  fs.writeFileSync(
    './deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.info('Deployment info saved to deployment-info.json');

  return deploymentInfo;
}

main()
  .then(() => {
    console.info('\nDeployment completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\nDeployment failed:');
    console.error(error);
    process.exit(1);
  });
