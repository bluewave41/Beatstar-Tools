const { Model } = require('objection');

class MedalScoreModel extends Model {
    static get tableName() {
        return 'medal_scores';
    }
}

module.exports = MedalScoreModel;