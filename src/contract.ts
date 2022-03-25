import { LCDClient, MsgExecuteContract } from '@terra-money/terra.js';
import { AccAddress } from '@terra-money/terra.js/dist/core/bech32';
import { Coins } from '@terra-money/terra.js/dist/core/Coins';

export enum BetDirection {
  Up = 'up',
  Dn = 'dn'
}

export enum MarketStatus {
  Closed = 'closed',
  Open = 'open',
  Paused = 'paused'
}

export enum RoundStatus {
  Open = 'open',
  Locked = 'locked',
  Closed = 'closed',
  Canceled = 'canceled'
}

export enum BetsToReturn {
  All = 'all',
  ToClaim = 'to_claim',
  Claimed = 'claimed'
}

export enum OrderBy {
  Asc = "asc",
  Desc = "desc",
}

export interface BetCounters {
  loss: number;
  refund: number;
  won: number;
}

export interface BetResults {
  loss: string;
  refund: string;
  won: string;
}

export interface BetInfoResponse {
  address: string;
  amount: string;
  claimed: boolean;
  direction: BetDirection | undefined;
  is_claimable: boolean;
  results: BetResults;
  round: RoundResponse | undefined;
}

export interface BetHistoryResponse {
  bets: BetInfoResponse[];
}

export interface BetStatsResponse {
  amount_played: string;
  amount_to_claim: string;
  counters: BetCounters;
  results: BetResults;
  rounds_claimed: number[];
  rounds_played: number;
  rounds_to_claim: number[];
  rounds_unfinished: number;
  unfinished_amount: string;
}

export interface ConfigResponse {
  asset: string;
  denom: string;
  description: string;
  interval: number;
  min_bet: string;
  tax: string;
  owner: string;
  symbol: string;
  treasury: string;
}

export interface MarketResponse {
  closed_round_id: number;
  locked_round_id: number;
  open_round_id: number;
  status: MarketStatus;
}

export interface RoundPayouts {
  up: string;
  dn: string;
  pool: string;
}

export interface RoundResponse {
  close_height: number;
  close_time: number;
  close_price: string;
  expected_close_time: number;
  expected_lock_time: number;
  lock_height: number;
  lock_time: number;
  lock_price: string;
  open_height: number;
  open_time: number;
  payouts: RoundPayouts;
  status: RoundStatus;
}

export interface RoundHistoryResponse {
  rounds: RoundResponse[];
}

export class TerraMarketsContract {
  constructor(public contractAddress: AccAddress) {
  }

  fabricateCloseMarket() {
    return { close_market: {} };
  }

  fabricateOpenMarket() {
    return { open_market: {} };
  }

  fabricatePauseMarket() {
    return { pause_market: {} };
  }

  fabricateNextRound(
    lock_height: number,
    lock_time: number,
    lock_price: string,
    close_height: number,
    close_time: number,
    close_price: string,
    open_new: boolean
  ) {
    return {
      next_round: {
        lock_height,
        lock_time,
        lock_price,
        close_height,
        close_time,
        close_price,
        open_new
      }
    };
  }

  fabricateCancelRound(round_id: number) {
    return { cancel_round: { round_id } };
  }

  fabricateUpdateConfig(owner: string | undefined, tax: string | undefined, min_bet: string | undefined) {
    return { update_config: { owner, tax, min_bet } };
  }

  fabricateBet(round_id: number, amount: string, direction: BetDirection) {
    return { bet: { round_id, amount, direction } };
  }

  fabricateClaim(rounds: number[]) {
    return { claim: { rounds } };
  }

  // Queries
  fabricateQueryBetInfo(address: string, round_id: number) {
    return { bet_info: { address, round_id } };
  }

  fabricateQueryBetHistory(
    address: string,
    bets_to_return: BetsToReturn | undefined,
    rounds_before: number | undefined,
    limit: number | undefined
  ) {
    return { bet_history: { address, bets_to_return, rounds_before, limit } };
  }

  fabricateQueryBetStats(address: string) {
    return { bet_stats: { address } };
  }

  fabricateQueryConfig() {
    return { config: {} };
  }

  fabricateQueryMarket() {
    return { market: {} };
  }

  fabricateQueryRound(round_id: number) {
    return { round: { round_id } };
  }

  fabricateQueryRoundHistory(
    rounds_after: number | undefined,
    limit: number | undefined,
    order: OrderBy | undefined,
  ) {
    return { round_history: { rounds_after, limit, order } };
  }

  executeCloseMarket(accAddress: string): MsgExecuteContract {
    return new MsgExecuteContract(accAddress, this.contractAddress, this.fabricateCloseMarket());
  }

  executeOpenMarket(accAddress: string): MsgExecuteContract {
    return new MsgExecuteContract(accAddress, this.contractAddress, this.fabricateOpenMarket());
  }

  executePauseMarket(accAddress: string): MsgExecuteContract {
    return new MsgExecuteContract(accAddress, this.contractAddress, this.fabricatePauseMarket());
  }

  executeNextRound(
    accAddress: string,
    lock_height: number,
    lock_time: number,
    lock_price: string,
    close_height: number,
    close_time: number,
    close_price: string,
    open_new: boolean
  ): MsgExecuteContract {
    return new MsgExecuteContract(
      accAddress,
      this.contractAddress,
      this.fabricateNextRound(lock_height, lock_time, lock_price, close_height, close_time, close_price, open_new)
    );
  }

  executeCancelRound(accAddress: string, round_id: number): MsgExecuteContract {
    return new MsgExecuteContract(accAddress, this.contractAddress, this.fabricateCancelRound(round_id));
  }

  executeUpdateConfig(
    accAddress: string,
    owner: string | undefined,
    tax: string | undefined,
    min_bet: string | undefined
  ): MsgExecuteContract {
    return new MsgExecuteContract(accAddress, this.contractAddress, this.fabricateUpdateConfig(owner, tax, min_bet));
  }

  executeBet(
    accAddress: string,
    round_id: number,
    amount: string,
    direction: BetDirection,
    coins: Coins.Input
  ): MsgExecuteContract {
    return new MsgExecuteContract(
      accAddress,
      this.contractAddress,
      this.fabricateBet(round_id, amount, direction),
      coins
    );
  }

  executeClaim(accAddress: string, rounds: number[]): MsgExecuteContract {
    return new MsgExecuteContract(accAddress, this.contractAddress, this.fabricateClaim(rounds));
  }

  async queryBetInfo(lcdClient: LCDClient, address: string, round_id: number): Promise<BetInfoResponse> {
    return await lcdClient.wasm.contractQuery(this.contractAddress, this.fabricateQueryBetInfo(address, round_id));
  }

  async queryBetHistory(
    lcdClient: LCDClient,
    address: string,
    bets_to_return: BetsToReturn | undefined,
    rounds_before: number | undefined,
    limit: number | undefined
  ): Promise<BetHistoryResponse> {
    return await lcdClient.wasm.contractQuery(
      this.contractAddress,
      this.fabricateQueryBetHistory(address, bets_to_return, rounds_before, limit)
    );
  }

  async queryBetStats(lcdClient: LCDClient, address: string): Promise<BetStatsResponse> {
    return await lcdClient.wasm.contractQuery(this.contractAddress, this.fabricateQueryBetStats(address));
  }

  async queryConfig(lcdClient: LCDClient): Promise<ConfigResponse> {
    return await lcdClient.wasm.contractQuery(this.contractAddress, this.fabricateQueryConfig());
  }

  async queryMarket(lcdClient: LCDClient): Promise<MarketResponse> {
    return await lcdClient.wasm.contractQuery(this.contractAddress, this.fabricateQueryMarket());
  }

  async queryRound(lcdClient: LCDClient, round_id: number): Promise<RoundResponse> {
    return await lcdClient.wasm.contractQuery(this.contractAddress, this.fabricateQueryRound(round_id));
  }

  async queryRoundHistory(
    lcdClient: LCDClient,
    rounds_after: number | undefined,
    limit: number | undefined,
    order: OrderBy | undefined,
  ): Promise<BetHistoryResponse> {
    return await lcdClient.wasm.contractQuery(
      this.contractAddress,
      this.fabricateQueryRoundHistory(rounds_after, limit, order)
    );
  }
}

