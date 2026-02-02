const axios = require("axios");

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const apiResponse = await axios.post("http://10.10.0.89:3000/api/login", {
      username,
      password,
    });

    const dataDariServerLain = apiResponse.data;

    return res.status(200).json({
      success: true,
      data: dataDariServerLain,
    });
  } catch (error) {
    console.error("Error Login:", error.message);

    const status = error.response?.status || 500;
    const msg =
      error.response?.data?.message || "Gagal menghubungi server login.";

    return res.status(status).json({
      success: false,
      message: msg,
    });
  }
};
