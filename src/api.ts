import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { MarketStatus, RoundResponse } from './contract';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { HubConnection } from '@microsoft/signalr/dist/esm/HubConnection';

export interface MarketUpdate {
  symbol: string;
  last_price: string | undefined;
  open_round: RoundResponse;
  locked_round: RoundResponse;
  closed_round: RoundResponse;
  status: MarketStatus;
  update_date: Date;
}

export interface SymbolInfo {
  symbol: string;
  contractAddress: string;
  description: string;
  interval: number;
}

export type NetworkType = 'mainnet' | 'testnet' | 'localterra';

export class TerraMarketsApi {
  public readonly hubConnection: HubConnection;
  private axios: AxiosInstance;
  private readonly userId: string;

  constructor(
    public network: NetworkType,
    public url: string = 'https://terramarketfunctions.azurewebsites.net/api/',
    apiKey?: string
  ) {
    this.axios = axios.create({
      baseURL: url,
      headers: {
        Accept: 'application/json'
      },
      timeout: 30000
    });
    if (apiKey !== undefined) {
      this.axios.defaults.headers.common['x-functions-key'] = apiKey;
    }
    this.userId = TerraMarketsApi.generateUserId();
    this.axios.defaults.headers.common['X-UserId'] = this.userId;
    this.hubConnection = this.getHubConnection();
  }

  private static generateUserId(): string {
    return Math.random().toString(36).substring(2, 10);
  }

  public async subscribe(symbol: string): Promise<HubConnection> {
    await this.startHubConnection();
    await this.axiosget(`${this.network}/subscribe/${symbol}`);
    return this.hubConnection;
  }

  public async unSubscribe(symbol: string): Promise<void> {
    await this.axiosget(`${this.network}/unsubscribe/${symbol}`);
  }

  public async startHubConnection(): Promise<HubConnection> {
    if (this.hubConnection.connectionId === null) {
      await this.hubConnection.start();
    }
    return this.hubConnection;
  }

  public async closeHubConnection(): Promise<void> {
    return await this.hubConnection.stop();
  }

  public async getContractAddressForSymbol(symbol: string): Promise<string | undefined> {
    const symbols = await this.getSymbols();
    const s = symbols.find(x => x.symbol === symbol);
    if (s !== undefined) {
      return s.contractAddress;
    }
    return undefined;
  }

  public async getSymbols(): Promise<Array<SymbolInfo>> {
    return await this.axiosget(`${this.network}/symbols`);
  }

  public async getRoundById(symbol: string, open_height: number): Promise<RoundResponse> {
    return await this.axiosget(`${this.network}/rounds/${symbol}/${open_height}`);
  }

  public async getLastRounds(symbol: string, count: number): Promise<Array<RoundResponse>> {
    return await this.axiosget(`${this.network}/rounds/${symbol}/?count=${count}`);
  }

  public async getMarketState(symbol: string): Promise<MarketUpdate> {
    return await this.axiosget(`${this.network}/market/${symbol}`);
  }

  public async updateMarket(
    symbol: string,
    last_price: string | undefined,
    open_round: RoundResponse | undefined,
    locked_round: RoundResponse | undefined,
    closed_round: RoundResponse | undefined,
    status: MarketStatus | undefined,
    update_date: Date
  ): Promise<unknown> {
    return await this.axiosput(`${this.network}/market`, {
      symbol,
      last_price,
      open_round,
      locked_round,
      closed_round,
      status,
      update_date
    });
  }

  private getHubConnection(): HubConnection {
    return new HubConnectionBuilder()
      .withUrl(this.axios.defaults.baseURL as string, {
        headers: { 'X-UserId': this.userId }
      })
      .withAutomaticReconnect()
      .build();
  }

  private async axiosget<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
    return this.axios.get(endpoint, config).then(r => {
      return r.data;
    });
  }

  // eslint-disable-next-line
  private async axiosput<T>(endpoint: string, data: any, config: AxiosRequestConfig = {}): Promise<T> {
    return this.axios.put(endpoint, data, config).then(r => {
      return r.data;
    });
  }
}
