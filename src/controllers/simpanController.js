const simpanService = require("../services/simpanService");

exports.postSimpan = async (req, res) => {
  try {
    const data = req.body;

    if (!data.noReg) {
      return res.status(400).json({
        success: false,
        message: "Nomor Registrasi (noReg) wajib diisi.",
      });
    }

    if (!data.namaLengkap) {
      return res.status(400).json({
        success: false,
        message: "Nama Lengkap wajib diisi.",
      });
    }

    const result = await simpanService.simpanIdentitasPasien(data);

    if (!result.success) {
      console.warn("Gagal Simpan (Logic):", result.message);

      return res.status(400).json({
        success: false,
        message: "Gagal Menyimpan Data",
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        noReg: data.noReg,
      },
    });
  } catch (error) {
    console.error("Error Server Controller:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server internal.",
      error: error.message,
    });
  }
};
