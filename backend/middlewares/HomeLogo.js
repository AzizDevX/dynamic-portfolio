function HomeLogoFolder(req, res, next) {
  if (req.query.folder != "logo") {
    return res
      .status(409)
      .json({ message: "You Did Something Wrong invalide folder name" });
  }
  next();
}
export default HomeLogoFolder;
