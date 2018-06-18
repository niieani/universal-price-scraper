interface Images
{
	xpath: string;
	naturalHeight: number;
	width: number;
	diffbotUri: string;
	title: string;
	url: string;
	naturalWidth: number;
	primary: boolean;
	height: number;
}

interface Objects
{
	images: Images[];
	offerPrice: string;
	regularPrice: string;
	regularPriceDetails?: RegularPriceDetails;
	diffbotUri: string;
	multipleProducts: boolean;
	availability: boolean;
	type: string;
	title: string;
	offerPriceDetails?: RegularPriceDetails;
	humanLanguage: string;
	pageUrl: string;
	text: string;
	category: string;
	brand: string;
}

interface RegularPriceDetails
{
	symbol: string;
	amount: number;
	text: string;
}

interface Request
{
	options: string[];
	pageUrl: string;
	api: string;
	version: number;
}

export interface Result
{
	request: Request;
	humanLanguage: string;
	objects: Objects[];
	type: string;
	title: string;
}
