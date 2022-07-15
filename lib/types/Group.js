class Group {
    constructor(name, fields, options={}) {
        this.name = name;
        this.fields = fields;
		this.options = options;
    }
    read(reader, proto, key) {
		if(this.options.repeating) {
			return this.readRepeating(reader, proto, key);
		}
		else {
			return this.readNormal(reader, proto, key);
		}
    }
	readRepeating(reader, proto, repeatingKey) {
		const messages = [];
		
		while(reader.hasNext()) {
			let key = reader.readVarint(true);
			if(key.field != repeatingKey.field) {
				//repeating are done so this key doesn't belong to it thus why we peek
				return messages;
			}
			key = reader.readVarint();
			const length = reader.readVarint().actual;
			const buffer = reader.slice(reader.index, length);
			while(buffer.hasNext()) {
				const key = buffer.readVarint(true);

				if(proto.fields[key.field]) {
					const v = proto.fields[key.field].read(buffer, proto.fields[key.field], key);
					messages.push(v);
				}
				else {
					//unknown
				}
			}
		}
		
		return messages;
	}
	readNormal(reader, proto) {
		const k = reader.readVarint();
		const length = reader.readVarint().actual;
        const buffer = reader.slice(reader.index, length);
        const message = {};

        while(buffer.hasNext()) {
            const key = buffer.readVarint(true);

            if(proto.fields[key.field]) {
                const v = proto.fields[key.field].read(buffer, proto.fields[key.field], key);
                message[proto.fields[key.field].name] = v;
            }
            else {
                //unknown
            }
        }

        return message;
	}
}

module.exports = Group;