const { pool } = require('../config/database');

class Donation {
  // Simpan donasi baru
  static async create(name, email, amount) {
    try {
      const [result] = await pool.query(
        'INSERT INTO donations (name, email, amount) VALUES (?, ?, ?)',
        [name, email, amount]
      );
      return result.insertId;
    } catch (error) {
      console.error('Gagal menyimpan donasi:', error);
      throw error;
    }
  }

  // Ambil total donasi
  static async getTotalDonation() {
    try {
      const [rows] = await pool.query(
        'SELECT SUM(amount) as total_donasi FROM donations'
      );
      return rows[0].total_donasi || 0;
    } catch (error) {
      console.error('Gagal mengambil total donasi:', error);
      throw error;
    }
  }

  // Ambil riwayat donasi
  static async getDonationHistory() {
    try {
      const [rows] = await pool.query(
        'SELECT name, amount, donation_date FROM donations ORDER BY donation_date DESC LIMIT 10'
      );
      return rows;
    } catch (error) {
      console.error('Gagal mengambil riwayat donasi:', error);
      throw error;
    }
  }
}

module.exports = Donation;