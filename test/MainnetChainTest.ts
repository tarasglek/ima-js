import chaiAsPromised from "chai-as-promised";
import chai = require("chai");
import * as dotenv from "dotenv";

import { IMA } from '../src/index';
import MainnetChain from '../src/MainnetChain';
import SChain from '../src/SChain';

import * as helper from '../src/helper';

import * as test_utils from './test_utils';
import { utils } from "mocha";
import TxOpts from "../src/TxOpts";
import { CHAIN_NAME_SCHAIN } from "./test_utils";

dotenv.config();

chai.should();
chai.use(chaiAsPromised);


describe("Mainnet chain tests", () => {
    let address: string;
    let mainnet: MainnetChain;
    let sChain: SChain;
    let transferValBN: any;

    let opts: TxOpts;
    let ima: IMA;

    before(async () => {
        ima = test_utils.initTestIMA();
        mainnet = test_utils.initTestMainnet();
        sChain = test_utils.initTestSChain();
        address = helper.privateKeyToAddress(mainnet.web3, test_utils.MAINNET_PRIVATE_KEY);
        transferValBN = mainnet.web3.utils.toBN(test_utils.TEST_WEI_TRANSFER_VALUE);

        opts = {
            address: address,
            privateKey: test_utils.SCHAIN_PRIVATE_KEY
        };

        await test_utils.grantPermissions(ima);
        const isChainConnected = await ima.mainnet.messageProxyMainnet.isChainConnected(
            test_utils.CHAIN_NAME_SCHAIN);
        if (!isChainConnected){
            await ima.connectSchain(test_utils.CHAIN_NAME_SCHAIN, opts);
        }
    });

    it("Requests ETH balance for Mainnet chain", async () => {
        let balance = await mainnet.ethBalance(address);
        balance.should.be.a('string');
    });

    it("Deposits ETH from Mainnet to sChain", async () => {
        let mainnetBalanceBefore = await mainnet.ethBalance(address);
        let sChainBalanceBefore = await sChain.ethBalance(address);
        let sChainBalanceBeforeBN = mainnet.web3.utils.toBN(sChainBalanceBefore);
        let expectedSChainBalance = sChainBalanceBeforeBN.add(transferValBN);

        let txOpts: TxOpts = {
            value: test_utils.TEST_WEI_TRANSFER_VALUE,
            address: address,
            privateKey: test_utils.MAINNET_PRIVATE_KEY
        };

        await mainnet.eth.deposit(
            test_utils.CHAIN_NAME_SCHAIN,
            txOpts
        );
        await sChain.waitETHBalanceChange(address, sChainBalanceBefore);

        let sChainBalanceAfter = await sChain.ethBalance(address);
        let mainnetBalanceAfter = await mainnet.ethBalance(address);
        
        console.log(mainnetBalanceBefore, mainnetBalanceAfter);
        console.log(sChainBalanceBefore, sChainBalanceAfter);

        sChainBalanceAfter.should.be.equal(expectedSChainBalance.toString(10));
    });

    it("Tests reimbursement wallet deposit/withdraw/balance", async () => {
        let balanceBefore = await mainnet.communityPool.balance(
            address, test_utils.CHAIN_NAME_SCHAIN);

        let balanceBeforeBN = mainnet.web3.utils.toBN(balanceBefore);
        let expectedBalanceBN = balanceBeforeBN.add(transferValBN);

        await mainnet.communityPool.recharge(
            test_utils.CHAIN_NAME_SCHAIN,
            address,
            {
                value: test_utils.TEST_WEI_TRANSFER_VALUE,
                address: address,
                privateKey: test_utils.MAINNET_PRIVATE_KEY
            }
        );

        let balanceAfter = await mainnet.communityPool.balance(
            address, test_utils.CHAIN_NAME_SCHAIN);

        balanceAfter.should.be.equal(expectedBalanceBN.toString(10));

        await mainnet.communityPool.withdraw(
            test_utils.CHAIN_NAME_SCHAIN,
            test_utils.TEST_WEI_TRANSFER_VALUE,
            {
                address: address,
                privateKey: test_utils.MAINNET_PRIVATE_KEY
            }
        );

        let balanceAfterWithdraw = await mainnet.communityPool.balance(
            address, test_utils.CHAIN_NAME_SCHAIN);
        balanceAfterWithdraw.should.be.equal(balanceBefore);
    });
});