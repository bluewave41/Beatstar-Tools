import BufferedWriter from 'lib/BufferedWriter';

class Header {
    constructor() {}
    getBuffer() {
        let buffer = new BufferedWriter(10);
        buffer.writeByte(0x8); //static
        buffer.writeByte(0xfc); //LEB128 interactions id
        buffer.writeByte(0x03); //LEB128 interactions id
        buffer.writeByte(0x12); //static
        buffer.writeByte(0x4); //length of string
        buffer.writeByte(0x37); //string
        buffer.writeByte(0x37); //string
        buffer.writeByte(0x2d); //string
        buffer.writeByte(0x31); //string
        buffer.writeByte(0x2a); //string

        return buffer.getData();
    }
}

module.exports = Header;