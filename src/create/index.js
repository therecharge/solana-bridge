const Bridge_Info = require("../lib/Bridge_Info.json");
const _from = 0,
  _to = 1;
function create(DB) {
  return (req, res, next) => {
    const { chain, address } = req.body;
    const { from_token, to_token, bridge_address, sol_network } =
      Bridge_Info[chain[_from]][chain[_to]];

    if (!from_token) {
      res.send("wrong network");
      return;
    }

    const id = DB.recipes.length;
    DB.recipes.push(req.body);

    console.log("/create", id);
    console.table(req.body);

    res.send(
      JSON.stringify({
        id: id,
        bridge: bridge_address,
      })
    );
    return DB;
  };
}
module.exports = create;
