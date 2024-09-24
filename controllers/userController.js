import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";

const loginUser = async(req, res) => {

    console.log(req.body);
    const {email, password} = req.body;

    try {
        const user = await userModel.findOne({email});

        if(!user){
            return res.json({success: false, message: "User not found, register to continue"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.json({success: false, message: "Invalud username or password!"})
        }

        const token = createToken(user._id);

        res.json({success: true, token});

    } catch (error) {
        console.log(error)
        res.json({success: false, message: "Error logging in user!"});
    }
}


const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET);
}


const registerUser = async(req, res) => {
    console.log("register", req.body);
    const {name, password, email} = req.body;

    try {
        const exist = await userModel.findOne({email});

        if(exist){
            return res.json({success: false, message: "User with email already exists!"});
        }

        if(!validator.isEmail(email)){
            return res.json({success: false, message: "Enter a valid email!"});
        }

        if(!validator.isStrongPassword(password)){
            return res.json({success: false, message: "Enter a strong password!"});
        }

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword
        });

        const user = await newUser.save();

        const token = createToken(user._id);

        return res.json({success: true, token});

    } catch (error) {
        console.log(error);
        return res.json({success: false, message: "Error registering user"});
    }
}



export {loginUser, registerUser}