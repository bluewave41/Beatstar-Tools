const { Model } = require('objection');

class ScoreModel extends Model {
    static get tableName() {
        return 'scores';
    }

    static get relationMappings() {
        const BeatmapModel = require('models/BeatmapModel');
        const MedalScoreModel = require('models/MedalScoreModel');

        return {
            beatmap: {
                relation: Model.HasOneRelation,
                modelClass: BeatmapModel,
                join: {
                    from: 'scores.beatmapId',
                    to: 'beatmaps.beatmapId'
                }
            },
            medal: {
                relation: Model.ManyToManyRelation,
                modelClass: MedalScoreModel,
                join: {
                    from: 'scores.beatmapId',
                    through: {
                        from: 'beatmaps.beatmapId',
                        to: 'beatmaps.difficultyId'
                    },
                    to: 'medal_scores.difficultyId'
                }
            }
        }
    }
}

module.exports = ScoreModel;