const MasterModel = require("../models/masterModels");
const sendResponse = require("../helpers/response");

exports.getMasterData = async (req, res) => {
  try {
    const { master, com_id } = req.query;
    console.log("comId", com_id);
    const data = await MasterModel.getMasterData(master, com_id);
    sendResponse(res, 200, "Success API load", data);
  } catch (err) {
    sendResponse(res, 500, err.message, {});
  }
};
