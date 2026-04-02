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
        res.status(500).json({ message: 'Server error.' });
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

module.exports = { createStaffUser, deleteStaffUser, getAllStaffUsers };
