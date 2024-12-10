const getColumnNumberByValue = (values, value) => {
  if (values) {
    const columnNumber = values.indexOf(value) + 1;
    return columnNumber;
  } else {
    return -1;
  }
};

const numberToColumn = (n) => {
  if (n <= 0) n = 1;

  n -= 1;

  let ordA = "A".charCodeAt(0);
  let ordZ = "Z".charCodeAt(0);
  let len = ordZ - ordA + 1;

  let s = "";
  while (n >= 0) {
    s = String.fromCharCode((n % len) + ordA) + s;
    n = Math.floor(n / len) - 1;
  }
  return s;
};

const convert_array_to_object = (data) => {
  const headers = data[0];
  return data.slice(1).reduce((acc, row, i) => {
    const obj = headers.reduce((obj, header, j) => {
      obj[header] = row[j];
      return obj;
    }, {});

    acc[i] = obj;
    return acc;
  }, {});
};

const get_name_by_username = (username, users) => {
  for (const [key, value] of Object.entries(users)) {
    if (value['Юзернейм'].toLowerCase() === username.toLowerCase()) {
      return value['Имя'].toLowerCase();
    }
  }
  return "User not found";
};

const get_username_by_name = (username, users) => {
  for (const [key, value] of Object.entries(users)) {
    if (value['Имя'].toLowerCase() === username.toLowerCase()) {
      return value['Юзернейм'].toLowerCase();
    }
  }
  return "User not found";
};

const find_name_by_username = (username, users) => {
  const user = users.find(({ tg_username }) => tg_username === username);
  return user ? user.name : "User not found";
};

export {
  numberToColumn,
  getColumnNumberByValue,
  convert_array_to_object,
  get_name_by_username,
  get_username_by_name,
  find_name_by_username
};
