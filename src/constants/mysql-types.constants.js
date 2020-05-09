export const MySQLTypes = {
  'CHAR': {
    type: 'string',
    maxLength: 255,
    allowDefault: true,
  },
  'VARCHAR': {
    type: 'string',
    maxLength: 255,
    allowDefault: true,
  },
  'TINYTEXT': {
    type: 'string',
    maxLength: 255,
  },
  'TEXT': {
    type: 'string',
    maxLength: 65535,
  },
  'BLOB': {
    type: 'string',
    maxLength: 65535,
  },
  'MEDIUMTEXT': {
    type: 'string',
    maxLength: 16777215,
  },
  'MEDIUMBLOB': {
    type: 'string',
    maxLength: 16777215,
  },
  'LONGTEXT': {
    type: 'string',
    maxLength: 4294967295,
  },
  'LONGBLOB': {
    type: 'string',
    maxLength: 4294967295,
  },
  'TINYINT': {
    type: 'number',
    maxLength: 127,
    allowDefault: true,
  },
  'SMALLINT': {
    type: 'number',
    maxLength: 32767,
    allowDefault: true,
  },
  'MEDIUMINT': {
    type: 'number',
    maxLength: 8388607,
    allowDefault: true,
  },
  'INT': {
    type: 'number',
    maxLength: 2147483647,
    allowDefault: true,
  },
  'BIGINT': {
    type: 'number',
    // eslint-disable-next-line no-undef
    maxLength: BigInt('9223372036854775807'),
    allowDefault: true,
  },
  'FLOAT': {
    type: 'number',
    maxLength: 2147483647,
  },
  'DOUBLE': {
    type: 'number',
    maxLength: 2147483647,
  },
  'DATE': {
    type: 'string',
    pattern: 'YYYY-MM-DD'
  },
  'DATETIME': {
    type: 'string',
    pattern: 'YYYY-MM-DD HH:mm:ss'
  },
  'TIMESTAMP': {
    type: 'string',
    pattern: 'YYYYMMDDHHmmss'
  },
  'TIME': {
    type: 'string',
    pattern: 'HH:mm:ss'
  },
  'BOOLEAN': {
    type: 'number',
    maxLength: 1,
    dennyUnsigned: true,
    is: 'TINYINT(1) UNSIGNED',
    allowDefault: true,
  },
};