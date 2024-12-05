/**
 * Возвращает номер столбца, содержащего указанное значение, на указанном листе.
 * @param {Sheet} sheet - Лист, на котором производится поиск.
 * @param {string} value - Значение, которое нужно найти.
 * @returns {number} - Номер столбца, где найдено значение. Если значение не найдено, возвращается -1.
 */
function getColumnNumberByValue(values, value) {
  // const row = values.find(row => row.includes(value));

  if (values) {
    const columnNumber = values.indexOf(value) + 1;
    return columnNumber;
  } else {
    return -1;
  }
}

/**
 * Преобразует число в соответствующую строку столбца в таблице Google Sheets.
 * @param {number} n - Число для преобразования.
 * @return {string} - Строка с соответствующим значением столбца.
 */
function numberToColumn(n) {
  /* Google Sheets использует A = 1, мы вычисляем, начиная с 0 */
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

const objify = (data) => {
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

const update_operator_data = (operatorData, type, yes, no) => {
  const dataIncrements = {
    'Фото': ['photo_count', 'confirm_photo'],
    'Видео': ['video_count', 'confirm_video'],
  };

  operatorData.content_count++;

  if (dataIncrements[type]) {
    operatorData[dataIncrements[type][0]]++;
    if (yes === 'TRUE') {
      operatorData[dataIncrements[type][1]]++;
    }
  }
};

export {
  numberToColumn,
  getColumnNumberByValue,
  objify,
  get_name_by_username,
  get_username_by_name,
  update_operator_data
};
