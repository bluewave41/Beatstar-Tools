const BufferedWriter = require('./BufferedWriter');

class Section {
	constructor(offset, marker, text) {
		this.offset = offset;
		this.marker = marker;
		this.text = text;
	}
	verify() {
		if(this.marker != 'E' || this.text != 'section') {
			throw new Error(`Unknown event found at offset ${offset}.`);
		}
    }
    getBuffer(resolution) {
        const writer = new BufferedWriter(6);
        if(this.offset == 0) {
            return writer;
        }
        writer.writeByte(0x5);
        writer.writeByte(0x0d);
        writer.writeFloat(this.offset / resolution);

        return writer.getData();
    }
}

module.exports = Section;