const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  req.db.query('SELECT * FROM report', (err, report) => {
    if (err) throw err;
    res.render('report/index', { report, user: req.session.user });
  });
});

router.get('/add', (req, res) => {
  res.render('report/add', { user: req.session.user });
});

router.post('/add', (req, res) => {
  const { sector, message, location, report_date, status } = req.body;
  req.db.query(
    'INSERT INTO report (sector, message, location, report_date, status ) VALUES (?, ?, ?, ?, ?)',
    [sector, message, location, report_date, status],
    (err, result) => {
      if (err) throw err;
      res.redirect('/report');
    }
  );
});

router.get('/edit/:id', (req, res) => {
  req.db.query(
    'SELECT * FROM report WHERE id = ?',
    [req.params.id],
    (err, results) => {
      if (err) throw err;
      res.render('report/edit', { report: results[0], user: req.session.user });
    }
  );
});

router.post('/edit/:id', (req, res) => {
  const { sector, message, location, report_date, status } = req.body;
  req.db.query(
    'UPDATE report SET sector = ?, message = ?, location = ?, report_date = ?, status = ?, WHERE id = ?',
    [sector, message, location, report_date, status, req.params.id],
    (err, result) => {
      if (err) throw err;
      res.redirect('/report');
    }
  );
});

router.post('/edit/:id', (req, res) => {
  const { sector, message, location, report_date, status } = req.body;
  req.db.query(
    'UPDATE report SET sector = ?, message = ?, location = ?, report_date = ?, status = ?, WHERE id = ?',
    [sector, message, location, report_date, status, req.params.id],
    (err, result) => {
      if (err) throw err;
      res.redirect('/report');
    }
  );
});

module.exports = router;