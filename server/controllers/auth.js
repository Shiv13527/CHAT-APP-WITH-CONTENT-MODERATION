const { connect } = require('getstream');
const bcrypt = require('bcrypt');
const StreamChat = require('stream-chat').StreamChat;
const crypto = require('crypto');

require('dotenv').config();

const api_key = process.env.STREAM_API_KEY;
const api_secret = process.env.STREAM_API_SECRET;
const app_id = process.env.STREAM_APP_ID;

const signup = async (req, res) => {
    try {
        const { fullName, username, password, phoneNumber } = req.body;

        const userId = crypto.randomBytes(16).toString('hex');

        const serverClient = connect(api_key, api_secret, app_id);
// HERE WE DO ENCRYPTION OF CLIENT PASSWORD HERE 10 REPRESENTS THE LEVEL OF ENCRYPTION,HERE THIS LINE CONVERT THE PLAIN LINE PSSWORD TO HASHED PASSWORD
        const hashedPassword = await bcrypt.hash(password, 10);

        const token = serverClient.createUserToken(userId);
// WE DIRECTLY GET THESE OBJECTS VALUE FROM THE FRONTEND
        res.status(200).json({ token, fullName, username, userId, hashedPassword, phoneNumber });
    } catch (error) {
        console.log(error);

        res.status(500).json({ message: error });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        // CONNECT WITH THE CLIENT
        const serverClient = connect(api_key, api_secret, app_id);
        // MAKING AN INSTANCE FOR THE CLIENT
        const client = StreamChat.getInstance(api_key, api_secret);
//  HERE WE CAN CHECK IS THE USERIS PRESENT IN DATA BASE OR NOT
        const { users } = await client.queryUsers({ name: username });
//    IF USER CANNOT FOUND THEN GIVE THAT MESSAGE
        if(!users.length) return res.status(400).json({ message: 'User not found' });
//  HERE WE DECRYPT THE PASSWORD ENTERED BY THE USER
        const success = await bcrypt.compare(password, users[0].hashedPassword);

        const token = serverClient.createUserToken(users[0].id);

        if(success) {
            res.status(200).json({ token, fullName: users[0].fullName, username, userId: users[0].id});
        } else {
            res.status(500).json({ message: 'Incorrect password' });
        }
    } catch (error) {ads
        console.log(error);

        res.status(500).json({ message: error });
    }
};

module.exports = { signup, login };