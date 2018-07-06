import mongoose from '../mongoutil'

let VoteAccountSchema = new mongoose.Schema({
  name: {type: String},
  balance: {type: Number},
  draw: {type: Number},
  airdrop: {type: Boolean}
})

export default mongoose.model("vote_account", VoteAccountSchema, "vote_account")