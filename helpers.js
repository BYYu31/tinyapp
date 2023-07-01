// helper function - email lookup

const getUserByEmail = (email, dataBase) => {
  for (let user in dataBase) {
    if (dataBase[user].email === email) {
      return dataBase[user];
    }
  }
};

module.exports = { getUserByEmail };