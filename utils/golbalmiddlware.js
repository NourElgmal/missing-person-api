module.exports.Golbalmiddlware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "An unknown error occurred",
  });
};
