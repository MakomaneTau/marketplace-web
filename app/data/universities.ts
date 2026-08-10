export interface UniversityCampus {
	name: string;
	city?: string;
	province?: string;
}

export interface University {
	name: string;
	acronym: string;
	slug: string;
	campuses: UniversityCampus[];
	notes?: string;
}

export const southAfricanUniversities: University[] = [
	{
		name: "Cape Peninsula University of Technology",
		acronym: "CPUT",
		slug: "cape-peninsula-university-of-technology",
		campuses: [
			{ name: "Bellville Campus", city: "Cape Town", province: "Western Cape" },
			{ name: "Cape Town Campus", city: "Cape Town", province: "Western Cape" },
			{ name: "Mowbray Campus", city: "Cape Town", province: "Western Cape" },
			{ name: "Wellington Campus", city: "Wellington", province: "Western Cape" },
			{ name: "Granger Bay Campus", city: "Cape Town", province: "Western Cape" },
		],
	},
	{
		name: "Central University of Technology",
		acronym: "CUT",
		slug: "central-university-of-technology",
		campuses: [
			{ name: "Bloemfontein Campus", city: "Bloemfontein", province: "Free State" },
			{ name: "Welkom Campus", city: "Welkom", province: "Free State" },
		],
	},
	{
		name: "Durban University of Technology",
		acronym: "DUT",
		slug: "durban-university-of-technology",
		campuses: [
			{ name: "Steve Biko Campus", city: "Durban", province: "KwaZulu-Natal" },
			{ name: "M.L. Sultan Campus", city: "Durban", province: "KwaZulu-Natal" },
			{ name: "Ritson Campus", city: "Durban", province: "KwaZulu-Natal" },
			{ name: "Indumiso Campus", city: "Pietermaritzburg", province: "KwaZulu-Natal" },
			{ name: "Riverside Campus", city: "Durban", province: "KwaZulu-Natal" },
		],
	},
	{
		name: "Mangosuthu University of Technology",
		acronym: "MUT",
		slug: "mangosuthu-university-of-technology",
		campuses: [
			{ name: "Main Campus", city: "Umlazi", province: "KwaZulu-Natal" },
		],
	},
	{
		name: "Nelson Mandela University",
		acronym: "NMU",
		slug: "nelson-mandela-university",
		campuses: [
			{ name: "Missionvale Campus", city: "Gqeberha", province: "Eastern Cape" },
			{ name: "George Campus", city: "George", province: "Western Cape" },
			{ name: "North Campus", city: "Gqeberha", province: "Eastern Cape" },
			{ name: "South Campus", city: "Gqeberha", province: "Eastern Cape" },
			{ name: "Second Avenue Campus", city: "Gqeberha", province: "Eastern Cape" },
			{ name: "Bird Street Campus", city: "Gqeberha", province: "Eastern Cape" },
			{ name: "Ocean Sciences Campus", city: "Gqeberha", province: "Eastern Cape" },
		],
	},
	{
		name: "North-West University",
		acronym: "NWU",
		slug: "north-west-university",
		campuses: [
			{ name: "Mahikeng Campus", city: "Mahikeng", province: "North West" },
			{ name: "Potchefstroom Campus", city: "Potchefstroom", province: "North West" },
			{ name: "Vanderbijlpark Campus", city: "Vanderbijlpark", province: "Gauteng" },
		],
	},
	{
		name: "Rhodes University",
		acronym: "RU",
		slug: "rhodes-university",
		campuses: [
			{ name: "Main Campus", city: "Makhanda", province: "Eastern Cape" },
		],
	},
	{
		name: "Sefako Makgatho Health Sciences University",
		acronym: "SMU",
		slug: "sefako-makgatho-health-sciences-university",
		campuses: [
			{ name: "Ga-Rankuwa Campus", city: "Pretoria", province: "Gauteng" },
		],
	},
	{
		name: "Sol Plaatje University",
		acronym: "SPU",
		slug: "sol-plaatje-university",
		campuses: [
			{ name: "Main Campus", city: "Kimberley", province: "Northern Cape" },
		],
	},
	{
		name: "Stellenbosch University",
		acronym: "SU",
		slug: "stellenbosch-university",
		campuses: [
			{ name: "Stellenbosch Campus", city: "Stellenbosch", province: "Western Cape" },
			{ name: "Tygerberg Campus", city: "Cape Town", province: "Western Cape" },
		],
	},
	{
		name: "Tshwane University of Technology",
		acronym: "TUT",
		slug: "tshwane-university-of-technology",
		campuses: [
			{ name: "Arcadia Campus", city: "Pretoria", province: "Gauteng" },
			{ name: "Arts Campus", city: "Pretoria", province: "Gauteng" },
			{ name: "Ga-Rankuwa Campus", city: "Pretoria", province: "Gauteng" },
			{ name: "Soshanguve North Campus", city: "Pretoria", province: "Gauteng" },
			{ name: "Soshanguve South Campus", city: "Pretoria", province: "Gauteng" },
			{ name: "eMalahleni Campus", city: "eMalahleni", province: "Mpumalanga" },
			{ name: "Mbombela Campus", city: "Mbombela", province: "Mpumalanga" },
			{ name: "Polokwane Campus", city: "Polokwane", province: "Limpopo" },
		],
	},
	{
		name: "University of Cape Town",
		acronym: "UCT",
		slug: "university-of-cape-town",
		campuses: [
			{ name: "Upper Campus", city: "Cape Town", province: "Western Cape" },
			{ name: "Middle Campus", city: "Cape Town", province: "Western Cape" },
			{ name: "Lower Campus", city: "Cape Town", province: "Western Cape" },
			{ name: "Hiddingh Campus", city: "Cape Town", province: "Western Cape" },
			{ name: "Medical Campus", city: "Cape Town", province: "Western Cape" },
		],
	},
	{
		name: "University of Fort Hare",
		acronym: "UFH",
		slug: "university-of-fort-hare",
		campuses: [
			{ name: "Alice Campus", city: "Alice", province: "Eastern Cape" },
			{ name: "East London Campus", city: "East London", province: "Eastern Cape" },
			{ name: "Bhisho Campus", city: "Bhisho", province: "Eastern Cape" },
		],
	},
	{
		name: "University of Johannesburg",
		acronym: "UJ",
		slug: "university-of-johannesburg",
		campuses: [
			{ name: "Auckland Park Kingsway Campus", city: "Johannesburg", province: "Gauteng" },
			{ name: "Auckland Park Bunting Road Campus", city: "Johannesburg", province: "Gauteng" },
			{ name: "Doornfontein Campus", city: "Johannesburg", province: "Gauteng" },
			{ name: "Soweto Campus", city: "Johannesburg", province: "Gauteng" },
		],
	},
	{
		name: "University of KwaZulu-Natal",
		acronym: "UKZN",
		slug: "university-of-kwazulu-natal",
		campuses: [
			{ name: "Howard College Campus", city: "Durban", province: "KwaZulu-Natal" },
			{ name: "Edgewood Campus", city: "Pinetown", province: "KwaZulu-Natal" },
			{ name: "Medical School Campus", city: "Durban", province: "KwaZulu-Natal" },
			{ name: "Westville Campus", city: "Durban", province: "KwaZulu-Natal" },
			{ name: "Pietermaritzburg Campus", city: "Pietermaritzburg", province: "KwaZulu-Natal" },
		],
	},
	{
		name: "University of Limpopo",
		acronym: "UL",
		slug: "university-of-limpopo",
		campuses: [
			{ name: "Turfloop Campus", city: "Mankweng", province: "Limpopo" },
		],
	},
	{
		name: "University of Mpumalanga",
		acronym: "UMP",
		slug: "university-of-mpumalanga",
		campuses: [
			{ name: "Mbombela Campus", city: "Mbombela", province: "Mpumalanga" },
			{ name: "Siyabuswa Campus", city: "Siyabuswa", province: "Mpumalanga" },
		],
	},
	{
		name: "University of Pretoria",
		acronym: "UP",
		slug: "university-of-pretoria",
		campuses: [
			{ name: "Hatfield Campus", city: "Pretoria", province: "Gauteng" },
			{ name: "Groenkloof Campus", city: "Pretoria", province: "Gauteng" },
			{ name: "Prinshof Campus", city: "Pretoria", province: "Gauteng" },
			{ name: "Onderstepoort Campus", city: "Pretoria", province: "Gauteng" },
			{ name: "Mamelodi Campus", city: "Pretoria", province: "Gauteng" },
		],
	},
	{
		name: "University of South Africa",
		acronym: "UNISA",
		slug: "university-of-south-africa",
		campuses: [
			{ name: "Muckleneuk Campus", city: "Pretoria", province: "Gauteng" },
			{ name: "Regional Service Centres", city: "Nationwide", province: "South Africa" },
		],
		notes: "UNISA is primarily a distance-learning university with support centres across the country.",
	},
	{
		name: "University of the Free State",
		acronym: "UFS",
		slug: "university-of-the-free-state",
		campuses: [
			{ name: "Bloemfontein Campus", city: "Bloemfontein", province: "Free State" },
			{ name: "Qwaqwa Campus", city: "Phuthaditjhaba", province: "Free State" },
			{ name: "South Campus", city: "Bloemfontein", province: "Free State" },
		],
	},
	{
		name: "University of the Western Cape",
		acronym: "UWC",
		slug: "university-of-the-western-cape",
		campuses: [
			{ name: "Main Campus", city: "Bellville", province: "Western Cape" },
			{ name: "Bellville Park Campus", city: "Bellville", province: "Western Cape" },
		],
	},
	{
		name: "University of the Witwatersrand",
		acronym: "Wits",
		slug: "university-of-the-witwatersrand",
		campuses: [
			{ name: "East Campus", city: "Johannesburg", province: "Gauteng" },
			{ name: "West Campus", city: "Johannesburg", province: "Gauteng" },
			{ name: "Education Campus", city: "Johannesburg", province: "Gauteng" },
			{ name: "Medical School", city: "Johannesburg", province: "Gauteng" },
		],
	},
	{
		name: "University of Venda",
		acronym: "UNIVEN",
		slug: "university-of-venda",
		campuses: [
			{ name: "Main Campus", city: "Thohoyandou", province: "Limpopo" },
		],
	},
	{
		name: "University of Zululand",
		acronym: "UNIZULU",
		slug: "university-of-zululand",
		campuses: [
			{ name: "KwaDlangezwa Campus", city: "Empangeni", province: "KwaZulu-Natal" },
			{ name: "Richards Bay Campus", city: "Richards Bay", province: "KwaZulu-Natal" },
		],
	},
	{
		name: "Walter Sisulu University",
		acronym: "WSU",
		slug: "walter-sisulu-university",
		campuses: [
			{ name: "Mthatha Campus", city: "Mthatha", province: "Eastern Cape" },
			{ name: "Buffalo City Campus", city: "East London", province: "Eastern Cape" },
			{ name: "Butterworth Campus", city: "Butterworth", province: "Eastern Cape" },
			{ name: "Komani Campus", city: "Komani", province: "Eastern Cape" },
		],
	},
];

export function getUniversityBySlug(slug: string): University | undefined {
	return southAfricanUniversities.find(
		(university) => university.slug === slug,
	);
}

export function getUniversityCampuses(slug: string): UniversityCampus[] {
	return getUniversityBySlug(slug)?.campuses ?? [];
}
