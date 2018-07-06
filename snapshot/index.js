import ActionModel from './actionModel'
import VoteAccountModel from './VoteAccountModel'
import Eos from 'eosjs'
import config from '../config'

const eoscfg = {
  httpEndpoint: config.HTTP_END_POINT,
  chainId: config.CHAIN_ID
};

const eos = Eos(eoscfg);

async function getAccountBalance(name) {
  return await eos.getCurrencyBalance('eosio.token', name, 'EOS');
}

async function fetchActionLimited(id, limit) {
  let cnt = 1000;
  if (limit) {
    cnt = limit;
  }
  if (!id) {
    return await ActionModel.find({"name": "voteproducer"}).sort({"_id": -1}).limit(cnt);
  }
  return await ActionModel.find({"name": "voteproducer", "_id": {"$lt": id}}).sort({"_id": -1}).limit(cnt);
}

async function isAccountExist(name) {
  let account = await VoteAccountModel.findOne({"name": name});
  return account ? true : false;
}

async function parseActionAndSave(action, draw) {
  let voter = action.data.voter;
  let account = await isAccountExist(voter);
  if (account) {
    return undefined;
  }
  let balanceSet = await getAccountBalance(voter);
  let balance = balanceSet[0];
  if (!balance) {
    balance = 0;
  } else {
    balance = Number(balance.split(' ')[0]);
  }
  let voteAccount = new VoteAccountModel({
    name: voter,
    balance: balance,
    draw: draw,
    airdrop: false
  });
  return await voteAccount.save();
}

async function batchParseAction(actions, draw) {
  let voteAccounts = [];
  for (let action of actions) {
    let voteAccount = await parseActionAndSave(action, draw);
    if (!voteAccount) {
      continue;
    }
    voteAccounts.push(voteAccount);
  }
  return voteAccounts;
}

export async function isDrawExist(draw) {
  let voteAccount = await VoteAccountModel.findOne({"draw": draw});
  return voteAccount ? true : false;
}

export async function fetchVoteAccounts(id, limit) {
  let cnt = 1000;
  if (limit) {
    cnt = limit;
  }
  if (!id) {
    return await VoteAccountModel.find({}).sort({"_id": -1}).limit(cnt);
  }
  return await VoteAccountModel.find({"_id": {"$lt": id}}).sort({"_id": -1}).limit(cnt);
}

export async function updateAirdropStatus(id, status) {
  return await VoteAccountModel.findByIdAndUpdate(id, {"airdrop": status});
}

export async function getLastDraw() {
  let voteAccount = await VoteAccountModel.find({}).sort({"draw": -1}).limit(1);
  if (voteAccount) {
    return voteAccount.draw;
  }
  return 1;
}

export async function actionSnapshot(draw) {
  try {
    let actions = await fetchActionLimited();
    // console.log(actions);
    await batchParseAction(actions, draw);
    while (actions.length > 0) {
      let lastId = actions[actions.length-1]._id;
      actions = await fetchActionLimited(lastId);
      await batchParseAction(actions, draw);
    }
  } catch (e) {
    console.error(e);
  }
}