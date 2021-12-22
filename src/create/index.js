const Bridge_Info = require("../lib/Bridge_Info.json");
const DB = require("../lib/DB.js");

const _from = 0,
  _to = 1;

function create() {
  return async (req, res, next) => {
    const { chain, address } = req.body;
    const { from_token, to_token, bridge_address, sol_network } =
      Bridge_Info[chain[_from]][chain[_to]];

    if (!from_token) {
      res.send("wrong network");
      return;
    }

    // const id = DB.recipes.length;
    // DB.recipes.push(req.body);
    const id = await DB.createRecipe([
      chain[_from],
      chain[_to],
      address[_from],
      address[_to],
    ]);

    console.log("/create", id);
    console.table(req.body);

    res.send({
      id: id,
      bridge: bridge_address,
    });
    return;
  };
}
module.exports = create;
