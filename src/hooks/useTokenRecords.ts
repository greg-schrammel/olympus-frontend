import { getSubgraphUrl } from "src/constants";
import { useTokenRecordsQuery } from "src/generated/graphql";
import { DEFAULT_RECORD_COUNT } from "src/views/TreasuryDashboard/components/Graph/Constants";

const QUERY_OPTIONS = { refetchInterval: 60000 }; // Refresh every 60 seconds

export const useTokenRecordsLatestDate = (subgraphUrl?: string) =>
  useTokenRecordsQuery(
    { endpoint: subgraphUrl || getSubgraphUrl() },
    {
      recordCount: 1,
    },
    { select: data => data.tokenRecords[0].date, ...QUERY_OPTIONS },
  );

/**
 * Provides the market value of the treasury for the latest data available in the subgraph.
 *
 * The market value is the sum of all TokenRecord objects in the subgraph, and includes vested/illiquid tokens.
 *
 * @param subgraphUrl
 * @returns
 */
export const useTreasuryMarketValue = (subgraphUrl?: string) => {
  const latestDateQuery = useTokenRecordsLatestDate(subgraphUrl);

  return useTokenRecordsQuery(
    { endpoint: subgraphUrl || getSubgraphUrl() },
    {
      recordCount: DEFAULT_RECORD_COUNT,
      filter: { date: latestDateQuery.data },
    },
    {
      // We just need the total of the tokenRecord value
      select: data => data.tokenRecords.reduce((previousValue, tokenRecord) => previousValue + +tokenRecord.value, 0),
      ...QUERY_OPTIONS,
      enabled: latestDateQuery.isSuccess, // Only fetch when we've been able to get the latest date
    },
  );
};

/**
 * Provides the liquid backing of the treasury for the latest data available in the subgraph.
 *
 * Liquid backing is defined as the value of all liquid assets in the treasury.
 *
 * @param subgraphUrl
 * @returns
 */
export const useTreasuryLiquidValue = (subgraphUrl?: string) => {
  const latestDateQuery = useTokenRecordsLatestDate(subgraphUrl);

  return useTokenRecordsQuery(
    { endpoint: subgraphUrl || getSubgraphUrl() },
    {
      recordCount: DEFAULT_RECORD_COUNT,
      filter: { date: latestDateQuery.data, isLiquid: true },
    },
    {
      // We just need the total of the tokenRecord value
      select: data => data.tokenRecords.reduce((previousValue, tokenRecord) => previousValue + +tokenRecord.value, 0),
      ...QUERY_OPTIONS,
      enabled: latestDateQuery.isSuccess, // Only fetch when we've been able to get the latest date
    },
  );
};
