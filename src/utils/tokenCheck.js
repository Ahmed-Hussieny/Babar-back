// export const validateToken = (token) => {
//     //check if token expired or not
//     const { token } = req.query;
//     if (!token) return next({ message: "Token is missing", cause: 400 });
//     const decodedData = jwt.verify(token, process.env.JWT_SECRET);
//     if (!decodedData) return next({ message: "Token is invalid", cause: 400 });
//     res.status(200).json({ success: true, message: "Token is valid" });
// };