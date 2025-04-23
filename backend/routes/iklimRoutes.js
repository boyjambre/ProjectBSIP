const router = require('express').Router();
const ctrl = require('../controllers/iklimController');

router.post('/upload', ctrl.uploadExcel);
router.get('/search', ctrl.searchData);
router.get('/export/excel', ctrl.exportExcel);
router.get('/export/pdf', ctrl.exportPDF);
router.get('/stations', ctrl.getStationNames);

module.exports = router;
