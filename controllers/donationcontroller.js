const Donation = require('../models/Donation');

class DonationController {
  // Render halaman donasi
  static async renderDonationPage(req, res) {
    try {
      const totalDonation = await Donation.getTotalDonation();
      const donationHistory = await Donation.getDonationHistory();
      
      res.render('donation', { 
        totalDonation, 
        donationHistory 
      });
    } catch (error) {
      res.status(500).render('error', { 
        message: 'Cant reload' 
      });
    }
  }

  // Proses donasi
  static async processDonation(req, res) {
    try {
      const { name, email, amount } = req.body;

      // Validasi input
      if (!name || !email || !amount) {
        return res.status(400).json({ 
          error: 'All field must be placed' 
        });
      }

      // Simpan donasi
      const donationId = await Donation.create(name, email, amount);

      res.status(201).json({ 
        message: 'Donation successful', 
        donationId 
      });
    } catch (error) {
      console.error('Error donasi:', error);
      res.status(500).json({ 
        error: 'Gagal memproses donasi' 
      });
    }
  }

  // Ambil total donasi
  static async getTotalDonation(req, res) {
    try {
      const totalDonation = await Donation.getTotalDonation();
      res.json({ totalDonation });
    } catch (error) {
      res.status(500).json({ 
        error: 'Gagal mengambil total donasi' 
      });
    }
  }
}

module.exports = DonationController;