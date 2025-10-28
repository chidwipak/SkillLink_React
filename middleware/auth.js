// Authentication middleware
exports.isLoggedIn = (req, res, next) => {
  if (req.session.user) {
    return next()
  }
  req.flash("error", "Please login to access this page")
  res.redirect("/auth/login")
}

// Role-based middleware
exports.isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    return next()
  }
  req.flash("error", "Access denied. Admin privileges required")
  res.redirect("/")
}

exports.isCustomer = (req, res, next) => {
  if (req.session.user && req.session.user.role === "customer") {
    return next()
  }
  req.flash("error", "Access denied. Customer privileges required")
  res.redirect("/")
}

exports.isWorker = (req, res, next) => {
  if (req.session.user && req.session.user.role === "worker") {
    return next()
  }
  req.flash("error", "Access denied. Worker privileges required")
  res.redirect("/")
}

exports.isSeller = (req, res, next) => {
  if (req.session.user && req.session.user.role === "seller") {
    return next()
  }
  req.flash("error", "Access denied. Seller privileges required")
  res.redirect("/")
}

// Combined middleware for multiple roles
exports.isAdminOrSeller = (req, res, next) => {
  if (req.session.user && (req.session.user.role === "admin" || req.session.user.role === "seller")) {
    return next()
  }
  req.flash("error", "Access denied. Admin or Seller privileges required")
  res.redirect("/")
}

exports.isAdminOrWorker = (req, res, next) => {
  if (req.session.user && (req.session.user.role === "admin" || req.session.user.role === "worker")) {
    return next()
  }
  req.flash("error", "Access denied. Admin or Worker privileges required")
  res.redirect("/")
}
