import Eos from 'eosjs'
import config from './config'
import {fetchVoteAccounts, updateAirdropStatus} from './snapshot'

async function ntsTransfer(account, amount, keyProvider) {
  const eoscfg = {
    httpEndpoint: config.HTTP_END_POINT,
    chainId: config.CHAIN_ID,
    keyProvider: keyProvider
  };

  const eos = Eos(eoscfg);
  let ntsContract = await eos.contract('eosninetiess');
  return await ntsContract.transfer('eosninetiess', account, amount, 'EOS90S感谢您参与节点竞选投票！');
}

async function batchNtsTransfer(accounts, keyProvider) {
  for (let account of accounts) {
    let balance = account.balance;
    if (balance > 1000000) {
      continue;
    }
    let balanceStr = balance + " EOSNTS";
    await ntsTransfer(account, balanceStr, keyProvider);
  }
}

export async function execAirdrop(keyProvider) {
  try {
    let accounts = await fetchVoteAccounts();
    await batchNtsTransfer(accounts, keyProvider);
    while (accounts.length > 0) {
      let lastId = accounts[accounts.length-1]._id;
      accounts = await fetchVoteAccounts(lastId);
      await batchNtsTransfer(accounts, keyProvider);
    }
  } catch (e) {
    console.error(e);
  }
}