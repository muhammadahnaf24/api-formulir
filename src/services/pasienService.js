const { sql, poolPromise } = require("../config/db");

// Fungsi khusus untuk mengambil data dari Database
exports.getPasienDataByReg = async (noReg) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().input("noReg", sql.VarChar, noReg)
      .query(`
        SELECT 
          a.vc_no_reg,
          b.vc_no_rm,
          b.vc_nama_p,
          b.vc_tp_lhr,
          b.dt_tgl_lhr,
          b.vc_jenis_k,
          kwn.vc_stkawin,
          agm.vc_agama,
          pddk.vc_pendidikan,
          kerja.vc_pekerjaan,
          b.vc_telpon,
          b.vc_alamat,
          b.vc_kelurahan,
          b.vc_kecamatan,
          b.vc_kota,
          b.vc_propinsi,
          a.vc_n_wali,
          hub.vc_hubungan,
          a.vc_alamat_w,
          b.vc_nik

        FROM RMP_inap a 
        LEFT JOIN RMPasien b ON a.vc_no_rm = b.vc_no_rm
        LEFT JOIN PubAgama agm ON b.vc_k_agm = agm.vc_kode
        LEFT JOIN PubHubungan hub ON a.vc_hub_wali = hub.vc_kode
        LEFT JOIN PubPddk pddk ON b.vc_k_pend = pddk.vc_kode
        LEFT JOIN PubKerja kerja ON b.vc_k_pek = kerja.vc_kode
        LEFT JOIN PubStkawin kwn ON b.vc_k_status = kwn.vc_kode

        WHERE vc_no_reg = @noReg
      `);

    // Kembalikan baris pertama jika ada, atau undefined jika kosong
    return result.recordset[0];
  } catch (error) {
    // Lempar error agar bisa ditangkap controller
    throw error;
  }
};
