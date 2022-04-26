const UserModel = require('models/UserModel');

module.exports = {
    async getUsers() {
        return await UserModel.query().select();
    },
    async getPage(page) {
        const users = await UserModel.query().select()
        .orderBy('totalMedalCount', 'desc')
        .offset(page * 20)
        .limit(20)

        return users;
    }
}