const { sql, poolPromise } = require("../config/db");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();

exports.simpanIdentitasPasien = async (data) => {
  const pool = await poolPromise;
  const transaction = await pool.transaction();
  console.log("data ttd", data.tandaTangan);
  try {
    let dbSignaturePath = null;

    if (data.tandaTangan) {
      const tempDir = path.join(__dirname, "../../public/temp_signatures");

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const networkDir = process.env.NETWORK_PATH;

      if (!fs.existsSync(networkDir)) {
        throw new Error(
          "❌ Koneksi ke Network Storage (10.10.0.60) terputus/tidak dapat diakses.",
        );
      }

      const matches = data.tandaTangan.match(
        /^data:([A-Za-z-+\/]+);base64,(.+)$/,
      );

      if (matches && matches.length === 3) {
        const buffer = Buffer.from(matches[2], "base64");
        const filename = data.noReg + ".png";

        const tempFilePath = path.join(tempDir, filename);
        const networkFilePath = path.join(networkDir, filename);

        fs.writeFileSync(tempFilePath, buffer);
        console.log("✅ File ditulis di temp lokal:", tempFilePath);

        try {
          fs.copyFileSync(tempFilePath, networkFilePath);
          console.log("✅ File berhasil dicopy ke network:", networkFilePath);
        } catch (err) {
          if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
          throw new Error(`Gagal menyalin file ke 10.10.0.60: ${err.message}`);
        }

        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        console.log("✅ File dihapus dari temp lokal:", tempFilePath);

        dbSignaturePath = path.join(networkDir, filename);
      } else {
        console.warn(
          "⚠️ Peringatan: Format tanda tangan tidak sesuai regex atau rusak.",
        );
      }
    }

    await transaction.begin();

    const kodeJenisRM = "RI001";
    const idRekamMedis = crypto.randomUUID();

    const reqUpdate = new sql.Request(transaction);
    reqUpdate.input("noRm", sql.VarChar(20), data.noRm);
    reqUpdate.input("kdJenis", sql.VarChar(50), kodeJenisRM);

    const queryUpdate = `
        UPDATE _RMEI_RekamMedisH
        SET 
            bt_aktif = 0

        WHERE 
            vc_NoRM = @noRm                   
            AND c_KdJnsRekamMedis = @kdJenis      
            AND bt_aktif = 1;             
    `;

    await reqUpdate.query(queryUpdate);

    // ==============================================================================================================================
    const reqHeader = new sql.Request(transaction);

    reqHeader.input("idRekamMedis", sql.VarChar(50), idRekamMedis);
    reqHeader.input("noReg", sql.VarChar(50), data.noReg);
    reqHeader.input("noRm", sql.VarChar(50), data.noRm);
    reqHeader.input("kdJnsRekamMedis", sql.VarChar(50), kodeJenisRM);

    const queryHeader = `
      INSERT INTO _RMEI_RekamMedisH (
        vc_idRekamMedis, vc_NoReg, vc_NoRM, c_KdJnsRekamMedis, dt_tglTrans, dt_CreatedDate, bt_aktif
      )
      VALUES (
        @idRekamMedis, @noReg, @noRm, @kdJnsRekamMedis, GETDATE(), GETDATE(), 1
      );
    `;

    await reqHeader.query(queryHeader);

    // ==============================================================================================================================

    const request = new sql.Request(transaction);

    request.input("idRekamMedis", sql.VarChar(36), idRekamMedis);
    request.input("noReg", sql.VarChar(20), data.noReg);
    request.input("noRm", sql.VarChar(20), data.noRm || null);
    request.input("nik", sql.VarChar(16), data.noKtp || null);
    request.input("namaLengkap", sql.VarChar(150), data.namaLengkap);
    request.input("tempatLahir", sql.VarChar(100), data.tempatLahir || null);
    const tglLahir = data.tanggalLahir ? new Date(data.tanggalLahir) : null;
    request.input("tanggalLahir", sql.Date, tglLahir);
    request.input("umurTahun", sql.Int, data.umurTahun || 0);
    request.input("umurBulan", sql.Int, data.umurBulan || 0);
    request.input("jenisKelamin", sql.VarChar(50), data.jenisKelamin || null);
    request.input("statusPerkawinan", sql.VarChar(50), data.status || null);
    request.input("agama", sql.VarChar(50), data.agama || null);
    request.input("pendidikan", sql.VarChar(50), data.pendidikan || null);
    request.input("pekerjaan", sql.VarChar(100), data.pekerjaan || null);
    request.input("noHp", sql.VarChar(20), data.noHp || null);
    request.input("alamat", sql.VarChar(sql.MAX), data.alamat || null);
    request.input("desa", sql.VarChar(100), data.desa || null);
    request.input("kecamatan", sql.VarChar(100), data.kecamatan || null);
    request.input("kabupaten", sql.VarChar(100), data.kabupaten || null);
    request.input("provinsi", sql.VarChar(100), data.provinsi || null);
    request.input("namaW", sql.VarChar(150), data.daruratNama || null);
    request.input("hubunganW", sql.VarChar(50), data.hubungan || null);
    request.input("nohpW", sql.VarChar(20), data.daruratHp1 || null);
    request.input("nohp2W", sql.VarChar(20), data.daruratHp2 || null);
    request.input("alamatW", sql.VarChar(sql.MAX), data.daruratAlamat || null);
    request.input("tandaTangan", sql.VarChar(sql.MAX), dbSignaturePath || null);

    const query = `
      INSERT INTO _RM_IdentitasPasien (

        vc_idRekamMedis, vc_no_reg, vc_no_rm, vc_nik, 
        vc_nama_lengkap, vc_tempat_lahir, vc_tanggal_lahir,   
        vc_umur_tahun, vc_umur_bulan, vc_jenis_kelamin, vc_status_perkawinan, 
        vc_agama, vc_pendidikan, vc_pekerjaan, vc_no_hp, 
        vc_alamat, vc_desa, vc_kecamatan, vc_kabupaten, vc_provinsi, 
        vc_nama_w, vc_hubungan_w, vc_nohp_w, vc_nohp2_w, vc_alamat_w, 
        created_at, tanda_tangan
      )
      VALUES (
        @idRekamMedis, @noReg, @noRm, @nik, 
        @namaLengkap, @tempatLahir, @tanggalLahir, 
        @umurTahun, @umurBulan, @jenisKelamin, @statusPerkawinan, 
        @agama, @pendidikan, @pekerjaan, @noHp, 
        @alamat, @desa, @kecamatan, @kabupaten, @provinsi, 
        @namaW, @hubunganW, @nohpW, @nohp2W, @alamatW, 
        GETDATE(), @tandaTangan
      );
    `;

    await request.query(query);

    await transaction.commit();

    return { success: true, message: "Data baru berhasil ditambahkan." };
  } catch (error) {
    if (transaction) await transaction.rollback();

    console.error("Error Simpan:", error);
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    throw error;
  }
};
