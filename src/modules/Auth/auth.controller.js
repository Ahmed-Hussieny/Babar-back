import jwt from 'jsonwebtoken';
import User from '../../../DB/Models/user.model.js';
import bcrypt from 'bcryptjs';
import sendEmailService from '../../services/send-email.services.js';
import { verificationEmailTemplate } from '../../utils/verify-email-templet.js';
import  { generateUniqueCode } from '../../utils/generateUniqueString.js';
import crypto from 'crypto';

//& ===================== SIGN UP API =====================
export const signUp = async (req, res, next) => {
    // 1- destructure the request body
    const {username, email, password} = req.body;
    // 2- check if user is already registered
    
    const isEmailDuplicated = await User.findOne({email});
    if(isEmailDuplicated) return next({message: 'Email is already registered', cause: 400});
    // 3- hashing the password
    const hashedPassword = bcrypt.hashSync(password, +process.env.HASH_SALT);

    // send Email to the user with the verification link
    const userToken = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRATION});
    const isEmailSent = await sendEmailService({
        to: email,
        subject: 'Email verification',
        message: verificationEmailTemplate(username,`${process.env.CLIENT_URL}/verifyEmail/${userToken}`)
    });
    if(!isEmailSent) return next({message: 'Email is not sent', cause: 500});

    // 4- create a new user
    const newUser = await User.create({username, email, password:hashedPassword});
    if(!newUser) return next({message: 'User is not created', cause: 500});

    // 5- send the response
    return res.status(201).json({success:true, message: 'User is created successfully', user: newUser});
}

//& ===================== VERIFY EMAIL API =====================
export const verifyEmail = async (req, res, next) => {
    // 1- get the user token from the query
    const {userToken} = req.query;
    if(!userToken) return next({message: 'User token is missing', cause: 400});

    // 2- verify the user token
    const decodedData = jwt.verify(userToken, process.env.JWT_SECRET);
    if(!decodedData) return next({message: 'User token is invalid', cause: 400});
    
    // 3- find the user by the email
    const user = await User.findOne({email: decodedData.email});
    if(!user) return next({message: 'User is not found', cause: 404});
    
    // 4- update the user status to verified
    user.isVerified = true;
    await user.save();
    
    // 5- send the response
    return res.status(200).json({success:true, message: 'Email is verified successfully', user});
};

// & ==================== RESEND VERIFICATION EMAIL ===========
export const resendVerificationEmail = async (req, res, next) => {
    // 1- get the email from the request body
    const {token} = req.body;
    // 2- decode the token
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    if(!decodedData) return next({message: 'Token is invalid', cause: 400});
    const {email} = decodedData;
    // 2- find the user by the email
    const user = await User.findOne({email});
    if(!user) return next({message: 'User is not found', cause: 404});
    // 3- check if the user is already verified
    if(user.isVerified) return next({message: 'User is already verified', cause: 400});
    // 4- generate the token
    const userToken = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRATION});
    // 5- send the email
    const isEmailSent = await sendEmailService({
        to: email,
        subject: 'Email verification',
        message: verificationEmailTemplate(user.username,`${process.env.CLIENT_URL}/verifyEmail/${userToken}`)
    });
    if(!isEmailSent) return next({message: 'Email is not sent', cause: 500});
    // 6- send the response
    return res.status(200).json({success:true, message: 'Email is sent successfully', user});
};

//& ===================== SIGN IN API =====================
export const signIn = async (req, res, next) => {
    // 1- get the email and password from the request body
    const {email, password} = req.body;
    
    // 2- find the user by the email
    const user = await User.findOne({email});
    if(!user) return next({message: 'User is not found', cause: 404});
    
    // 3- check if the user is verified
    if(!user.isVerified) return next({message: 'User is not verified', cause: 401});

    // 4- check the password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if(!isPasswordValid) return next({message: 'Password is not correct', cause: 400});

    // 5- generate the token
    const userToken = jwt.sign({email, role:user.role, id:user._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRATION});

    // 6- update the user status to logged in
    user.isloggedIn = true;
    user.token = userToken;
    await user.save();

    // 7- send the response
    return res.status(200).json({success:true, message: 'User is logged in successfully', userData: user, userToken});
};

//& ===================== RESET PASSWORD API =====================
export const forgotPassword = async (req, res, next) => {
    // 1- get the email from the request body
    const {email} = req.body;
    // 2- find the user by the email
    const user = await User.findOne({email});
    if(!user) return next({message: 'User is not found', cause: 404 });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordToken = resetToken;
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const isEmailSent = await sendEmailService({
        to: email,
        subject: 'Email Forgot Password',
        message:`<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 15 minutes.</p>`,
    });
    if(!isEmailSent) return next({message: 'Email is not sent', cause: 500});

    return res.status(200).json({
        success:true,
        message: "Reset password code sent to your email"
    })
};

//& ===================== VERIFY RESET CODE ======================= 
export const verifyResetToken = async (req, res, next) => {
    // 1- get the reset code from the request body
    const { token } = req.query;

    // 2- Find the user by email
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordTokenExpires: { $gt: Date.now() }, // Check expiry
      });
    if (!user) return next({ message: " لقد انتهت مدة التغيير يمكنك ارسال رمز التغيير مرة اخرى", cause: 404 });
    return res.status(200).json({success: true, message: "Token is valid"});
};

//& ================= RESET PASSWORD =======================
export const resetPassword = async (req, res, next) => {
    // 1- Get email, reset code, and new password from request body
    const { token, newPassword } = req.body;

    // 2- Find the user by reset token
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordTokenExpires: { $gt: Date.now() },
      });
    if (!user) return next({ message: " لقد انتهت مدة التغيير يمكنك ارسال رمز التغيير مرة اخرى", cause: 404 });
    // 3- Hash the new password and save it
    const hashedPassword = bcrypt.hashSync(newPassword, +process.env.HASH_SALT);
    user.password = hashedPassword; 

    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;

    await user.save();

    return res.status(200).json({
        success:true,
        message: "Password successfully reset",
    });
};


//& ===================== Update Logged In User =====================
export const updateLoggedInUser = async (req, res, next) => {
    //* get the user data from the request body
    const { username, email} = req.body;
    const { _id:userId } = req.authUser;
    
    //* check if the user is found
    const user = await User.findById(userId);
    if(!user) return next({message: 'User is not found', cause: 404});

    //* update the user data
    if(username) user.username = username;
    if(email) user.email = email;
    const updatedUser = await user.save();
    if(!updatedUser) return next({message: 'User is not updated', cause: 500});
    return res.status(200).json({success:true, message: 'User is updated successfully', user: updatedUser});
};

//& ===================== Update Logged In User Password =====================
export const updateLoggedInUserPassword = async (req, res, next) => {
    console.log('updateLoggedInUserPassword');
    const { oldPassword, newPassword } = req.body;
    const { _id:userId } = req.authUser;
    //* check if the user is found
    const user = await User.findById(userId);
    if(!user) return next({message: 'User is not found', cause: 404});
    //* check if the old password is correct
    const isValidPassword = bcrypt.compareSync(oldPassword, user.password);
    if(!isValidPassword) return next({message: 'Old password is not correct', cause: 400});
    //* hash the new password
    const hashedPassword = bcrypt.hashSync(newPassword, +process.env.HASH_SALT);
    user.password = hashedPassword;
    const updatedUser = await user.save();
    if(!updatedUser) return next({message: 'User password is not updated', cause: 500});
    return res.status(200).json({success:true, message: 'User password is updated successfully', user: updatedUser});
};