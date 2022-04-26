const leb = require('leb');

class ByteReader {
	constructor(data) {
		if(!Buffer.isBuffer(data)) {
			data = Buffer.from(data);
		}
		this.position = 0;
		this.data = data;
	}
	hasNext() {
		return this.position < this.data.length;
	}
	peek() {
		return this.data[this.position];
	}
	readByte() {
		let b = this.data.readUInt8(this.position++);
		return b;
	}
	readInt() {
		let b = this.data.readUInt32BE(this.position);
		this.position += 4;
		return b;
	}
	readFloat() {
        let b = this.data.readFloatLE(this.position);
		this.position += 4;
		return b;
	}
	readLeb(position) {
		let b = leb.decodeUInt32(this.data, position);
		this.position = b.nextIndex;
		return b.value;
	}
	readString() {
		let length = this.readByte();
		let str = '';
		for(var x=0;x<length;x++) {
			str += String.fromCharCode(this.data[this.position++]);
		}
		if(this.readByte() != 0x2a) {
			throw new Error(`Malformed string at position ${this.position}.`);
		}
		return str;
	}
	slice(numberofBytes) {
		let chunk = this.data.slice(this.position, this.position+numberofBytes);
		this.position += numberofBytes;
		return chunk;
	}
	readLength(length) {
		let arr = [];
		let end = this.position+length;
		while(this.position < end) {
			arr.push(this.data[this.position++]);
		}
		return arr;
	}
	getData() {
		return this.data;
	}
	checkBytes(byteArray) {
		for(var x=0;x<byteArray.length;x++) {
			let b = this.readByte();
			if(b != byteArray[x]) {
				console.log(this.data);
				throw new Error(`Unexpected byte. Expected ${byteArray[x]} but got ${b} at position ${this.position}.`);
			}
		}
	}
	checkByte(expected) {
		let b = this.readByte();
		if(b != expected) {
			console.log(this.data);
			throw new Error(`Unexpected byte. Expected ${expected} but got ${b} at ${this.position}.`);
		}
	}
}

module.exports = ByteReader;