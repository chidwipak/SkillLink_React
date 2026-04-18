const trimObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return obj.trim();
  if (Array.isArray(obj)) return obj.map(trimObject);
  if (typeof obj === 'object') {
    const trimmed = {};
    for (const key of Object.keys(obj)) {
      trimmed[key] = trimObject(obj[key]);
    }
    return trimmed;
  }
  return obj;
};

const trimStrings = (req, res, next) => {
  if (req.body) req.body = trimObject(req.body);
  if (req.query) req.query = trimObject(req.query);
  next();
};

const normalizeEmail = (email) => {
  if (typeof email !== 'string') return email;
  return email.toLowerCase().trim();
};

const normalizePhone = (phone) => {
  if (typeof phone !== 'string') return phone;
  let normalized = phone.replace(/[^\d+]/g, '');
  if (normalized.startsWith('0')) {
    normalized = '+91' + normalized.substring(1);
  }
  if (!normalized.startsWith('+')) {
    normalized = '+91' + normalized;
  }
  return normalized;
};

const normalizeName = (name) => {
  if (typeof name !== 'string') return name;
  return name
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const normalizeDate = (dateStr) => {
  if (!dateStr) return dateStr;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toISOString();
  } catch {
    return dateStr;
  }
};

const normalizeAmount = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[₹$,\s]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  return 0;
};

const normalizeRequest = (options = {}) => {
  const defaults = { email: true, phone: true, name: true, dates: true };
  const config = { ...defaults, ...options };
  
  return (req, res, next) => {
    if (!req.body) return next();
    
    if (config.email && req.body.email) {
      req.body.email = normalizeEmail(req.body.email);
    }
    
    if (config.phone) {
      const phoneFields = ['phone', 'phoneNumber', 'mobile', 'contact'];
      phoneFields.forEach(field => {
        if (req.body[field]) req.body[field] = normalizePhone(req.body[field]);
      });
    }
    
    if (config.name) {
      const nameFields = ['name', 'firstName', 'lastName', 'fullName'];
      nameFields.forEach(field => {
        if (req.body[field]) req.body[field] = normalizeName(req.body[field]);
      });
    }
    
    if (config.dates) {
      const dateFields = ['date', 'scheduledDate', 'bookingDate', 'startDate', 'endDate'];
      dateFields.forEach(field => {
        if (req.body[field]) req.body[field] = normalizeDate(req.body[field]);
      });
    }
    
    next();
  };
};

const normalizeAddress = (address) => {
  if (!address || typeof address !== 'object') return address;
  return {
    ...address,
    street: address.street?.trim(),
    city: address.city ? normalizeName(address.city) : undefined,
    state: address.state ? normalizeName(address.state) : undefined,
    pincode: address.pincode?.toString().replace(/\s/g, ''),
    country: address.country ? normalizeName(address.country) : 'India'
  };
};

const emptyToNull = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return obj.trim() === '' ? null : obj;
  if (Array.isArray(obj)) return obj.map(emptyToNull);
  if (typeof obj === 'object') {
    const result = {};
    for (const key of Object.keys(obj)) {
      result[key] = emptyToNull(obj[key]);
    }
    return result;
  }
  return obj;
};

const removeEmpty = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const cleaned = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
};

module.exports = {
  normalizeRequest,
  trimStrings,
  trimObject,
  normalizeEmail,
  normalizePhone,
  normalizeName,
  normalizeDate,
  normalizeAmount,
  normalizeAddress,
  emptyToNull,
  removeEmpty
};
