const db = require('../config/db');
const bcrypt = require('bcrypt');

const createStaffUser = async (req, res) => {
    try {
        const { full_name, email, password, role } = req.body;
        
        if (!['viewer', 'admin', 'super_admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role.' });
        }

        const emailCheck = await db.query('SELECT staff_id FROM staff WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const newStaff = await db.query(
            'INSERT INTO staff (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING staff_id, full_name, email, role',
            [full_name, email, password_hash, role]
        );

        res.status(201).json({ message: 'Staff user created.', user: newStaff.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const deleteStaffUser = async (req, res) => {
    try {
        const { staff_id } = req.params;
        
        if (parseInt(staff_id) === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account.' });
        }

        const result = await db.query('DELETE FROM staff WHERE staff_id = $1 RETURNING staff_id', [staff_id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        res.json({ message: 'Staff user deleted successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error deleting staff user.' });
    }
};

const getAllStaffUsers = async (req, res) => {
    try {
        const result = await db.query('SELECT staff_id, full_name, email, role, created_at FROM staff ORDER BY role, full_name');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error.' });
    }
};

const getAllPublicUsers = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT parent_id as id, full_name, email, phone, user_type, verified, ssn_card_image_path, dob, created_at 
            FROM parents
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching public users.' });
    }
};

const overridePassword = async (req, res) => {
    try {
        const { targetEmail, newPassword } = req.body;
        if (!targetEmail || !newPassword) return res.status(400).json({ message: 'Email and new password required.' });

        const password_hash = await bcrypt.hash(newPassword, 10);
        
        let updateRes = await db.query('UPDATE parents SET password_hash = $1 WHERE email = $2 RETURNING parent_id', [password_hash, targetEmail]);
        if (updateRes.rows.length === 0) {
            updateRes = await db.query('UPDATE staff SET password_hash = $1 WHERE email = $2 RETURNING staff_id', [password_hash, targetEmail]);
        }

        if (updateRes.rows.length === 0) {
            return res.status(404).json({ message: 'User not found in any directory.' });
        }

        res.json({ message: `Successfully overrode password for ${targetEmail}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error attempting to override password.' });
    }
};

module.exports = { createStaffUser, getAllStaffUsers, deleteStaffUser, getAllPublicUsers, overridePassword };
