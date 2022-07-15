const Key = require('./Key');

class ProtobufReader {
	constructor(data) {
		this.data = data;
		this.index = 0;
		this.packed = false;
		this.parsed = {};
	}
	process() {
		const blocks = this.processBlocks(this);
		this.parsed = blocks;
	}
	parseProto(proto) {
		const message = {};

		for(const key in proto) {
			const buffer = this.parsed[key];
			const d = proto[key].read(buffer, proto[key]);
			const name = proto[key].name ? proto[key].name : key;
			message[name] = d;
		}
		return message;
	}
	parseUnknown(key) {
		switch (key.wire) {
			case 0:
				return this.readVarint().actual;
			case 1:
				return this.read64Bit();
			case 2:
				const length = this.readVarint().actual;
				return this.slice(this.index, length);
			case 5:
				return this.read32Bit();
		}
	}
	processBlocks() {
		let info = {};
		while (this.hasNext()) {
			const key = this.readVarint();
			let val;

			switch (key.wire) {
				case 0:
					val = this.readVarint().actual;
					info[key.field] = val;
					console.log('VARINT', val);
					break;
				case 1:
					val = this.read64Bit();
					info[key.field] = val;
					console.log('64 BIT', val);
					break;
				case 2:
					const length = this.readVarint().actual;
					let segment = this.slice(this.index, length);
					if(this.isValidString(segment.data)) {
						segment = segment.data.toString();
					}
					info[key.field] = segment;
					break;
				case 5:
					val = this.read32Bit();
					info[key.field] = val;
					console.log('32 BIT', val);
					break;
			}
		}
		return info;
	}
	isValidString(str) {
		for (var i = 0; i < str.length; i++) {
			//20 - 125
			if ((str[i] < 20 || str[i] > 125) && str[i] != 10 && ![128, 226, 162, 153].includes(str[i])) {
				return false;
			}
		}
		return true;
	}
	hasNext() {
		return this.index < this.data.length;
	}
	readByte() {
		return this.data.readUInt8(this.index++);
	}
	read32Bit() {
		const b = this.data.readUInt32LE(this.index);
		this.index += 4;
		return b;
	}
	readFloat() {
		const f = this.data.readFloatLE(this.index);
		this.index += 4;
		return f;
	}
	read64Bit() {
		const b = this.data.readBigUInt64LE(this.index);
		this.index += 8;
		return b;
	}
	slice(start, length) {
		const data = this.data.slice(start, start + length);
		this.index += length;
		return new ProtobufReader(data);
	}
	readVarint(peek=false) {
		let arr = [];
		while (true) {
			const by = this.readByte();
			const b = new Key(by);
			arr.push(b.value.slice(1));
			if (b.value.startsWith(0)) {
				break;
			}
		}
		const key = new Key(parseInt(arr.reverse().join(''), 2));
		key.length = arr.length;
		
		if(peek) {
			this.index -= key.length;
		}

		return key;
	}
}

module.exports = ProtobufReader;