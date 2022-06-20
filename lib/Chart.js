const fs = require('fs');
const ChartReader = require('./ChartReader');
const BytesReader = require('./BytesReader');
const Metadata = require('./Metadata');
const Header = require('./Header');
const leb = require('leb128');

class Chart {
	constructor(difficulty=null) {
        this.difficulty = difficulty;
		this.errors = [];
	}
	async read(path) {
        const chart = await fs.promises.readFile(path);
		if(path.endsWith('.chart')) {
			this.data = new ChartReader(chart.toString());
		}
		else if(path.endsWith('.bytes')) {
			this.data = new BytesReader(chart);
		}
		else {
			throw new Error('Invalid file provided. Must end with .chart or .bytes');
		}
		this.verify();
    }
	verify() {
		const notes = this.getNotes();
        const sections = this.getSections();
        for(var x=0;x<this.data.errors.length;x++) {
            this.errors.push(this.data.errors[x]);
        }
		for(var x=0;x<notes.length;x++) {
			try {
				notes[x].verify();
			}
			catch(e) {
				this.errors.push(e.message);
			}
        }
		
		if(sections.length) {
			if(sections[0].offset == 0) {
				this.errors.push("Don't add a section at offset 0.");
			}
			for(var x=0;x<sections.length;x++) {
				try {
					sections[x].verify();
				}
				catch(e) {
					console.log(e)
					this.errors.push(e.message);
				}
			}
			if(sections.length > 5) {
				this.errors.push('Only 5 sections are currently supported.');
			}
		}
		else {
			this.errors.push('You have no sections. Add one in Moonscraper.');
		}
    }
    getHeaderBuffer() {
        return new Header().getBuffer();
    }
    getNoteBuffer(resolution) {
        const notes = Buffer.concat(this.getNotes().map(el => el.getBuffer(resolution)));
        const length = leb.unsigned.encode(notes.length);
        const end = Buffer.from([0x32]);

        return Buffer.concat([length, notes, end]);
    }
    getSectionBuffer(resolution) {
        const sections = Buffer.concat(this.getSections().map(el => el.getBuffer(resolution)));
        const length = leb.unsigned.encode(sections.length);
        const end = Buffer.from([0x3a]);

        return Buffer.concat([length, sections, end]);
    }
    getMetadataBuffer(type, resolution) {
        let data;
        switch(type) {
            case 'perfects':
                data = this.getPerfectSizes().getBuffer(resolution, 0x42);
                break;
            case 'speeds':
                data = this.getSpeeds().getBuffer(resolution, 0x4a);
                break;
        }
        return data;
    }
    adjustBpm(notes) {
		console.log(notes)
        const bpms = this.data.syncData.bpms;
		
        const resolution = this.data.songData.Resolution;
        //adjust BPMs

        let startingBpm = bpms[0];
        let sectionAdjustment = 0;
        
        //first we adjust each note by the BPM change
        for(var x=1;x<bpms.length;x++) {
            let currentBpm = bpms[x];
			let nextBpm;
			if(bpms[x+1]) {
				nextBpm = bpms[x+1];
			}
			else {
				nextBpm = bpms.slice(x);
				nextBpm.realOffset = notes[notes.length-1].offset;
				nextBpm.beatstarOffset = notes[notes.length-1].beatstarOffset;
			}
            
            let bpmMultiplier = currentBpm.bpm / startingBpm.bpm;
            let part = (nextBpm.realOffset - currentBpm.realOffset) / resolution;
            let change = currentBpm.bpm / startingBpm.bpm;

            //get the notes between
            let relevantNotes = notes.filter(el => el.offset >= currentBpm.realOffset && el.offset < nextBpm.realOffset);
            for(var y=0;y<relevantNotes.length;y++) {
                let note = relevantNotes[y];
                let adjustingValue = (note.offset - currentBpm.realOffset) / resolution / bpmMultiplier;
                note.beatstarOffset = (currentBpm.realOffset / resolution) - sectionAdjustment + adjustingValue;
				if(note.length) {
					let percentDifference = (note.beatstarOffset * resolution) / note.offset;
					if(!note.originalLength) {
						note.originalLength = note.length;
					}
					note.length = note.originalLength * percentDifference;
					console.log(note.length);
				}
            }
            sectionAdjustment += part - (part / change);
        }
		fs.writeFileSync('test.json', JSON.stringify(notes));
        return notes;
    }
	getNotes() {
        let notes = this.data.notes;
        if(this.data.syncData) {
            notes = this.adjustBpm(notes);
        }
        return notes;
	}
	getSections() {
		return this.data.sections;
    }
    getPerfectSizes() {
        return this.data.perfectSizes;
    }
    getSpeeds() {
        return this.data.speeds;
    }
    setPerfectSizes(perfectSizes) {
        this.data.perfectSizes = new Metadata(perfectSizes);
    }
    setSpeeds(speeds) {
        this.data.speeds = new Metadata(speeds);
    }
	getMaxScore() {
		let score = 0;
		const notes = this.getNotes();
		fs.writeFileSync('test.json', JSON.stringify(notes));
		console.log(notes);
        const noteLength = notes.length + notes.filter(el => el.swipe?.holdSwipe).length; //1

        score += noteLength >= 10 ? 10 * 250 : noteLength * 250;
		console.log(score)

        if(noteLength > 25) {
            score += noteLength >= 25 ? (25 - 10) * 500 : (noteLength - 10) * 500;
        }
		
		switch(this.difficulty) {
			case 4:
                if(noteLength > 25)
                    score += (noteLength - 25) * 750;
				break;
			case 3:
                if(noteLength > 25) {
                    score += noteLength >= 50 ? (50 - 25) * 750 : (noteLength - 25) * 750;
                }
                if(noteLength > 50) {
                    score += (noteLength - 50) * 1000;
                }
				break;
			case 1:
                if(noteLength > 25) {
                    score += noteLength >= 50 ? (50 - 25) * 750 : (noteLength - 25) * 750;
                }
                if(noteLength > 50) {
                    score += noteLength > 100 ? (100 - 50) * 1000 : (noteLength - 50) * 1000;
                }
                if(noteLength > 100) {
                    score += (noteLength - 100) * 1250;
                }
				break;
		}
		
		const holdTickCount = notes.reduce((prev, el) => prev + el.holdTicks, 0);
        score += holdTickCount * (250 * 0.20);
        
		return score;
	}
	async write(path) {
		const notes = this.getNotes();
		const directions = ['u', 'd', 'l', 'r'];
		let writeObject = {
			'[Song]': [
				['Offset', 0],
				['Resolution', 192],
				['Player2', 'bass'],
				['Difficulty', 0],
				['PreviewStart', 0],
				['PreviewEnd', 0],
				['Genre', '"rock"'],
				['MediaType', '"cd"'],
				['MusicStream', '""']
			],
			'[SyncTrack]': [
				['0', 'TS 4 1'],
				['0', 'B 163000']
			],
			'[Events]': [],
			'[ExpertSingle]': []
		}
	
		for(var x=0;x<this.data.sections.length;x++) {
			let section = this.data.sections[x];
			writeObject['[Events]'].push([
				section,
				`E "section stage${x+1}"`
			])
		}

		for(var x=0;x<notes.length;x++) {
			let note = notes[x];
			writeObject['[ExpertSingle]'].push([
				note.offset,
				`N ${note.lane} ${note.length}`
			])
			
			if(note.swipe) {
				writeObject['[ExpertSingle]'].push([
					note.swipe.holdSwipe ? note.offset + note.length : note.offset,
					`E ${note.swipe.direction}`
				])
			}
			
			if(note.unknown) {
				writeObject['[ExpertSingle]'].push([
					note.swipe.holdSwipe ? note.offset + note.length : note.offset,
					`E ${note.unknown}`
				])
			}
		}

		const entries = Object.entries(writeObject);
		for(var x=0;x<entries.length;x++) {
			let writeString = '';
			const keys = entries[x][1];
			writeString += entries[x][0] + '\n{\n';
			for(var y=0;y<keys.length;y++) {
				writeString += `    ${keys[y][0]} = ${keys[y][1]}\n`;
			}
			writeString += '}\n';
			await fs.promises.appendFile('saved.chart', writeString);
		}
    }
    async getString() {
        const notes = this.getNotes();
        let chartString = '';;
		let writeObject = {
			'[Song]': [
				['Offset', 0],
				['Resolution', 192],
				['Player2', 'bass'],
				['Difficulty', 0],
				['PreviewStart', 0],
				['PreviewEnd', 0],
				['Genre', '"rock"'],
				['MediaType', '"cd"'],
				['MusicStream', '""']
			],
			'[SyncTrack]': [
				['0', 'TS 4 1'],
				['0', 'B 163000']
			],
			'[Events]': [],
			'[ExpertSingle]': []
		}
	
		for(var x=0;x<this.data.sections.length;x++) {
			let section = this.data.sections[x];
			writeObject['[Events]'].push([
				section,
				`E "section stage${x+1}"`
			])
		}

		for(var x=0;x<notes.length;x++) {
			let note = notes[x];
			writeObject['[ExpertSingle]'].push([
				note.offset,
				`N ${note.lane} ${note.length}`
			])
			
			if(note.swipe) {
				writeObject['[ExpertSingle]'].push([
					note.swipe.holdSwipe ? note.offset + note.length : note.offset,
					`E ${note.swipe.direction}`
				])
			}
			if(note.unknown) {
				writeObject['[ExpertSingle]'].push([
					note.offset,
					`E ${note.unknown}`
				])
			}
		}

		const entries = Object.entries(writeObject);
		for(var x=0;x<entries.length;x++) {
			let writeString = '';
			const keys = entries[x][1];
			writeString += entries[x][0] + '\n{\n';
			for(var y=0;y<keys.length;y++) {
				writeString += `    ${keys[y][0]} = ${keys[y][1]}\n`;
			}
			writeString += '}\n';
			chartString += writeString;
        }
        
        return chartString;
    }
}

module.exports = Chart;