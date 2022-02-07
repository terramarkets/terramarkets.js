# TerraMarkets SDK

## Usage

#### Initialize api, receive information about available symbols and subscribe to real-time market events

```ts
import { TerraMarketsApi } from 'terramarkets.js';

// Initialize api 
const api = new TerraMarketsApi("mainnet"); // or "testnet"

// Get available symbols and contract addresses   
const symbolsInfo = await api.getSymbols();

// Initialize hub connection: neccessary for receive real-time market updates 
const hubConnection = await api.startHubConnection();

// Set market updates callback 
hubConnection.on("onMarketUpdate", (marketUpdate: MarketUpdate) => {
  // Handle market update - do something ...
});

// Handle connection lost and reconnect  
hubConnection.onreconnected(async () => {
  // Resubscribe to symbol  
  await api.subscribe(symbolsInfo[0].symbol);
});

// Subscribe to symbol  
await api.subscribe(symbolsInfo[0].symbol);

// Get current market state
const marketState = await api.getMarketState(symbolsInfo[0].symbol);

// Close connection on app end
await api.closeHubConnection(); 
```  

#### Interacting with TerraMarkets smart contract 

```ts
import { LCDClient, MnemonicKey, Wallet } from '@terra-money/terra.js';
import { TerraMarketsContract } from 'terramarkets.js';

// Create LCD client and wallet 
const lcdClient = new LCDClient({
  URL: 'https://bombay-lcd.terra.dev',
  chainID: 'bombay-12',
});

const wallet = new Wallet(lcdClient, new MnemonicKey({
  mnemonic: process.env.MNEMONIC,
}));

// Initialize TerraMarketsContract  
const contract = new TerraMarketsContract(contractAddress); // Contract addresses are returned by api.getSymbols(); 

// Query market 
const market = await contract.queryMarket(wallet);

// Pleace bet (for 15 UST up)
if (market.status === MarketStatus.Open) {
  await contract.executeBet(wallet, market.open_round_id, "15000000", BetDirection.Up);
}

```  
