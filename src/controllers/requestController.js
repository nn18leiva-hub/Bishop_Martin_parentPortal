const db = require('../config/db');
const { generateDocument } = require('../services/pdfGenerator');

const createRequest = async (req, res) => {
    try {
        const { document_type_id, student_bemis_id, student_full_name, student_graduation_year_or_years_attended, form_data, delivery_method } = req.body;
        const parentId = req.user.id;

        const parentResult = await db.query('SELECT * FROM parents WHERE parent_id = $1', [parentId]);
        const parent = parentResult.rows[0];

        const dtResult = await db.query('SELECT * FROM document_types WHERE document_type_id = $1', [document_type_id]);
        if (dtResult.rows.length === 0) {
            return res.status(404).json({ message: 'Invalid document type.' });
        }
        const documentType = dtResult.rows[0];

        if (!['pickup', 'mailed', 'emailed'].includes(delivery_method)) {
             return res.status(400).json({ message: 'Invalid delivery_method. Must be pickup, mailed, or emailed.' });
        }

        if (parent.user_type === 'past_student' && documentType.name !== 'transcript') {
            return res.status(403).json({ message: 'Past students are only authorized to request transcripts.' });
        }

        let initialStatus = 'pending';
        let alertMessage = 'Document request created successfully.';

        if (!parent.verified) {
             initialStatus = 'pending_verification';
             alertMessage = 'Request submitted. It is currently pending identity verification.';
        }

        let generated_file_path = null;

        if (documentType.is_auto_generated) {
             if (!req.file) {
                 return res.status(400).json({ message: 'A digital signature image upload is required for this form.' });
             }
             generated_file_path = await generateDocument(documentType, parent, req.body, req.file);
        }

        const newReq = await db.query(
            `INSERT INTO document_requests 
             (parent_id, student_bemis_id, student_full_name, student_graduation_year_or_years_attended, document_type_id, form_data, generated_file_path, delivery_method, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [parentId, student_bemis_id, student_full_name, student_graduation_year_or_years_attended, document_type_id, form_data ? JSON.stringify(form_data) : null, generated_file_path, delivery_method, initialStatus]
        );

        res.status(201).json({ message: alertMessage, request: newReq.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during request creation.' });
    }
};

const getMyRequests = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT dr.*, dt.name as document_type_name, dt.requires_payment
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
            `SELECT dr.*, dt.name as document_type_name, dt.requires_payment
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
