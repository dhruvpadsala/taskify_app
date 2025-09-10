function sendResponse(res, statusCode, message, data = []) {
  const statusPrefix =
    statusCode >= 200 && statusCode < 300 ? "taskify_MS_" : "taskify_ERR_";

  console.log("res", res.status, statusCode, message, data);

  res.status(statusCode).json({
    error_status: `${statusPrefix}${statusCode}`,
    message,
    data,
  });
}

module.exports = sendResponse;
