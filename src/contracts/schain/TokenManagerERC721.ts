/**
 * @license
 * SKALE ima-js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * @file TokenManagerERC721.ts
 * @copyright SKALE Labs 2022-Present
 */

import { TokenManager } from './TokenManager';
import * as constants from '../../constants';
import * as transactions from '../../transactions';
import TxOpts from '../../TxOpts';


export class TokenManagerERC721 extends TokenManager {

    async isTokenAdded(
        erc721OnMainnet: string,
        originChainName: string = constants.MAINNET_CHAIN_NAME
    ): Promise<string> {
        return await this.contract.methods.clonesErc721(
            this.web3.utils.soliditySha3(originChainName),
            erc721OnMainnet
        ).call();
    }

    async addTokenByOwner(
        originChainName: string,
        erc721OnMainnet: string,
        erc721OnSchain: string,
        opts: TxOpts
    ):
        Promise<any> {
        const txData = this.contract.methods.addERC721TokenByOwner(
            originChainName,
            erc721OnMainnet,
            erc721OnSchain
        );
        return await transactions.send(this.web3, txData, opts);
    }

    async approve(tokenName: string, tokenId: number, opts: TxOpts): Promise<any> {
        const tokenContract = this.tokens[tokenName];
        const txData = tokenContract.methods.approve(this.address, tokenId);
        return await transactions.send(this.web3, txData, opts);
    }

    async withdraw(mainnetTokenAddress: string, tokenId: number, opts: TxOpts): Promise<any> {
        const txData = this.contract.methods.exitToMainERC721(
            mainnetTokenAddress,
            tokenId
        );
        return await transactions.send(this.web3, txData, opts);
    }

    async transferToSchain(
        targetSchainName: string,
        tokenAddress: string,
        tokenId: number,
        opts: TxOpts
    ): Promise<any> {
        const txData = this.contract.methods.transferToSchainERC721(
            targetSchainName,
            tokenAddress,
            tokenId
        );
        return await transactions.send(this.web3, txData, opts);
    }

}
