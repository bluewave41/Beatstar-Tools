module.exports = {
	roundToPrecision: function(value, decimals) {
		const pow = Math.pow(10, decimals);
		return Math.round((value + Number.EPSILON) * pow) / pow;
    },
    rnd: function(len, chars='abcdef0123456789') {
        return [...Array(len)].map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    } 
}