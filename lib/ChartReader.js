const Note = require('./Note');
const Section = require('./Section');

class Chart {
	constructor(chart) {
		this.chart = chart;
		this.errors = [];
		this.stripBeginning();
		this.parseSections();
	}
	stripBeginning() {
		let index = this.chart.indexOf('[');
		this.chart = this.chart.substring(index, this.chart.length);
	}
	parseSections() {
		let sections = [];
		let startIndex = 0;
		while(true) {
			let endIndex = this.chart.indexOf('}', startIndex+1);
			if(endIndex == -1) {
				break;
			}
            sections.push(this.chart.slice(startIndex, endIndex+1));
			startIndex = endIndex+1;
        }
		for(var x=0;x<sections.length;x++) {
            let s = this.chart.includes('\r\n') ? '\r\n' : '\n';
            let split = sections[x].split(s);
			split = split.filter(Boolean);
			if(split[0] == '[Song]') {
				this.parseSongSection(split);
			}
			else if(split[0] == '[SyncTrack]') {
				this.parseSyncTrack(split);
			}
			else if(split[0] == '[Events]') {
				this.parseEvents(split);
			}
			else if(split[0] == '[ExpertSingle]') {
				this.parseNotes(split);
			}
		}
	}
	parseSongSection(section) {
		//shift title and bracket and end bracket
		let songData = {};
		
		section.shift();
		section.shift();
		section.pop();
		
		for(var x=0;x<section.length;x++) {
			let line = section[x].trim().replace(/"/g, '').split(' = ');
			songData[line[0]] = line[1];
		}
		this.songData = songData;
	}
	parseSyncTrack(section) {
		let syncData = {};
		let bpms = [];
		
		section.shift();
		section.shift();
		section.pop();
		
		for(var x=0;x<section.length;x++) {
			let line = section[x].trim().replace(' =', '').split(' ');
			if(line[1] == 'TS') {
				syncData['timeSignature'] = parseInt(line[2]);
			}
			else if(line[1] == 'B') {
				let decimalPosition = line[2].length - 3;
				let bpm = parseFloat(line[2].slice(0, decimalPosition) + '.' + line[2].slice(decimalPosition));
				bpms.push({
					realOffset: parseInt(line[0]),
					beatstarOffset: parseInt(line[0]) / 192,
					bpm: bpm
				})
			}
		}
		syncData.bpms = bpms;
		this.syncData = syncData;
	}
	parseEvents(section) {
		let sections = [];
		
		section.shift();
		section.shift();
		section.pop();
		
		for(var x=0;x<section.length;x++) {
			let line = section[x].trim().replace(/"/g, '').split(' ');
			sections.push(new Section(parseInt(line[0]), line[2], line[3]));
		}
		
		this.sections = sections;
	}
	parseNotes(section) {
		let notes = [];
		
		section.shift();
		section.shift();
		section.pop();
		
		for(var x=0;x<section.length;x++) {
			let line = section[x].trim().split(' ');
			let offset = parseInt(line[0]);
			let length = parseInt(line[4]);
			let unknown = 0;
			if(line[2] == 'N') { //note
				let lane = parseInt(line[3]);
				const note = new Note(offset, lane, length);
				notes.push(note);
			}
			else if(line[2] == 'E') {
				console.log(line[3]);
				if(line[3].includes('/')) {
					const note = notes.filter(el => el.offset == offset);
					note.forEach(el => el.unknown = line[3].split('')[1]);
				}
				else {
					const swipes = line[3].toLowerCase().split(',');
					for(var y=0;y<swipes.length;y++) {
						let swipe = swipes[y].split('');
						const note = notes.find(el => (el.offset == offset || el.endOffset == offset) && el.lane == swipe[1]-1);
						if(!note) {
							//this event isn't on a note
							this.errors.push(`Found an event at ${offset} but there wasn't a note there.`);
							continue;
						}
						note.setSwipe(swipes[y]);
					}
				}
			}
			else if(line[2] == 'S') {
				this.errors.push(`Found starpower note at ${offset}. Starpower does nothing, please remove this.`);
			}
        }
		this.notes = notes;
	}
}

module.exports = Chart;