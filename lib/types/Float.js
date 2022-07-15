class Float {
	constructor(name, field) {
		this.name = name;
		this.field = field;
	}
	read(reader, proto) {
		const key = reader.readVarint().actual;
		const f = reader.readFloat();
		return f;
	}
}

module.exports = Float;