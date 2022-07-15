const String = require('../types/String');
const Varint = require('../types/Varint');
const PackedMessage = require('../types/PackedMessage');
const Group = require('../types/Group');
const Float = require('../types/Float');

module.exports = {
	1: new Varint('id', 1),
	2: new String('interactions_id', 2),
	5: new PackedMessage('notes', {
		1: new Varint('note_type', 1),
		3: new Group('note_data', {
			1: new Group('note', {
				1: new Float('offset', 1)
			}),
			2: new Varint('swipe', 2)
		}),
		4: new Group('note_data', {
			1: new Group('note', {
				1: new Float('offset', 1)
			}, { repeating: true }),
			2: new Varint('swipe', 2)
		}),
		6: new Varint('lane', 6),
		13: new Varint('size', 13)
	}),
	6: new PackedMessage('sections', {
		1: new Float('offset', 1)
	}),
	7: new PackedMessage('perfects', {
		1: new Float('offset', 1),
		2: new Float('multiplier', 2)
	}),
	8: new PackedMessage('speeds', {
		1: new Float('offset', 1),
		2: new Float('multiplier', 2)
	}),
	9: new PackedMessage('circles', {
		1: new Float('offset', 1),
		4: new Varint('type', 4, { repeating: true })
	})
}