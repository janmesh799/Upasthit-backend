const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator')
const Student = require('../../Models/StudentSchema.js');

const secretKey = process.env.SECRET_KEY;

const loginStudent = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() })
        }
        let { email, password, deviceType } = req.body;
        email = email.toLowerCase();
        const student = await Student.findOne({ email }).select('+password');
        if (student) {
            const isMatch = await bcrypt.compare(password, student.password);
            if (isMatch) {
                const user = {
                    id: student.id,
                    userType: student.userType,
                    deviceType
                };
                const authToken = jwt.sign(
                    user,
                    secretKey,
                );
                const loggedInStudent = {id:student.id ,name: student.name, userType: student.userType, email: student.email, batch:student.batch,branch:student.branch,rollno:student.rollno,courses:student.courses };
                res.status(200).json({ success: true, authToken, loggedInStudent });
            } else {
                res.status(400).json({ success: false, message: "Invalid credentials" });
            }
        }
        else {
            res.status(400).json({ success: false, msg: "Invalid credentials" });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, msg: "Server error" });
    }
}

module.exports = loginStudent;