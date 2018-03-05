module.exports = {
	getProperty,
	mapToProperty
};

async function getProperty(element, property) {
	return await (await element.getProperty(property)).jsonValue();
}

async function mapToProperty(elements, property) {
	var values = [];
	for (var element of elements) {
		values.push(await getProperty(element, property));
	}
	return values;
}