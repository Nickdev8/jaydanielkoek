export const siteContent = {
	name: 'Jayden Daniel Koek',
	heroImage: {
		src: '/images/smallbirdinwater.jpg',
		alt: 'Een kleine vogel aan het water'
	},
	bio: 'Ik ben Jayden Daniel Koek. Ik fotografeer natuur en het leven in de stad. Hier deel ik een selectie van mijn foto’s.',
	featured: [
		{
			src: '/images/IJSVOGEL.jpg',
			alt: 'Een ijsvogel',
			caption: 'IJsvogel',
			width: 1440,
			height: 1022
		},
		{
			src: '/images/REDPANDA.jpg',
			alt: 'Een rode panda',
			caption: 'Rode panda',
			width: 1362,
			height: 906
		},
		{
			src: '/images/Hooglandjezijprofiel.jpg',
			alt: 'Een hooglandrund van opzij',
			caption: 'Hooglandrund',
			width: 1440,
			height: 960
		},
		{
			src: '/images/DARBRIDGE.jpg',
			alt: 'Een brug in de stad',
			caption: 'Brug',
			width: 1440,
			height: 960
		},
		{
			src: '/images/VISSER.jpg',
			alt: 'Een visser aan het water',
			caption: 'Visser',
			width: 1440,
			height: 1800
		},
		{
			src: '/images/nowarwomanprotests.jpg',
			alt: 'Een vrouw bij een protest',
			caption: 'Protest',
			width: 1440,
			height: 1800
		}
	],
	aboutImage: { src: '/images/IJSVOGEL.jpg', alt: 'Een ijsvogel' },
	email: 'jayden@gmail.com',
	instagram: 'https://www.instagram.com/jayjays.visuals/'
};

export type SitePhoto = (typeof siteContent.featured)[number];
