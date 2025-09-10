const MasterModel = require("../models/masterModels");
const sendResponse = require("../helpers/response");

exports.getMasterData = async (req, res) => {
  try {
    const { master } = req.query;
    const data = await MasterModel.getMasterData(master);
    sendResponse(res, 200, "Success API load", data);
  } catch (err) {
    sendResponse(res, 500, err.message, {});
  }
};
