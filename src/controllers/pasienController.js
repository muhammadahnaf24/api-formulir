const pasienService = require("../services/pasienService");

exports.getPasienByReg = async (req, res) => {
  try {
    const { noReg } = req.params;
    const pasienData = await pasienService.getPasienDataByReg(noReg);

    if (pasienData) {
      return res.json({
        success: true,
        data: pasienData,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Data Pasien tidak ditemukan",
      });
    }
  } catch (err) {
    console.error("Error di getPasienByReg:", err);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};
