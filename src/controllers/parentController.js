const db = require('../config/db');

const uploadSSNCard = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image.' });
        }
        
        const imagePath = `uploads/ssn_cards/${req.file.filename}`;
        
        await db.query(
            'UPDATE parents SET ssn_card_image_path = $1 WHERE parent_id = $2',
            [imagePath, req.user.id]
        );

        res.json({ message: 'SSN card uploaded successfully.', imagePath });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during SSN card upload.' });
    }
};

const getProfile = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT parent_id, full_name, email, phone, ssn_card_image_path, verified, created_at FROM parents WHERE parent_id = $1',
            [req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Parent not found.' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { uploadSSNCard, getProfile };
