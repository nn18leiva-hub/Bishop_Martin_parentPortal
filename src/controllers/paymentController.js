const db = require('../config/db');

const getInstructions = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM school_payment_info LIMIT 1');
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Payment instructions not found.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching payment instructions.' });
    }
};

const uploadReceipt = async (req, res) => {
    try {
        const { request_id, transfer_reference, payment_date } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a receipt image.' });
        }
        if (!request_id) {
            return res.status(400).json({ message: 'request_id is required.' });
        }

        const imagePath = `uploads/payment_receipts/${req.file.filename}`;
        
        const newPayment = await db.query(
            `INSERT INTO payments (request_id, receipt_image_path, transfer_reference, payment_date) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [request_id, imagePath, transfer_reference, payment_date || new Date()]
        );

        res.status(201).json({ message: 'Receipt uploaded successfully.', payment: newPayment.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error uploading receipt.' });
    }
};

module.exports = { getInstructions, uploadReceipt };
