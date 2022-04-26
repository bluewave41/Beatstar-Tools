const UserModel = require('models/UserModel');
const ScoreModel = require('models/ScoreModel');

module.exports = {
    async getScores(androidId) {
        const user = await UserModel.query().select()
            .withGraphFetched('scores.[beatmap,medal]')
            .findOne('androidId', androidId)

        return user.scores;
    }
}