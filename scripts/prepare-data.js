const yaml = require('js-yaml');
const fs = require('fs');

const files = ['angela', 'charlotte', 'duran', 'hawkeye', 'kevin', 'riesz'];

const fileData = files.map(fileName => {
  const file = fs.readFileSync(`src/assets/chardata/${fileName}.yml`, 'UTF-8');
  return { name: fileName, data: yaml.safeLoad(file) };
});

const rootJson = {};
fileData.forEach(({ name, data }) => {
  rootJson[name] = data;
});

fs.writeFileSync('src/assets/chardata.json', JSON.stringify(rootJson));