const db = require('../config/db');

const createRequest = async (req, res) => {
    try {
        const { document_type_id, student_bemis_id, student_full_name, student_graduation_year_or_years_attended } = req.body;
        
        const parentId = req.user.id;

        const parentResult = await db.query('SELECT verified, ssn_card_image_path FROM parents WHERE parent_id = $1', [parentId]);
        const parent = parentResult.rows[0];

        if (!parent.ssn_card_image_path) {
            return res.status(403).json({ message: 'You must upload your SSN card before making requests.' });
        }

        const newReq = await db.query(
            `INSERT INTO document_requests (parent_id, student_bemis_id, student_full_name, student_graduation_year_or_years_attended, document_type_id)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [parentId, student_bemis_id, student_full_name, student_graduation_year_or_years_attended, document_type_id]
        );

        res.status(201).json({ message: 'Document request created successfully.', request: newReq.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during request creation.' });
    }
};

const getMyRequests = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT dr.*, dt.name as document_type_name
             FROM document_requests dr 
             JOIN document_types dt ON dr.document_type_id = dt.document_type_id
             WHERE dr.parent_id = $1 ORDER BY request_date DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching requests.' });
    }
};

const getRequestById = async (req, res) => {
    try {
        const { request_id } = req.params;
        const result = await db.query(
            `SELECT dr.*, dt.name as document_type_name
             FROM document_requests dr 
             JOIN document_types dt ON dr.document_type_id = dt.document_type_id
             WHERE dr.request_id = $1 AND dr.parent_id = $2`,
            [request_id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Request not found.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching request.' });
    }
};

module.exports = { createRequest, getMyRequests, getRequestById };
