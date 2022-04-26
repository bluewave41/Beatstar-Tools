import BufferedWriter from 'lib/BufferedWriter';
import leb from 'leb128';

class Metadata {
    constructor(data) {
        this.offsets = data.map(el => el.offset);
        this.multipliers = data.map(el => el.multiplier);
    }
    getBuffer(resolution, endByte) {
        const size = 11 * this.offsets.length - 3;
        const buffer = new BufferedWriter(size);
        buffer.writeBytes(leb.unsigned.encode(size-2));
        buffer.writeByte(0x5);

        for(var x=0;x<this.offsets.length;x++) {
            let row = this.offsets[x];
            let multiplier = this.multipliers[x];
            if(row != 0) {
                buffer.writeFloat(row / resolution);
            }
            buffer.writeByte(0x15);
            buffer.writeFloat(multiplier);
            if(x + 1 < this.offsets.length) {
                buffer.writeBytes([0xa, 0xd]);
            }
        }

        buffer.writeByte(endByte);

        return buffer.getData();
    }
}

module.exports = Metadata;