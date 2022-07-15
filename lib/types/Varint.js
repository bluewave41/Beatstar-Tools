class Varint {
	constructor(name, field, options={}) {
		this.name = name;
		this.field = field;
		this.options = options;
	}
	read(reader, proto) {
		let varints = [];
		
		if(!reader.data) {
			return reader;
		}

		const key = reader.readVarint();
		
		if(this.options.repeating) {
			while(reader.hasNext()) {
				varints.push(reader.readVarint().actual);
				if(!reader.hasNext()) {
					return varints;
				}
				const key = reader.readVarint();
			}
		}
		
		const val = reader.readVarint().actual;
		return val;
	}
}

module.exports = Varint;