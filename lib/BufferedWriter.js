class BufferedWriter {
	constructor(size) {
		this.buffer = Buffer.alloc(size);
		this.position = 0;
	}
	writeBytes(bytes) {
		for(var x=0;x<bytes.length;x++) {
			this.buffer.writeUInt8(bytes[x], this.position++);
		}
	}
	writeByte(byte) {
		this.buffer.writeUInt8(byte, this.position++);
	}
	writeFloat(float) {
		this.buffer.writeFloatLE(float, this.position);
		this.position += 4;
	}
	getFilled() {
		return this.buffer.slice(0, this.position);
	}
	slice(start, end) {
		return this.buffer.slice(start, end);
	}
	getData() {
		return this.buffer;
	}
}

module.exports = BufferedWriter;