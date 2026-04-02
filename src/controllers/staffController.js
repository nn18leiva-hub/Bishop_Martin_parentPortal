const db = require('../config/db');

const getAllRequests = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT dr.*, p.full_name as parent_name, p.email as parent_email, p.verified as parent_verified, dt.name as document_type_name
            FROM document_requests dr
            JOIN parents p ON dr.parent_id = p.parent_id
            JOIN document_types dt ON dr.document_type_id = dt.document_type_id
            ORDER BY dr.request_date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const verifyParent = async (req, res) => {
    try {
        const { parent_id } = req.body;
        if (!parent_id) return res.status(400).json({ message: 'parent_id is required.' });

        await db.query('UPDATE parents SET verified = TRUE WHERE parent_id = $1', [parent_id]);
        res.json({ message: 'Parent verified successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const { payment_id } = req.body;
        if (!payment_id) return res.status(400).json({ message: 'payment_id is required.' });

        await db.query(
            'UPDATE payments SET verified = TRUE, verified_by_staff_id = $1 WHERE payment_id = $2', 
            [req.user.id, payment_id]
        );
        res.json({ message: 'Payment verified successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const updateRequestStatus = async (req, res) => {
    try {
        const { request_id, status } = req.body;
        if (!request_id || !status) return res.status(400).json({ message: 'request_id and status are required.' });

        if (!['pending', 'ready_for_pickup'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status.' });
        }

        const updated = await db.query(
            'UPDATE document_requests SET status = $1 WHERE request_id = $2 RETURNING *',
            [status, request_id]
        );

        if (updated.rows.length === 0) {
            return res.status(404).json({ message: 'Request not found.' });
        }

        res.json({ message: 'Status updated successfully.', request: updated.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { getAllRequests, verifyParent, verifyPayment, updateRequestStatus };
