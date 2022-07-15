const Key = require('../Key');

class String {
	constructor(name, field, options={}) {
		this.name = name;
		this.field = field;
		this.options = options;
	}
	read(reader, proto) {
		let strs = [];
		let length;
		if(this.options.repeating) {
			while(reader.hasNext()) {
				const key = reader.readVarint();
				debugger;
				length = reader.readVarint().actual; //full length of repeating segmment
				const buffer = reader.slice(reader.index, length);
				while(buffer.hasNext()) {
					const strLength = buffer.readVarint().actual;
					strs.push(buffer.slice(buffer.index, strLength).toString());
				}
				
			}
			return strs;
		}
		if(!reader.data) {
			return reader;
		}
		const key = reader.readVarint();
		console.log('STRING KEY', key)
		length = reader.readVarint().actual;
		const str = reader.slice(reader.index, length).toString();
		console.log('STR', str);
		return str;
	}
}

module.exports = String;