import { MarketUpdate, TerraMarketsApi } from "../api";
import { MarketStatus } from "../contract";

const testSymbol = "testsymbol";

beforeAll(async () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config();
});

test('ApiGetSymbols', async () => {
  const api = new TerraMarketsApi("localterra");
  const symbols = await api.getSymbols();
  expect(symbols).toBeDefined();
  expect(symbols.find(x => x.symbol == testSymbol)).toBeDefined();
});


test('ApiHubSubscription', async () => {
  const api = new TerraMarketsApi("localterra", process.env.ApiURL, process.env.ApiKey);
  const connection = await api.startHubConnection();

  let rcvUpdate: MarketUpdate | undefined;
  connection.on("onMarketUpdate", (marketUpdate: MarketUpdate) => {
    rcvUpdate = marketUpdate;
  });

  // subscribe to market updates
  await api.subscribe(testSymbol);
  const now = new Date();
  await api.updateMarket(testSymbol, '10.10', undefined, undefined, undefined,
    MarketStatus.Closed, now);
  await delay(2000);

  expect(rcvUpdate).toBeDefined();
  if (rcvUpdate !== undefined) {
    expect(rcvUpdate.symbol).toBeDefined();
    expect(rcvUpdate.last_price).toEqual('10.10');
  }

  // unSubscribe from market updates
  await api.unSubscribe(testSymbol);
  rcvUpdate = undefined;
  await api.updateMarket(testSymbol, '10.10', undefined, undefined, undefined,
    MarketStatus.Closed, now);
  await delay(2000);
  expect(rcvUpdate).toBeUndefined();

  await api.closeHubConnection();
});

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
