function CvFolder(req, res, next) {
  if (req.query.folder != "mycv") {
    return res
      .status(409)
      .json({ message: "You Did Something Wrong invalide folder name" });
  }
  next();
}
export default CvFolder;
