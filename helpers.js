// helper function - email lookup

const getUserByEmail = (email, dataBase) => {
  for (let user in dataBase) {
    if (dataBase[user].email === email) {
      return dataBase[user];
    }
  }
};

// generate random 6 digit code
const generateRandomString = () => {
  const alphanumeric = 'abcdefghijklmnopkrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTYUVWXYZ';
  let result = '';
  
  for (let i = 0; i < 6; i ++) {
    result += alphanumeric[Math.floor(Math.random() * alphanumeric.length)];
  }
  return result;
};

// return URLs if userID equals to the id of the current logged-in user

const urlsForUser = (checkUser, usersInformation) => {
  let result = {...usersInformation};
  for (const user in usersInformation) {
    if (usersInformation[user].userID !== checkUser) {
      delete result[user];
    }
  }
  return result;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };