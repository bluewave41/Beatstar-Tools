const BufferedWriter = require('./BufferedWriter');

class Note {
	constructor(offset, lane, length) {
		this.offset = offset;
		this.endOffset = offset + length;
		this.beatstarOffset = offset / 192;
		this.lane = lane;
		this.length = length;
		this.holdTicks = length == 0 ? 0 : Math.floor(Math.floor(this.endOffset / 192) - Math.floor(this.offset / 192));
	}
	get beatstarIndex() {
		return this.offset / 192;
	}
	setSwipe(direction) {
		const validDirections = ['u', 'd', 'l', 'r'];
		let split = direction.split('');
		if(split[0] == '/') {
			this.unknown = split[1];
			return;
		}
		if(!validDirections.includes(split[0])) {
			throw new Error(`Invalid swipe ${direction} found at offset ${this.offset}.`);
		}
		this.swipe = {
			direction: direction,
			holdSwipe: this.length ? true : false,
			index: validDirections.indexOf(split[0])+1
		}
		
		if(this.swipe.holdSwipe && this.length % 192 == 0) {
			this.holdTicks--;
		}
	}
	verify() {
		if(this.lane == 6) {
			throw new Error(`The note at offset ${this.offset} is marked as "Forced." Do not use the Tap or Forced modifiers.`)
		}
		else if(this.lane == 7) {
			throw new Error(`The note at offset ${this.offset} is marked as "Tap." Do not use the Tap or Forced modifiers.`);
		}
		else if(this.lane > 2) {
			throw new Error(`The note at offset {this.offset} is in lane ${this.lane} which isn't supported.`);
		}
    }
	getBuffer(resolution) {
        let length = 24;
        let additional = 0;

        length += this.length ? 19 : 0;
        length += this.swipe ? 2 : 0;

        additional += this.lane ? 2 : 0;
        additional += this.unknown ? 2 : 0;
        
        let buffer = new BufferedWriter(length + additional);
        buffer.writeByte(length - 1 + additional);
        buffer.writeByte(0x8); //static
        this.length ? buffer.writeBytes([0x2, 0x22]) : buffer.writeBytes([0x1, 0x1a]);
        buffer.writeByte(length - 5); //length before lane
		buffer.writeBytes([0x0a, 0x11, 0x0d]); //static
		buffer.writeFloat(this.beatstarOffset);
		buffer.writeBytes([0x12, 0x0a, 0x0d]); //static
		buffer.writeFloat(0.5); //screenX
        buffer.writeByte(0x15); //static
        buffer.writeFloat(0.5); //screenY

        if(this.length) {
            buffer.writeBytes([0x0a, 0x11, 0x0d]); //static
			buffer.writeFloat(this.beatstarOffset + (this.length / resolution)); 
			buffer.writeBytes([0x12, 0x0a, 0x0d]);
			buffer.writeFloat(0.5);
			buffer.writeByte(0x15);
			buffer.writeFloat(0.5);
        }

        if(this.swipe) {
            buffer.writeBytes([0x10, this.swipe.index]);
        }
		
		if(this.lane != 0) {
            buffer.writeBytes([0x30, this.lane+1]);
		}
		
		if(this.unknown) {
			console.log('UNKNOWN', this.unknown);
			buffer.writeBytes([0x68, this.unknown]);
		}
		
		return buffer.getData();
	}
}

module.exports = Note;