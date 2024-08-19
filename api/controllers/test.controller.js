import jwt from "jsonwebtoken";

export const shouldBeLoggedIn = (req, res) => {
  console.log(req.userId);

  res.status(200).json({ message: "you are authenticated" });
};
export const shouldBeAdmin = (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err) return res.status(403).json({ message: "web token not valid" });
    if (!payload.isAdmin)
      return res.status(403).json({ message: "you are not an admin" });
  });

  res.status(200).json({ message: "you are authenticated" });
};
