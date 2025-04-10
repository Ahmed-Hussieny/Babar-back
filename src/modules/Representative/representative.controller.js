import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Representative from '../../../DB/Models/representative.model.js';

//& =============================  ADD REPRESENTATIVE =============================
export const addRepresentative = async (req, res, next) => {
  const { name, address, phone, email, password } = req.body;
  const { _id: addedBy } = req.authUser;

  // check if Representative exists
  const isRepresentativeExists = await Representative.findOne({ email });
  if (isRepresentativeExists)
    return next({ message: "هذا المندوب موجود بالفعل", cause: 400 });

  const newRepresentative = await Representative.create({
    name,
    address,
    phone,
    email,
    password: bcrypt.hashSync(password, +process.env.HASH_SALT),
    addedBy,
  });
  if (!newRepresentative)
    return next({ message: "لم يتم إنشاء المندوب", cause: 500 });

  res.status(201).json({
    success: true,
    message: "تمت إضافة المندوب بنجاح",
    representative: newRepresentative,
  });
};

//& =============================  GET REPRESENTATIVES =============================
export const getRepresentatives = async (req, res) => {
  const representatives = await Representative.find();
  res.status(200).json({
    message: "Representatives fetched successfully",
    representatives,
  });
};

//& =========================== Login REPRESENTATIVE ===========================
export const loginRepresentative = async (req, res, next) => {
  const { email, password } = req.body;

  const representative = await Representative.findOne({ email });
  if (!representative) return next({ message: "لم يتم العثور على المندوب", cause: 404 });

  // check if representative is verified
  if (!representative.isVerified)
    return next({ message: "هذا المندوب غير مفعل تواصل مع المسؤول", cause: 401 });

  // check if password is correct
  const isPasswordValid = bcrypt.compareSync(password, representative.password);
  if (!isPasswordValid)
    return next({ message: "كلمة المرور غير صالحة", cause: 400 });

  // create token
  const token = jwt.sign({ _id: representative._id }, process.env.JWT_SECRET);
  representative.token = token;
  await representative.save();

  return res.status(200).json({
    success: true,
    message: "تم تسجيل دخول المندوب بنجاح",
    representative,
    token,
  });
};

//& =========================== Verify REPRESENTATIVE ===========================
export const verifyRepresentative = async (req, res, next) => {
  const { representativeId } = req.params;
  const representative = await Representative.findById(representativeId);
  if (!representative)
    return next({ message: "Representative is not found", cause: 404 });

  representative.isVerified = !representative.isVerified;
  await representative.save();

  return res.status(200).json({
    success: true,
    message: "Representative is verified successfully",
    representative,
  });
};

//&=========================== MARK REPRESENTATIVE AS OPEN ==========================
export const toggleRepresentative = async (req, res, next) => {
  const { representativeId } = req.params;
  const representative = await Representative.findById(representativeId);
  if (!representative)
    return next({ message: "representative is not found", cause: 404 });

  representative.status = !representative.status;
  await representative.save();
  if (representative.status)
    return res
      .status(200)
      .json({ success: true, message: "Representative is open now", representative });
  return res
    .status(200)
    .json({ success: true, message: "Representative is closed now", representative });
};

//& ============================= Get REPRESENTATIVE By ID =============================
export const getRepresentative = async (req, res, next) => {
  const { representativeId } = req.params;
  const representative = await Representative.findById(representativeId);
  if (!representative)
    return next({ message: "Representative is not found", cause: 404 });
  return res
    .status(200)
    .json({
      success: true,
      message: "Representative fetched successfully",
      representative,
    });
};

//& ============================= Get LoogedIn REPRESENTATIVE =========================
export const getLoggedInRepresentative = async (req, res, next) => {
  const { accesstoken } = req.headers;
  const representative = await Representative.findOne({ token: accesstoken });
  if (!representative)
    return next({ message: "Representative is not found", cause: 404 });
  return res
    .status(200)
    .json({
      success: true,
      message: "Representative fetched successfully",
      representative,
    });
};

//& ============================= Update Logged In REPRESENTATIVE =============================
export const updateRepresentative = async (req, res, next) => {
  const { id } = req.params;
  const { name, address, phone, email } = req.body;
  const representative = await Representative.findById(id);
  if (!representative)
    return next({ message: "Representative is not found", cause: 404 });

  if (name) representative.name = name;
  if (address) representative.address = address;
  if (phone) representative.phone = phone;
  if (email) representative.email = email;

  const updatedRepresentative = await representative.save();
  if (!updatedRepresentative)
    return next({ message: "Representative is not updated", cause: 500 });

  return res.status(200).json({
    success: true,
    message: "Representative updated successfully",
    representative: updatedRepresentative,
  });
};

//& ============================= Update Logged In REPRESENTATIVE Password =============================
export const updateRepresentativePassword = async (req, res, next) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  const representative = await Representative.findById(id);
  if (!representative)
    return next({ message: "Representative is not found", cause: 404 });

  const isPasswordValid = bcrypt.compareSync(oldPassword, representative.password);
  if (!isPasswordValid)
    return next({ message: "Old password is not correct", cause: 400 });

  const hashedPassword = bcrypt.hashSync(newPassword, +process.env.HASH_SALT);
  representative.password = hashedPassword;
  const updatedRepresentative = await representative.save();
  if (!updatedRepresentative)
    return next({ message: "Representative password is not updated", cause: 500 });

  return res.status(200).json({
    success: true,
    message: "Representative password is updated successfully",
    representative: updatedRepresentative,
  });
};
