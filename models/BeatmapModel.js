const { Model } = require('objection');

class BeatmapModel extends Model {
    static get tableName() {
        return 'beatmaps';
    }
}

module.exports = BeatmapModel;