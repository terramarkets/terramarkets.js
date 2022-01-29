import { MsgExecuteContract, Wallet } from '@terra-money/terra.js';
import { AccAddress } from '@terra-money/terra.js/dist/core/bech32';

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

export interface BetInfoResponse {
  address: string;
  amount: string;
  amount_won: string;
  claimed: boolean;
  direction: BetDirection | undefined;
  is_claimable: boolean;
  round: RoundResponse | undefined;
}

export interface BetHistoryResponse {
  bets: BetInfoResponse[];
}

export interface BetStatsResponse {
  amount_played: string;
  amount_to_claim: string;
  amount_refunded: string;
  amount_won: string;
  rounds_claimed: number[];
  rounds_played: number;
  rounds_to_claim: number[];
  rounds_won: number;
  rounds_refunded: number;
}

export interface ConfigResponse {
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

export class TerraMarketsContract {
  constructor(public contractAddress: AccAddress) {}

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

  fabricateQueryBetHistory(address: string, round_before: number | undefined, limit: number | undefined) {
    return { bet_history: { address, round_before, limit } };
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

  executeCloseMarket(wallet: Wallet): MsgExecuteContract {
    return new MsgExecuteContract(wallet.key.accAddress, this.contractAddress, this.fabricateCloseMarket());
  }

  executeOpenMarket(wallet: Wallet): MsgExecuteContract {
    return new MsgExecuteContract(wallet.key.accAddress, this.contractAddress, this.fabricateOpenMarket());
  }

  executePauseMarket(wallet: Wallet): MsgExecuteContract {
    return new MsgExecuteContract(wallet.key.accAddress, this.contractAddress, this.fabricatePauseMarket());
  }

  executeNextRound(
    wallet: Wallet,
    lock_height: number,
    lock_time: number,
    lock_price: string,
    close_height: number,
    close_time: number,
    close_price: string,
    open_new: boolean
  ): MsgExecuteContract {
    return new MsgExecuteContract(
      wallet.key.accAddress,
      this.contractAddress,
      this.fabricateNextRound(lock_height, lock_time, lock_price, close_height, close_time, close_price, open_new)
    );
  }

  executeCancelRound(wallet: Wallet, round_id: number): MsgExecuteContract {
    return new MsgExecuteContract(wallet.key.accAddress, this.contractAddress, this.fabricateCancelRound(round_id));
  }

  executeUpdateConfig(
    wallet: Wallet,
    owner: string | undefined,
    tax: string | undefined,
    min_bet: string | undefined
  ): MsgExecuteContract {
    return new MsgExecuteContract(
      wallet.key.accAddress,
      this.contractAddress,
      this.fabricateUpdateConfig(owner, tax, min_bet)
    );
  }

  executeBet(wallet: Wallet, round_id: number, amount: string, direction: BetDirection): MsgExecuteContract {
    return new MsgExecuteContract(
      wallet.key.accAddress,
      this.contractAddress,
      this.fabricateBet(round_id, amount, direction)
    );
  }

  executeClaim(wallet: Wallet, rounds: number[]): MsgExecuteContract {
    return new MsgExecuteContract(wallet.key.accAddress, this.contractAddress, this.fabricateClaim(rounds));
  }

  async queryBetInfo(wallet: Wallet, address: string, round_id: number): Promise<BetInfoResponse> {
    return await wallet.lcd.wasm.contractQuery(this.contractAddress, this.fabricateQueryBetInfo(address, round_id));
  }

  async queryBetHistory(
    wallet: Wallet,
    address: string,
    round_before: number | undefined,
    limit: number | undefined
  ): Promise<BetHistoryResponse> {
    return await wallet.lcd.wasm.contractQuery(
      this.contractAddress,
      this.fabricateQueryBetHistory(address, round_before, limit)
    );
  }

  async queryBetStats(wallet: Wallet, address: string): Promise<BetStatsResponse> {
    return await wallet.lcd.wasm.contractQuery(this.contractAddress, this.fabricateQueryBetStats(address));
  }

  async queryConfig(wallet: Wallet): Promise<ConfigResponse> {
    return await wallet.lcd.wasm.contractQuery(this.contractAddress, this.fabricateQueryConfig());
  }

  async queryMarket(wallet: Wallet): Promise<MarketResponse> {
    return await wallet.lcd.wasm.contractQuery(this.contractAddress, this.fabricateQueryMarket());
  }

  async queryRound(wallet: Wallet, round_id: number): Promise<RoundResponse> {
    return await wallet.lcd.wasm.contractQuery(this.contractAddress, this.fabricateQueryRound(round_id));
  }
}
