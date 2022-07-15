class Key {
	constructor(b) {
		let binary = this.toBinaryString(b);
		this.wire = b & 0x07;
		this.field = b >> 3;
		this.value = binary;
		this.length = 0;
		this.actual = parseInt(this.value, 2);
	}
	toBinaryString(b) {
		return this.pad(b.toString(2));
	}
	pad(b) {
		let str = '';
		str = str.padStart(8 - b.length, '0');
		str += b;
		return str;
	}
}

module.exports = Key;