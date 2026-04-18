const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const parsePaginationParams = (query, options = {}) => {
  const defaultLimit = options.defaultLimit || DEFAULT_LIMIT;
  const maxLimit = options.maxLimit || MAX_LIMIT;
  
  let page = parseInt(query.page) || DEFAULT_PAGE;
  let limit = parseInt(query.limit) || defaultLimit;
  
  page = Math.max(1, page);
  limit = Math.min(maxLimit, Math.max(1, limit));
  
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const createPaginationMeta = (page, limit, total, baseUrl = '') => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  
  const meta = {
    currentPage: page,
    itemsPerPage: limit,
    totalItems: total,
    totalPages,
    hasNextPage,
    hasPrevPage
  };
  
  if (baseUrl) {
    meta.links = {
      self: `${baseUrl}?page=${page}&limit=${limit}`,
      first: `${baseUrl}?page=1&limit=${limit}`,
      last: `${baseUrl}?page=${totalPages}&limit=${limit}`
    };
    if (hasNextPage) meta.links.next = `${baseUrl}?page=${page + 1}&limit=${limit}`;
    if (hasPrevPage) meta.links.prev = `${baseUrl}?page=${page - 1}&limit=${limit}`;
  }
  
  return meta;
};

const paginate = (options = {}) => {
  return (req, res, next) => {
    const pagination = parsePaginationParams(req.query, options);
    req.pagination = pagination;
    
    res.paginated = (data, total, message = null) => {
      const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
      const meta = createPaginationMeta(pagination.page, pagination.limit, total, baseUrl);
      const response = { success: true, data, pagination: meta };
      if (message) response.message = message;
      return res.json(response);
    };
    
    next();
  };
};

const getMongooseOptions = (req) => {
  if (!req.pagination) return { skip: 0, limit: DEFAULT_LIMIT };
  return { skip: req.pagination.skip, limit: req.pagination.limit };
};

const paginateArray = (data, page = 1, limit = 10) => {
  const total = data.length;
  const skip = (page - 1) * limit;
  const paginatedData = data.slice(skip, skip + limit);
  return { data: paginatedData, pagination: createPaginationMeta(page, limit, total) };
};

const cursorPaginate = (options = {}) => {
  const defaultLimit = options.defaultLimit || 20;
  const cursorField = options.cursorField || '_id';
  
  return (req, res, next) => {
    const limit = Math.min(parseInt(req.query.limit) || defaultLimit, MAX_LIMIT);
    const cursor = req.query.cursor || null;
    const direction = req.query.direction || 'next';
    
    req.cursorPagination = { limit, cursor, direction, cursorField };
    
    req.cursorPagination.buildQuery = (baseQuery = {}) => {
      if (!cursor) return baseQuery;
      const operator = direction === 'next' ? '$gt' : '$lt';
      return { ...baseQuery, [cursorField]: { [operator]: cursor } };
    };
    
    res.cursorPaginated = (data, hasMore) => {
      const response = {
        success: true,
        data,
        pagination: { limit, hasMore, cursors: {} }
      };
      if (data.length > 0) {
        response.pagination.cursors.next = data[data.length - 1][cursorField];
        response.pagination.cursors.prev = data[0][cursorField];
      }
      return res.json(response);
    };
    
    next();
  };
};

const sortable = (allowedFields = {}) => {
  return (req, res, next) => {
    const sortParam = req.query.sort || '';
    const sortFields = sortParam.split(',').filter(Boolean);
    const sort = {};
    
    sortFields.forEach(field => {
      const isDescending = field.startsWith('-');
      const fieldName = isDescending ? field.substring(1) : field;
      if (allowedFields[fieldName] !== undefined) {
        sort[fieldName] = isDescending ? -1 : 1;
      }
    });
    
    if (Object.keys(sort).length === 0) sort.createdAt = -1;
    req.sort = sort;
    next();
  };
};

const paginateAndSort = (options = {}) => {
  const paginateMiddleware = paginate(options);
  const sortMiddleware = sortable(options.sortableFields || {});
  
  return (req, res, next) => {
    paginateMiddleware(req, res, () => {
      sortMiddleware(req, res, next);
    });
  };
};

module.exports = {
  paginate,
  parsePaginationParams,
  createPaginationMeta,
  getMongooseOptions,
  paginateArray,
  cursorPaginate,
  sortable,
  paginateAndSort,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT
};
