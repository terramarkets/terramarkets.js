import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { MarketStatus, RoundResponse } from './contract';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { HubConnection } from '@microsoft/signalr/dist/esm/HubConnection';

export interface MarketUpdate {
  market: string;
  last_price: string | undefined;
  open_round: RoundResponse;
  locked_round: RoundResponse;
  closed_round: RoundResponse;
  status: MarketStatus;
  update_date: Date;
}

export class TerraMarketsApi {
  private axios: AxiosInstance;

  constructor(public url: string, apiKey?: string) {
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
  }

  public getMarketHubConnection(): HubConnection {
    return new HubConnectionBuilder()
      .withUrl(this.axios.defaults.baseURL as string)
      .withAutomaticReconnect()
      .build();
  }

  public async getRoundById(market: string, open_height: number): Promise<Array<RoundResponse>> {
    return await this.axiosget(`rounds/${market}/${open_height}`);
  }

  public async getLastRounds(market: string, count: number): Promise<Array<RoundResponse>> {
    return await this.axiosget(`rounds/${market}/?count=${count}`);
  }

  public async getMarketState(market: string): Promise<Array<MarketUpdate>> {
    return await this.axiosget(`market/${market}`);
  }

  public async updateMarket(
    market: string,
    last_price: string | undefined,
    open_round: RoundResponse | undefined,
    locked_round: RoundResponse | undefined,
    closed_round: RoundResponse | undefined,
    status: MarketStatus | undefined,
    update_date: Date
  ): Promise<unknown> {
    return await this.axiosput(`market`, {
      market,
      last_price,
      open_round,
      locked_round,
      closed_round,
      status,
      update_date
    });
  }

  private async axiosget<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
    return this.axios.get(endpoint, config).then(r => {
      return r.data;
    });
  }

  private async axiosput<T>(endpoint: string, data: any, config: AxiosRequestConfig = {}): Promise<T> {
    return this.axios.put(endpoint, data, config).then(r => {
      return r.data;
    });
  }
}
