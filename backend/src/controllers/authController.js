import bcrypt from "bcryptjs";

import pool from "../config/db.js";

export const registerUser = async (req, res) => {
    try {
        const email = req.body?.email;
        const password = req.body?.password;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        // Check if user already exists
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to database
        const newUser = await pool.query(
            `INSERT INTO users (email, password_hash)
            VALUES ($1, $2)
            RETURNING id, email`,
            [email, hashedPassword]
        );

        // Success response
        res.status(201).json({
            message: "User registered successfully",
            user: newUser.rows[0],
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error",
        });
    }
};