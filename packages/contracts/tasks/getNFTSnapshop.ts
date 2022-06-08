import { task } from "hardhat/config";
import fs from "fs";
import path from "path";
import networks from "../networks.json";

import IERC721 from "../artifacts/@openzeppelin/contracts/token/ERC721/IERC721.sol/IERC721.json";

task("get-nft-snapshot", "get NFT snapshot")
  .addParam("contractAddress", "contract address")
  .addParam("blockNumber", "blockNumber")
  .setAction(async ({ contractAddress, blockNumber }, { ethers, network }) => {
    const { name: networkName } = network;
    if (networkName !== "ethereum_mainnet") {
      return;
    }
    const { rpc } = networks[networkName];
    const provider = new ethers.providers.JsonRpcProvider(rpc);
    const contract = new ethers.Contract(
      contractAddress,
      IERC721.abi,
      provider
    );
    const transferFilter = contract.filters.Transfer(null);
    const logs = await contract.queryFilter(
      transferFilter,
      0,
      parseInt(blockNumber)
    );
    const result = {} as any;
    logs.forEach((log) => {
      const args = log.args!;
      const tokenId = args.tokenId.toString();
      const holder = args.to;
      result[tokenId] = holder;
    });
    console.log(result);
    fs.writeFileSync(
      path.join(__dirname, "snapshot.json"),
      JSON.stringify(result)
    );
  });
