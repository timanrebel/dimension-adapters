import { ChainBlocks, FetchOptions, SimpleAdapter } from "../adapters/types";
import { CHAIN } from "../helpers/chains";

const contract_address = '0x0a2af931effd34b81ebcc57e3d3c9b1e1de1c9ce';
const usdt = 'tether'
const event_order_settled = 'event OrderSettled(uint128 indexed marketId,uint128 indexed accountId,uint256 fillPrice,int256 pnl,int256 accruedFunding,int128 sizeDelta,int128 newSize,uint256 totalFees,uint256 referralFees,uint256 collectedFees,uint256 settlementReward,bytes32 indexed trackingCode,address settler)'
const fetchFees = async (timestamp: number, _: ChainBlocks, options: FetchOptions) => {
  const dailyFees = options.createBalances();
  const dailyRevenue = options.createBalances();
  const dailyHoldersRevenue = options.createBalances();
  const dailySupplySideRevenue = options.createBalances();
  const logs = await options.getLogs({
    target: contract_address,
    eventAbi: event_order_settled
  });

  logs.forEach((log: any) => {
    const totalFees = Number(log.totalFees)
    const collectedFees = Number(log.collectedFees)
    const referralFees = Number(log.referralFees)
    const settlementReward = Number(log.settlementReward)
    dailyFees.addCGToken(usdt, totalFees/1e18)
    dailyRevenue.addCGToken(usdt, collectedFees/1e18)
    dailyHoldersRevenue.addCGToken(usdt, collectedFees/1e18)
    const supplySideRevenue = Number(totalFees) - Number(collectedFees) - Number(referralFees) - Number(settlementReward)
    dailySupplySideRevenue.addCGToken(usdt, supplySideRevenue/1e18)
  });

  return {
    dailyFees: dailyFees,
    dailyRevenue: dailyRevenue,
    dailyHoldersRevenue: dailyHoldersRevenue,
    dailySupplySideRevenue: dailySupplySideRevenue,
    timestamp
  }
}

const adapters: SimpleAdapter = {
  adapter: {
    [CHAIN.BASE]: {
      fetch: fetchFees,
      start: '2024-01-13',
    },
  }
}
export default adapters
