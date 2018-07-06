import mongoose from '../mongoutil'

let ActionSchema = new mongoose.Schema({
  action_num: {type: Number},
  trx_id: {type: String},
  cfa: {type: Boolean},
  account: {type: String},
  name: {type: String},
  authorization: {type: Array},
  hex_data: {type: String},
  data: {type: Object}
})

export default mongoose.model("actions", ActionSchema, "actions")