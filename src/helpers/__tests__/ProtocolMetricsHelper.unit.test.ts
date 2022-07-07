import {
  getDataKeysFromTokens,
  getKeysTokenSummary,
  getTokensFromKey,
  reduceKeysTokenSummary,
} from "../ProtocolMetricsHelper";

const getTokenRecord = (token: string, value: string) => {
  return {
    token: token,
    value: value,
  };
};

describe("getKeysTokenSummary", () => {
  test("works as expected", () => {
    const records = [getTokenRecord("Aave", "100"), getTokenRecord("Aave", "102.2"), getTokenRecord("DAI", "20.02")];
    const recordsValue = records.reduce((accumulator, obj) => {
      return accumulator + parseFloat(obj.value);
    }, 0);

    const timestamp = "1122200";
    const metrics = [
      {
        timestamp: timestamp,
        treasuryLPValueComponents: {
          value: recordsValue,
          records: records,
        },
      },
    ];

    const flatData = getKeysTokenSummary(metrics, ["treasuryLPValueComponents"], ["Protocol-Owned Liquidity"]);

    // Data has been flattened
    const recordOne = flatData[0];
    expect(recordOne["timestamp"]).toEqual(timestamp);
    // 50 * 2 + 51.1 * 2
    expect(recordOne["treasuryLPValueComponents"]["tokens"]["Aave"].value).toEqual("202.2");
    expect(recordOne["treasuryLPValueComponents"]["tokens"]["Aave"].category).toEqual("Protocol-Owned Liquidity");
    // 20.02 * 1
    expect(recordOne["treasuryLPValueComponents"]["tokens"]["DAI"].value).toEqual("20.02");
    expect(recordOne["treasuryLPValueComponents"]["tokens"]["DAI"].category).toEqual("Protocol-Owned Liquidity");
    expect(Object.keys(recordOne["treasuryLPValueComponents"]["tokens"]).length).toEqual(2);

    expect(flatData.length).toEqual(1);
  });

  test("error when keys and categories have different lengths", () => {
    const records = [getTokenRecord("Aave", "100"), getTokenRecord("Aave", "102.2"), getTokenRecord("DAI", "20.02")];
    const recordsValue = records.reduce((accumulator, obj) => {
      return accumulator + parseFloat(obj.value);
    }, 0);

    const timestamp = "1122200";
    const metrics = [
      {
        timestamp: timestamp,
        treasuryLPValueComponents: {
          value: recordsValue,
          records: records,
        },
      },
    ];

    expect(() => {
      getKeysTokenSummary(metrics, ["treasuryLPValueComponents"], ["one", "two"]);
    }).toThrow();
  });

  test("missing records property", () => {
    const records = [getTokenRecord("Aave", "100"), getTokenRecord("Aave", "102.2"), getTokenRecord("DAI", "20.02")];
    const recordsValue = records.reduce((accumulator, obj) => {
      return accumulator + parseFloat(obj.value);
    }, 0);

    const timestamp = "1122200";
    const metrics = [
      {
        timestamp: timestamp,
        treasuryLPValueComponents: {
          value: recordsValue,
          records2: records, // Should be `records`
        },
      },
    ];

    expect(() => {
      getKeysTokenSummary(metrics, ["treasuryLPValueComponents"], ["POL"]);
    }).toThrow();
  });

  test("incorrect key", () => {
    const metrics = [{}];

    expect(() => {
      getKeysTokenSummary(metrics, ["sometoken"], ["somecategory"]);
    }).toThrow();
  });
});

describe("reduceKeysTokenSummary", () => {
  test("works as expected", () => {
    const timestamp = "1122200";
    const metrics = [
      {
        timestamp: timestamp,
        treasuryLPValueComponents: {
          tokens: {
            DAI: { token: "DAI", category: "Stablecoins", value: "100.0" },
            LUSD: { token: "LUSD", category: "Stablecoins", value: "150.0" },
          },
        },
      },
    ];

    const reducedData = reduceKeysTokenSummary(metrics, ["treasuryLPValueComponents"]);

    expect(reducedData[0]["tokens"][0].token).toEqual("DAI");
    expect(reducedData[0]["tokens"][1].token).toEqual("LUSD");
    expect(reducedData[0]["tokens"].length).toEqual(2);
  });

  test("missing tokens property", () => {
    const timestamp = "1122200";
    const metrics = [
      {
        timestamp: timestamp,
        treasuryLPValueComponents: {
          tokens2: {
            DAI: { token: "DAI", category: "stable", value: "100.0" },
          }, // Should be `tokens`
        },
      },
    ];

    expect(() => {
      reduceKeysTokenSummary(metrics, ["treasuryLPValueComponents"]);
    }).toThrow();
  });

  test("incorrect key", () => {
    const metrics = [{}];

    expect(() => {
      reduceKeysTokenSummary(metrics, ["treasuryLPValueComponents"]);
    }).toThrow();
  });
});

describe("getTokensFromKey", () => {
  test("works as expected", () => {
    const timestamp = "1122200";
    const metrics = [
      {
        timestamp: timestamp,
        treasuryLPValueComponents: {
          tokens: {
            DAI: { token: "DAI", category: "Stablecoins", value: "100.0" },
            LUSD: { token: "LUSD", category: "Stablecoins", value: "150.0" },
          },
        },
      },
    ];

    const tokenNames = getTokensFromKey(metrics, "treasuryLPValueComponents");

    expect(tokenNames).toEqual(["DAI", "LUSD"]);
  });
});

describe("getDataKeysFromTokens", () => {
  test("works as expected", () => {
    const tokenNames = ["DAI", "LUSD"];

    const dataKeys = getDataKeysFromTokens(tokenNames, "treasuryLPValueComponents");

    expect(dataKeys).toEqual([
      "treasuryLPValueComponents.tokens.DAI.value",
      "treasuryLPValueComponents.tokens.LUSD.value",
    ]);
  });
});