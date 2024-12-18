import moment from 'moment-timezone';

const get_formatted_date = (input_date) => {
  const date = input_date ? moment(input_date) : moment();
  const timeZone = 'Europe/Moscow';
  const date_and_time = date.tz(timeZone).format('DD.MM.YYYY');
  return date_and_time;
};

const getColumnNumberByValue = (values, value) => {
  if (values) {
    const columnNumber = values.indexOf(value) + 1;
    return columnNumber;
  } else {
    return -1;
  }
};

const get_previous_workday_and_weekend_info = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  let previousWorkday = new Date(today);
  if (dayOfWeek === 1) {
      previousWorkday.setDate(today.getDate() - 3);
  } else {
      do {
          previousWorkday.setDate(previousWorkday.getDate() - 1);
      } while (previousWorkday.getDay() === 0 || previousWorkday.getDay() === 6);
  }
  
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  return {
      previous_workday: previousWorkday.toISOString(),
      is_weekend: isWeekend
  };
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
  find_name_by_username,
  get_formatted_date,
  get_previous_workday_and_weekend_info
};
