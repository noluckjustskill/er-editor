import omit from 'lodash.omit';

export const saveEntities = (obj) => {
  if (!(obj instanceof Object)) {
    throw new Error('Bad arguments for save entities');
  }

  const list = Object.values(obj).map(({ id, name, x, y, fields = {}, primaryKey }) => ({
    id,
    name,
    x,
    y,
    primaryKey,
    fields: Object.keys(fields).reduce((acc, curr) => {
      acc[curr] = omit(fields[curr], 'view');
      return acc;
    }, {}),
  }));

  localStorage.setItem('entities', JSON.stringify(list));
};

export const saveRelations = (obj) => {
  if (!(obj instanceof Object)) {
    throw new Error('Bad arguments for save relations');
  }
  localStorage.setItem('relations', JSON.stringify(obj));
};

export const getEntities = () => {
  const value = localStorage.getItem('entities');
  return value ? JSON.parse(value) : [];
};

export const getRelations = () => {
  const value = localStorage.getItem('relations');
  return value ? JSON.parse(value) : {};
};
