import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PriceChart from "../components/PriceChart";
import TickerSearchDropdown from "../components/TickerSearchDropdown";
import CurrencySelect from "../components/CurrencySelect";

import { useAuth } from "../hooks/useAuth";

/**
 * @typedef {{
 *  ticker: string,
 *  info: {
 *    industryDisp?: string,
 *    sectorDisp?: string,
 *    longBusinessSummary?: string,
 *    currency: string,
 *    enterpriseValue?: number,
 *    bookValue?: number,
 *    marketCap?: number,
 *    typeDisp?: string,
 *    shortName?: string,
 *    longName?: string,
 *    fullExchangeName?: string,
 *    currentPrice?: number,
 *    previousClose?: number,
 *    regularMarketChangePercent?: number,
 *    fiftyTwoWeekLow?: number,
 *    fiftyTwoWeekHigh?: number,
 *    volume?: number,
 *    averageVolume?: number,
 *    beta?: number,
 *    trailingPE?: number,
 *    dividendYield?: number
 *  } | null,
 *  time_series_data: {
 *    date?: string[],
 *    close?: number[],
 *    close_fitted?: number[],
 *    long_term_deviation_z?: number[],
 *    rolling_return_1w?: number[],
 *    rolling_return_z_score_1w?: number[],
 *    rolling_return_1m?: number[],
 *    rolling_return_z_score_1m?: number[],
 *    rolling_return_1y?: number[],
 *    rolling_return_z_score_1y?: number[]
 *  } | null,
 *  error_msg: string | null,
 *  cagr?: number,
 *  cagr_fitted?: number,
 *  long_term_deviation_rmse?: number,
 *  long_term_deviation_rmse_normalized?: number,
 *  returns_mean_annualized?: number,
 *  returns_std_annualized?: number,
 *  returns_cv?: number,
 *  max_drawdown?: number
 * }} TickerMetricsResponse
 */

const API_BASE = import.meta.env.VITE_API_URL;

function TickerMetrics() {
  const { user } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  // State to hold ticker and metrics data
  const [ticker, setTicker] = useState("");
  /** @type {[TickerMetricsResponse | null, React.Dispatch<React.SetStateAction<TickerMetricsResponse | null>>]} */
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for currency dropdown of the asset analyzed
  const [currency, setCurrency] = useState("");

  const fetchTickerMetrics = async (tickerSymbol, currencyParam) => {
    setLoading(true);
    setData(null);
    setError(null);

    try {
      const url =
        `${API_BASE}/ticker/${tickerSymbol}` +
        (currencyParam ? `/?currency=${currencyParam}` : "");

      const res = await fetch(url);

      /** @type {TickerMetricsResponse} */
      const result = await res.json();

      if (!res.ok) {
        // console.log(await res.json());
        throw new Error(
          result.detail ||
            `Request failed with '${res.status}' '${res.statusText}' at '${res.url}'`
        );
      }

      if (result.error_msg) {
        setError(result.error_msg);
        setData(null);
      } else {
        setError(null);
        result.time_series_data.date = result.time_series_data.date.map(
          (date) => new Date(date)
        );
        setData(result);
        setTicker(tickerSymbol);
        setCurrency(currencyParam || result.info.currency);
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  useEffect(() => {
    const tickerUrl = searchParams.get("ticker");
    const currencyParam = searchParams.get("currency");

    if (tickerUrl) {
      fetchTickerMetrics(tickerUrl, currencyParam);
    }
  }, [searchParams]);

  const selectTicker = useCallback(
    (tickerItem) => {
      const selectedTicker = tickerItem.symbol;

      if (!selectedTicker) return;

      setTicker(selectedTicker);
      setSearchParams({ ticker: selectedTicker });
    },
    [setSearchParams]
  );

  const onCurrencySelect = (newCurrency) => {
    const code = newCurrency.substring(0, 3);
    setCurrency(code);

    if (data?.info?.currency && code !== data?.info?.currency) {
      setSearchParams({ ticker, currency: code });
    } else {
      setSearchParams({ ticker });
    }
  };

  // Memoize the chart data transformation to avoid recalculating on every render
  const chartData = useMemo(() => {
    if (!data?.time_series_data?.date) {
      return [];
    }

    const result = data.time_series_data.date.map((date, index) => ({
      date: date,
      close: data.time_series_data.close[index],
      closeFitted: data.time_series_data.close_fitted?.[index],
    }));

    return result;
  }, [data]);

  // Memoize chart formatters to avoid creating new functions on every render
  const xAxisFormatter = useCallback((value) => value.toLocaleDateString(), []);

  const yAxisFormatter = useCallback(
    (value) =>
      value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  );
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Ticker Metrics</h2>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-4 py-3"
        >
          <div className="flex-1">
            <p className="font-semibold text-red-800">Error</p>
            <p className="text-sm text-red-700 mt-1">{String(error)}</p>
          </div>

          <button
            onClick={() => setError(null)}
            className="ml-4 text-sm text-red-600 hover:underline"
            aria-label="Dismiss error"
            title="Dismiss"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Input with Dropdown */}
      <div className="mb-4">
        <TickerSearchDropdown onSelect={selectTicker} ticker={ticker} />
      </div>

      {/* Current Ticker Display */}
      {ticker && (
        <div className="mb-4 p-3 bg-theme-accent-light border border-theme-accent rounded">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-theme-secondary">Selected Ticker:</span>
              <span className="ml-2 text-lg font-semibold text-theme-primary">
                {ticker}
              </span>
            </div>
            <button
              onClick={() => {
                setTicker("");
                setData(null);
                setError(null);
                setCurrency("");
                setSearchParams({});
              }}
              className="text-theme-secondary hover:text-theme-primary text-sm underline"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary"></div>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-6">
          {/* Company Header */}
          <div className="bg-gradient-to-r from-theme-accent-light to-theme-accent-border p-6 rounded-lg shadow-sm border border-theme-accent">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {data.info?.longName || data.ticker}
                </h3>
                <p className="text-lg text-gray-600">{data.info?.shortName}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-2 py-1 bg-theme-accent-border text-theme-primary text-sm rounded-full">
                    {data.info?.typeDisp}
                  </span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {data.info?.sectorDisp}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    {data.info?.industryDisp}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                    {data.info?.fullExchangeName}
                  </span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <CurrencySelect
                  assetCurrency={data.info?.currency}
                  userCurrency={user?.currency}
                  value={currency}
                  onChangeValue={onCurrencySelect}
                />
                {/* <div className="text-3xl font-bold text-gray-900">
                  {data.info?.currentPrice?.toFixed(2)} {data.info?.currency}
                </div> */}
                <div
                  className={`text-sm ${
                    data.info?.regularMarketChangePercent >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {data.info?.regularMarketChangePercent >= 0 ? "+" : ""}
                  {(data.info?.regularMarketChangePercent * 100)?.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          {/* Sample Period Information */}
          {data.time_series_data?.date && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Sample Period
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">First Date</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {data.time_series_data.date[0].toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">
                    Last Date (Reference)
                  </div>
                  <div className="text-xl font-semibold text-gray-900">
                    {data.time_series_data.date[
                      data.time_series_data.date.length - 1
                    ].toLocaleDateString()}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Total Years</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {(() => {
                      const firstDate = data.time_series_data.date[0];
                      const lastDate =
                        data.time_series_data.date[
                          data.time_series_data.date.length - 1
                        ];
                      const diffTime = Math.abs(lastDate - firstDate);
                      const diffYears =
                        diffTime / (1000 * 60 * 60 * 24 * 365.25);
                      return diffYears.toFixed(1);
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Historical Risk & Return Metrics */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Historical Risk & Return Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-theme-accent-light p-4 rounded-lg">
                <div className="text-sm text-theme-secondary">CAGR (Actual)</div>
                <div className="text-xl font-semibold text-theme-primary">
                  {data.cagr ? `${(data.cagr * 100).toFixed(2)}%` : "N/A"}
                </div>
              </div>
              <div className="bg-theme-accent-light p-4 rounded-lg">
                <div className="text-sm text-theme-secondary">CAGR (Model Fitted)</div>
                <div className="text-xl font-semibold text-theme-primary">
                  {data.cagr_fitted
                    ? `${(data.cagr_fitted * 100).toFixed(2)}%`
                    : "N/A"}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600">
                  Annualized Mean Return
                </div>
                <div className="text-xl font-semibold text-green-900">
                  {data.returns_mean_annualized
                    ? `${(data.returns_mean_annualized * 100).toFixed(2)}%`
                    : "N/A"}
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-sm text-yellow-600">
                  Annualized Volatility
                </div>
                <div className="text-xl font-semibold text-yellow-900">
                  {data.returns_std_annualized
                    ? `${(data.returns_std_annualized * 100).toFixed(2)}%`
                    : "N/A"}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600">
                  Coefficient of Variation
                </div>
                <div className="text-xl font-semibold text-purple-900">
                  {data.returns_cv ? data.returns_cv.toFixed(2) : "N/A"}
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-sm text-red-600">Maximum Drawdown</div>
                <div className="text-xl font-semibold text-red-900">
                  {data.max_drawdown
                    ? `${(data.max_drawdown * 100).toFixed(2)}%`
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Current Performance & Z-Scores */}
          {data.time_series_data && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  Current Performance & Risk Analysis
                </h4>
                <div className="text-sm text-gray-500">
                  As of:{" "}
                  {data.time_series_data.date?.[
                    data.time_series_data.date.length - 1
                  ]?.toLocaleDateString()}
                </div>
              </div>

              <div className="mb-4 p-3 bg-theme-accent-light rounded-lg">
                <p className="text-sm text-theme-primary">
                  <strong>Z-Score Info:</strong> Z-scores show how many standard
                  deviations away the current value is from the historical
                  average. Values between -2 and +2 are considered normal,
                  beyond ±2 are unusual, and beyond ±3 are rare.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Position */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-800">
                    Current Position
                  </h5>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-600">Actual Price</div>
                      <div className="text-lg font-semibold">
                        {data.time_series_data.close?.[
                          data.time_series_data.close.length - 1
                        ]?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        {data.info?.currency}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-600">
                        Model Fitted Price
                      </div>
                      <div className="text-lg font-semibold">
                        {data.time_series_data.close_fitted?.[
                          data.time_series_data.close_fitted.length - 1
                        ]?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        {data.info?.currency}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-600">
                        Long-term Deviation (Z-Score)
                      </div>
                      <div
                        className={`text-lg font-semibold ${
                          Math.abs(
                            data.time_series_data.long_term_deviation_z?.[
                              data.time_series_data.long_term_deviation_z
                                .length - 1
                            ] || 0
                          ) > 2
                            ? "text-red-600"
                            : Math.abs(
                                data.time_series_data.long_term_deviation_z?.[
                                  data.time_series_data.long_term_deviation_z
                                    .length - 1
                                ] || 0
                              ) > 1
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {data.time_series_data.long_term_deviation_z?.[
                          data.time_series_data.long_term_deviation_z.length - 1
                        ]?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rolling Returns */}
                <div className="space-y-4">
                  <h5 className="font-semibold text-gray-800">
                    Rolling Returns & Z-Scores
                  </h5>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          1 Week Return
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            (data.time_series_data.rolling_return_1w?.[
                              data.time_series_data.rolling_return_1w.length - 1
                            ] || 0) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {(
                            (data.time_series_data.rolling_return_1w?.[
                              data.time_series_data.rolling_return_1w.length - 1
                            ] || 0) * 100
                          ).toFixed(2)}
                          %
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Z-Score:{" "}
                        {data.time_series_data.rolling_return_z_score_1w?.[
                          data.time_series_data.rolling_return_z_score_1w
                            .length - 1
                        ]?.toFixed(2)}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          1 Month Return
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            (data.time_series_data.rolling_return_1m?.[
                              data.time_series_data.rolling_return_1m.length - 1
                            ] || 0) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {(
                            (data.time_series_data.rolling_return_1m?.[
                              data.time_series_data.rolling_return_1m.length - 1
                            ] || 0) * 100
                          ).toFixed(2)}
                          %
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Z-Score:{" "}
                        {data.time_series_data.rolling_return_z_score_1m?.[
                          data.time_series_data.rolling_return_z_score_1m
                            .length - 1
                        ]?.toFixed(2)}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          1 Year Return
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            (data.time_series_data.rolling_return_1y?.[
                              data.time_series_data.rolling_return_1y.length - 1
                            ] || 0) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {(
                            (data.time_series_data.rolling_return_1y?.[
                              data.time_series_data.rolling_return_1y.length - 1
                            ] || 0) * 100
                          ).toFixed(2)}
                          %
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Z-Score:{" "}
                        {data.time_series_data.rolling_return_z_score_1y?.[
                          data.time_series_data.rolling_return_z_score_1y
                            .length - 1
                        ]?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Price Chart */}
          {chartData.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Price Chart
              </h4>
              <div className="h-96">
                <PriceChart
                  chartData={chartData}
                  xAxisFormatter={xAxisFormatter}
                  yAxisFormatter={yAxisFormatter}
                />
              </div>
            </div>
          )}

          {/* Business Summary */}
          {data.info?.longBusinessSummary && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Business Summary
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {data.info.longBusinessSummary}
              </p>
            </div>
          )}

          {/* Key Financial Metrics */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Key Financial Metrics
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Market Cap</div>
                <div className="text-xl font-semibold text-gray-900">
                  {data.info?.marketCap
                    ? `${(data.info.marketCap / 1e9).toFixed(2)}B ${
                        data.info?.currency
                      }`
                    : "N/A"}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Enterprise Value</div>
                <div className="text-xl font-semibold text-gray-900">
                  {data.info?.enterpriseValue
                    ? `${(data.info.enterpriseValue / 1e9).toFixed(2)}B ${
                        data.info?.currency
                      }`
                    : "N/A"}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Book Value</div>
                <div className="text-xl font-semibold text-gray-900">
                  {data.info?.bookValue
                    ? `${data.info.bookValue.toFixed(2)} ${data.info?.currency}`
                    : "N/A"}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">P/E Ratio</div>
                <div className="text-xl font-semibold text-gray-900">
                  {data.info?.trailingPE
                    ? data.info.trailingPE.toFixed(2)
                    : "N/A"}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Beta</div>
                <div className="text-xl font-semibold text-gray-900">
                  {data.info?.beta ? data.info.beta.toFixed(2) : "N/A"}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Dividend Yield</div>
                <div className="text-xl font-semibold text-gray-900">
                  {data.info?.dividendYield
                    ? `${(data.info.dividendYield * 100).toFixed(2)}%`
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Trading Information */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Trading Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Previous Close</div>
                <div className="text-lg font-semibold">
                  {data.info?.previousClose?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  {data.info?.currency}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">52W Range</div>
                <div className="text-lg font-semibold">
                  {data.info?.fiftyTwoWeekLow?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  -{" "}
                  {data.info?.fiftyTwoWeekHigh?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Volume</div>
                <div className="text-lg font-semibold">
                  {data.info?.volume
                    ? data.info.volume.toLocaleString()
                    : "N/A"}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm text-gray-600">Avg Volume</div>
                <div className="text-lg font-semibold">
                  {data.info?.averageVolume
                    ? data.info.averageVolume.toLocaleString()
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TickerMetrics;
