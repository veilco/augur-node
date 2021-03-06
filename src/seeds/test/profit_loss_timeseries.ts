import * as Knex from "knex";

exports.seed = async (knex: Knex): Promise<any> => {
  // Deletes ALL existing entries
  return knex("profit_loss_timeseries")
    .del()
    .then(async (): Promise<any> => {
      // Inserts seed entries
      return knex("profit_loss_timeseries").insert([
        {
          moneySpent: "0.04",
          numOwned: "0.0005",
          numEscrowed: "0",
          profit: "0",
          account: "0xffff000000000000000000000000000000000000",
          marketId: "0x0000000000000000000000000000000000000ff1",
          outcome: 0,
          transactionHash: "0xd0e854061545763ea2103142eaa4a8a9bf5a70cf00e5e23736d03a8ba004eeb6",
          timestamp: 1534320908,
          blockTransactionIndex: 1,
        },
        {
          moneySpent: "0.04",
          numOwned: "0.0004",
          numEscrowed: "0.0001",
          profit: "0",
          account: "0xffff000000000000000000000000000000000000",
          marketId: "0x0000000000000000000000000000000000000ff1",
          outcome: 0,
          transactionHash: "0x90453fb3207701147c1a56085feab511bc0f41495862e9c164c858a93829700f",
          timestamp: 1534321163,
          blockTransactionIndex: 2,
        },
        {
          moneySpent: "0.024",
          numOwned: "0.0003",
          numEscrowed: "0.0001",
          profit: "-0.020998",
          account: "0xffff000000000000000000000000000000000000",
          marketId: "0x0000000000000000000000000000000000000ff1",
          outcome: 0,
          transactionHash: "0xbe8ca627075631780d71681b0844005fa79cb027a1f64cabb4f9457f9e2b2ce9",
          timestamp: 1534351673,
          blockTransactionIndex: 3,
        },
        {
          moneySpent: "0.024",
          numOwned: "0",
          numEscrowed: "0.0004",
          profit: "-0.020998",
          account: "0xffff000000000000000000000000000000000000",
          marketId: "0x0000000000000000000000000000000000000ff1",
          outcome: 0,
          transactionHash: "0x12c02d0e70bc5a0bafa7a24bf9c84ebda7a6c19f0283220bd2abf25bd26b70a6",
          timestamp: 1534415303,
          blockTransactionIndex: 4,
        },
        {
          moneySpent: "0.1212",
          numOwned: "0.0003",
          numEscrowed: "0.0004",
          profit: "-0.088192",
          account: "0xffff000000000000000000000000000000000000",
          marketId: "0x0000000000000000000000000000000000000ff1",
          outcome: 0,
          transactionHash: "0x13d6ffa2f7363a7692042acadf31e20899703d2ae49c80d3b23f7567c7a96be4",
          timestamp: 1534416368,
          blockTransactionIndex: 5,
        },
        {
          moneySpent: "0.2412",
          numOwned: "0.0013",
          numEscrowed: "0.0004",
          profit: "-0.088192",
          account: "0xffff000000000000000000000000000000000000",
          marketId: "0x0000000000000000000000000000000000000ff1",
          outcome: 0,
          transactionHash: "0x0a4b82b1abe2b8e427275c232c7949bcbfef0419ac1ded5dbd4e75d2851ae63a",
          timestamp: 1534417328,
          blockTransactionIndex: 6,
        },
        {
          moneySpent: "0.166002352941176470587384",
          numOwned: "0.00117",
          numEscrowed: "0.0004",
          profit: "-0.1261341058823529411764712",
          account: "0xffff000000000000000000000000000000000000",
          marketId: "0x0000000000000000000000000000000000000ff1",
          outcome: 0,
          transactionHash: "0xdfe63f0bd846e0d61bd1e623e8419f98e4125c1a4a7298011aa895ebaaac90ff",
          timestamp: 1534417613,
          blockTransactionIndex: 7,
        },
        {
          moneySpent: "0.16600235294117647059",
          numOwned: "0.00127",
          numEscrowed: "0.0003",
          profit: "-0.12613410588235294118",
          account: "0xffff000000000000000000000000000000000000",
          marketId: "0x0000000000000000000000000000000000000ff1",
          outcome: 0,
          transactionHash: "0x49a32e46619d9c1435ed4ba8503e6b40edbd600f1167ca1f89d66db16cb108cd",
          timestamp: 1534417748,
          blockTransactionIndex: 8,
        },
        {
          moneySpent: "0.0000000000000002565483363529411764733155",
          numOwned: "0.00017",
          numEscrowed: "0.0003",
          profit: "54999999999.70786354111764705882",
          account: "0xffff000000000000000000000000000000000000",
          marketId: "0x0000000000000000000000000000000000000ff1",
          outcome: 0,
          transactionHash: "0xe7e6145764e5e00aebb25efd27feb79aceb86a4bbe808fe801021f733a5b13e3",
          timestamp: 1534419113,
          blockTransactionIndex: 9,
        },
        {
          moneySpent: "0.09600000000000025655",
          numOwned: "0.00097",
          numEscrowed: "0.0003",
          profit: "54999999999.70786354111764705882",
          account: "0xffff000000000000000000000000000000000000",
          marketId: "0x0000000000000000000000000000000000000ff1",
          outcome: 0,
          transactionHash: "0x5a3c6e70d19ca884aec36f58d2fb1ce9f33d9b768557eda8b8c507a4e0c87f16",
          timestamp: 1534419383,
          blockTransactionIndex: 10,
        },
        {
          moneySpent: "0.0377952755905512821063370078740157481325",
          numOwned: "0.0005",
          numEscrowed: "0.0003",
          profit: "54999999999.601845382062528853640078",
          account: "0xffff000000000000000000000000000000000000",
          marketId: "0x0000000000000000000000000000000000000ff1",
          outcome: 0,
          transactionHash: "0xc43e2d4df8aa6ac27015123aedf4fc4d535e8adf2ef823374f5334a3808744ec",
          timestamp: 1534420373,
          blockTransactionIndex: 11,
        },
        {
          moneySpent: "0.03779527559055128211",
          numOwned: "0.0004",
          numEscrowed: "0.0004",
          profit: "54999999999.60184538206252885364",
          account: "0xffff000000000000000000000000000000000000",
          marketId: "0x0000000000000000000000000000000000000ff1",
          outcome: 0,
          transactionHash: "0x3a3790426788f5ca1ea2fc7b6dc576ffacc3a032f30e04455e1e0d55b645bf40",
          timestamp: 1534434608,
          blockTransactionIndex: 12,
        },
        {
          moneySpent: "0.03779527559055128211",
          numOwned: "0.0005",
          numEscrowed: "0.0003",
          profit: "54999999999.60184538206252885364",
          account: "0xffff000000000000000000000000000000000000",
          marketId: "0x0000000000000000000000000000000000000ff1",
          outcome: 0,
          transactionHash: "0x3a88d0f96afd7d30f91d5465d228d27ec111c6a932e376872438e2b056984342",
          timestamp: 1534434683,
          blockTransactionIndex: 13,
        },
        {
          moneySpent: "0.018897637795275641055",
          numOwned: "0.0004",
          numEscrowed: "0.0003",
          profit: "54999999999.58212297261370994337625",
          account: "0xffff000000000000000000000000000000000000",
          marketId: "0x0000000000000000000000000000000000000ff1",
          outcome: 0,
          transactionHash: "0xc4c3db73bed5cb4ce6100a7da6b99bce43cdd5e8872c5eb9cad1b22ef450d10e",
          timestamp: 1534434818,
          blockTransactionIndex: 14,
        },
        {
          moneySpent: "0.0080989876265467033071698537682789652015",
          numOwned: "0.0003",
          numEscrowed: "0.0003",
          profit: "54999999999.564425310071527708944286",
          account: "0xffff000000000000000000000000000000000000",
          marketId: "0x0000000000000000000000000000000000000ff1",
          outcome: 0,
          transactionHash: "0x23973e19a905feed4c0720eba957b4e0c24eb28a7e283822cc039d07eacbea71",
          timestamp: 1534435013,
          blockTransactionIndex: 15,
        },
        {
          account: "0x913da4198e6be1d5f5e4a40d0667f70c0b5430eb",
          marketId: "0xfd9d2cab985b4e1052502c197d989fdf9e7d4b1e",
          outcome: "1",
          transactionHash: "0xaa32ebbbe9f5503f2bde1a25cb3c7ed3dece3a870742fd2012e41006c928ee31",
          moneySpent: "28.89",
          numOwned: "30",
          numEscrowed: "0",
          profit: "0",
          timestamp: 1544804660,
          blockTransactionIndex: 16,
        },
      ]);
    });
};
