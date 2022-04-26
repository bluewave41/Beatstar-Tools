const Note = require('./Note');
const Reader = require('./Reader');
const Utilities = require('./Utilities');

class BytesReader {
	constructor(chart) {
		this.chart = chart;
		this.reader = new Reader(chart);
		this.errors = [];
        this.readHeader();
        this.readNotes();
        console.log('read notes');
		this.reader.checkByte(0x32);
        this.readSections();
        console.log('read sections');
		this.reader.checkByte(0x3a);
        this.readMaxHits();
        console.log('read hits');
		this.reader.checkByte(0x42);
        this.readNumBeats();
        console.log('read beats');
	}
	readHeader() {
		try {
			this.reader.checkByte(0x8);
		}
		catch(e) {
			throw new Error('This is not a valid chart file.');
		}
		this.interactionId = this.reader.readLeb(this.reader.position);
		
		this.reader.checkByte(0x12);
		this.interactionString = this.reader.readString();
	}
	readNotes() {
		const noteLength = this.reader.readLeb(this.reader.position);
        const fullNoteReader = new Reader(this.reader.slice(noteLength));
		let notes = [];
		
		while(fullNoteReader.hasNext()) {
            let noteLength = fullNoteReader.readByte();
            let noteReader = new Reader(fullNoteReader.slice(noteLength));
            let lane = 0;
			
			noteReader.checkByte(0x8);
			
			let numberOfNotes = noteReader.readByte();
			if(numberOfNotes == 1) {
				noteReader.checkByte(0x1a);
			}
			else if(numberOfNotes == 2) {
				noteReader.checkByte(0x22);
			}
			else {
				throw new Error('Something went horribly wrong.');
			}
			
			let numberOfBytesBeforeLane = noteReader.readByte();
            let offsets = [];
			
			for(var x=0;x<numberOfNotes;x++) {
                noteReader.checkBytes([0xa, 0x11, 0x0d]);
                let offset = noteReader.readFloat();
				noteReader.checkBytes([0x12, 0x0a, 0x0d]);
				
				let screenX = noteReader.readFloat();
				noteReader.checkByte(0x15);
				let screenY = noteReader.readFloat();
			
				if(screenX != 0.5 || screenY != 0.5) {
					throw new Error(`Unknown screen value set. ${screenX} ${screenY}.`);
				}
				
				offsets.push(Utilities.roundToPrecision((offset * 192), 0));
			}
			
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
			if(Object.keys(swipe).length) {
				swipe.direction += note.lane+1;
				note.swipe = swipe;
			}
			
			notes.push(note);
		}
		this.notes = notes;
	}
	readSections() {
		const sectionLength = this.reader.readLeb(this.reader.position);
		const sectionReader = new Reader(this.reader.slice(sectionLength));
		let finalSections = [];
	
		while(sectionReader.hasNext()) {
			let sectionLength = sectionReader.readByte();
            sectionReader.checkByte(0x0d);
            let sectionOffset = Utilities.roundToPrecision(sectionReader.readFloat() * 192, 0);
			finalSections.push(sectionOffset);
		}

		this.sections = finalSections;
	}
	readMaxHits() {
        const maxHitLength = this.reader.readLeb(this.reader.position);
		const maxHitReader = new Reader(this.reader.slice(maxHitLength));
		let finalMaxHit = [];

		while(maxHitReader.hasNext()) {
            let length = maxHitReader.readByte();
			if(length == 5) {
				maxHitReader.checkByte(0x15);
				finalMaxHit.push({ offset: 0, multiplier: maxHitReader.readFloat() });
			}
			else {
				maxHitReader.checkByte(0x0d);
				let offset = maxHitReader.readFloat();
				maxHitReader.checkByte(0x15);
				let multiplier = maxHitReader.readFloat();
				finalMaxHit.push({ offset: offset, multiplier: multiplier });
			}
		}
		
		this.maxHit = finalMaxHit;
	}
	readNumBeats() {
        const numBeatsLength = this.reader.readLeb(this.reader.position);
		const numBeatsReader = new Reader(this.reader.slice(numBeatsLength));
		let finalNumBeats = [];
	
		//first one starts at 0 so handle that first
		numBeatsReader.readByte();
		numBeatsReader.checkByte(0x15);
		finalNumBeats.push({ offset: 0, multiplier: numBeatsReader.readFloat() });
	
		while(numBeatsReader.hasNext()) {
			numBeatsReader.checkBytes([0x0a, 0x0d]);
			let offset = numBeatsReader.readFloat();
			numBeatsReader.checkByte(0x15);
			let multiplier = numBeatsReader.readFloat();
			finalNumBeats.push({ offset: offset, multiplier: multiplier });
		}
	
		this.numBeats = finalNumBeats;
	}
}

module.exports = BytesReader;