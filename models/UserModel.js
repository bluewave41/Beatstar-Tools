const { Model } = require('objection');

class UserModel extends Model {
    static get tableName() {
        return 'users';
    }

    static get relationMappings() {
        const ScoreModel = require('models/ScoreModel');

        return {
            scores: {
                relation: Model.HasManyRelation,
                modelClass: ScoreModel,
                join: {
                    from: 'users.userId',
                    to: 'scores.userId'
                }
            }
        }
    }
}

module.exports = UserModel;