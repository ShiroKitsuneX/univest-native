export const sortByDate = (arr, key = "date", ascending = false) => {
  return [...arr].sort((a, b) => {
    const dateA = new Date(a[key]);
    const dateB = new Date(b[key]);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const sortByKey = (arr, key, ascending = true) => {
  return [...arr].sort((a, b) => {
    if (a[key] < b[key]) return ascending ? -1 : 1;
    if (a[key] > b[key]) return ascending ? 1 : -1;
    return 0;
  });
};

export const filterBySearch = (arr, query, fields) => {
  if (!query || !arr) return arr;
  const q = query.toLowerCase().trim();
  if (!q) return arr;
  
  return arr.filter(item => 
    fields.some(field => {
      const val = item[field];
      return val && String(val).toLowerCase().includes(q);
    })
  );
};

export const filterByField = (arr, field, value) => {
  if (!field || value === undefined || value === null || value === "all") return arr;
  return arr.filter(item => item[field] === value);
};

export const groupBy = (arr, key) => {
  return arr.reduce((acc, item) => {
    const group = item[key];
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});
};

export const uniqueBy = (arr, key) => {
  const seen = new Set();
  return arr.filter(item => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
};

export const uniqueValues = (arr, key) => {
  return [...new Set(arr.map(item => item[key]).filter(Boolean))];
};