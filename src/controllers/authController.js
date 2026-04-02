const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const registerParent = async (req, res) => {
    try {
        const { full_name, email, phone, password, user_type, dob } = req.body;
        
        if (!full_name || !email || !password) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const type = user_type || 'parent';
        if (!['parent', 'past_student'].includes(type)) {
            return res.status(400).json({ message: 'Invalid user_type. Must be parent or past_student.' });
        }

        if (!dob) {
            return res.status(400).json({ message: 'Date of birth (dob) is required to register for all users.' });
        }

        if (type === 'past_student') {
            const birthDate = new Date(dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            if (age < 18) {
                return res.status(403).json({ message: 'Past students must be 18 years or older to register.' });
            }
        }

        const emailCheck = await db.query('SELECT parent_id FROM parents WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered.' });
        }

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const newParent = await db.query(
            'INSERT INTO parents (full_name, email, phone, password_hash, user_type, dob) VALUES ($1, $2, $3, $4, $5, $6) RETURNING parent_id, full_name, email, user_type',
            [full_name, email, phone, password_hash, type, type === 'past_student' ? dob : null]
        );

        res.status(201).json({ message: 'User registered successfully.', user: newParent.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        let result = await db.query('SELECT * FROM parents WHERE email = $1', [email]);
        let user = result.rows[0];
        let userType = 'parent';
        
        if (!user) {
            result = await db.query('SELECT * FROM staff WHERE email = $1', [email]);
            user = result.rows[0];
            userType = 'staff';
        }

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const payload = {
            id: userType === 'parent' ? user.parent_id : user.staff_id,
            email: user.email,
            type: userType,
            role: userType === 'staff' ? user.role : undefined
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ message: 'Login successful', token, type: userType, id: payload.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

module.exports = { registerParent, login };
