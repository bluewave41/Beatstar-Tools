const Note = require('./Note');
const Reader = require('./Reader');
const Utilities = require('./Utilities');
const ProtobufReader = require('lib/ProtobufReader');
const ChartProto = require('lib/protos/ChartProto');

class BytesReader {
	constructor(chart) {
		const protobufReader = new ProtobufReader(chart);

		protobufReader.process();
		const parsed = protobufReader.parseProto(ChartProto);

		this.sections = parsed.sections.map(el => Utilities.roundToPrecision(el.offset * 192, 0));
		
		parsed.perfects[0].offset = 0;
		parsed.speeds[0].offset = 0;

		this.speeds = parsed.speeds;
		this.maxHit = parsed.perfects;

		//add a lane to all notes without one
		for(const note of parsed.notes) {
			if(!note.lane) {
				note.lane = 1;
			}
		}

		this.notes = this.parseNotes(parsed.notes);
	}
	parseNotes(notes) {
		const finalNotes = [];

		for(const protoNote of notes) {
			let note;
			let offset;

			if(protoNote.note_type == 1) {
				offset = Utilities.roundToPrecision(protoNote.note_data.note.offset * 192, 0)
				note = new Note(offset, protoNote.lane ? protoNote.lane-1 : 0, 0, 192);
			}
			else if(protoNote.note_type == 2) {
				const length = (protoNote.note_data.note[1] - protoNote.note_data.note[0]) * 192;
				offset = Utilities.roundToPrecision(protoNote.note_data.note[0] * 192, 0)
				note = new Note(offset, protoNote.lane ? protoNote.lane-1 : 0, length, 192);
			}
			
			const directions = ['up', 'down', 'left', 'right'];

			if(protoNote.note_data.swipe) {
				note.swipe = {
					direction: directions[protoNote.note_data.swipe - 1].slice(0, 1) + protoNote.lane,
					holdSwipe: protoNote.note_type == 2 ? true : false
				}
			}

			if(protoNote.size) {
				note.unknown = `/${protoNote.size}`;
			}

			finalNotes.push(note);
		}

		return finalNotes;
	}
	/*	const noteLength = this.reader.readLeb(this.reader.position);
        const fullNoteReader = new Reader(this.reader.slice(noteLength));
		let notes = [];
		
		while(fullNoteReader.hasNext()) {
            let noteLength = fullNoteReader.readByte();
            let noteReader = new Reader(fullNoteReader.slice(noteLength));
            let lane = 0;

			
			offsets.push(Utilities.roundToPrecision((offset * 192), 0));
			
			let swipe = {}
			let length = offsets.length == 2 ? offsets[1] - offsets[0] : 0;
            let unknown = '';

			//subtract 4 to account for the static 8, numberOfNotes and numberOfBytesBeforeLane
			while(noteReader.position-4 < numberOfBytesBeforeLane) {
				let b = noteReader.readByte();
				const directions = ['up', 'down', 'left', 'right'];
				if(b == 0x10) { //swipe
					//is it a long swipe?
					let dir = directions[noteReader.readByte()-1];
					swipe.direction = dir.slice(0, 1);
					swipe.holdSwipe = numberOfNotes == 2 ? true : false;
				}
				else {
					throw new Error(`Unknown extra data found: ${b}.`);
				}
			}
			
			while(noteReader.hasNext()) {
				let b = noteReader.readByte();
				if(b == 0x30) {
					if(lane != 4) {
						lane = noteReader.readByte()-1;
					}
				}
				else if(b == 0x68) {
					//unknown
					let laneIndex = noteReader.readByte();
					unknown = `/${laneIndex}`;
				}
				else {
					throw new Error(`Invalid lane found: ${b}.`);
				}
			}
			
            const note = new Note(offsets[0], lane, length);
			note.unknown = unknown;
			if(Object.keys(swipe).length) {
				swipe.direction += note.lane+1;
				note.swipe = swipe;
			}
			
			notes.push(note);
		}
		this.notes = notes;
	}*/
}

module.exports = BytesReader;