// Archivo: src/utils/userUtils.js
const fs = require('fs');
const path = require('path');

const USERS_DB_PATH = path.join(BASE_DIR, '..', 'database', 'users.json');

const getUsersData = () => {
  if (!fs.existsSync(USERS_DB_PATH)) {
    fs.writeFileSync(USERS_DB_PATH, JSON.stringify({}, null, 2));
  }
  const data = fs.readFileSync(USERS_DB_PATH, 'utf-8');
  return JSON.parse(data);
};

const saveUsersData = (data) => {
  fs.writeFileSync(USERS_DB_PATH, JSON.stringify(data, null, 2));
};

const getUser = (users, userJid) => {
  const userId = userJid.split('@')[0];
  
  if (!users[userId]) {
    users[userId] = {
      money: 500,
      lastWork: 0,
      lastMine: 0,
      lastRob: 0,
      lastReward: 0,
      level: 0,
      xp: 0,
      diamonds: 0,
      bankMoney: 0,
    };
  }
  return users[userId];
};

module.exports = {
  getUsersData,
  saveUsersData,
  getUser
};
