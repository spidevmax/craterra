const albums = [
	// =====================================================
	// RADIOHEAD
	// =====================================================

	{
		title: "OK Computer",
		artists: ["Radiohead"],
		format: "LP",
		releaseDate: new Date("1997-05-21"),
		labels: ["Parlophone", "Capitol Records"],
		genres: ["Alternative Rock", "Art Rock"],
		scenes: ["Oxford", "Britpop"],
		movements: ["Art Rock", "Alternative Rock"],
		coverArtUrl: "https://upload.wikimedia.org/wikipedia/en/b/ba/Radioheadokcomputer.png",
		coverArtId: "radiohead_ok_computer",
		personalNote: {
			content: "A landmark record that predicted modern alienation and digital anxiety.",
			lastEdited: new Date("2025-01-15T12:00:00Z"),
		},
		dimensions: {
			emotional: ["anxious", "contemplative", "melancholic"],
			sonic: ["layered", "atmospheric", "dense"],
		},
		tags: ["classic", "essential", "90s"],
		listeningContext: {
			firstListen: new Date("2012-06-10"),
			lastListen: new Date("2025-02-10"),
			frequency: "obsessive",
			context: "Headphones, night walks.",
		},
		releaseCountry: "United Kingdom",
		externalUrl: "https://rateyourmusic.com/release/album/radiohead/ok-computer/",
		rating: 10,
		favourite: true,
		connections: [],
	},

	{
		title: "Kid A",
		artists: ["Radiohead"],
		format: "LP",
		releaseDate: new Date("2000-10-02"),
		labels: ["Parlophone"],
		genres: ["Electronic", "Experimental", "Art Rock"],
		scenes: ["Oxford"],
		movements: ["IDM", "Experimental Rock"],
		coverArtId: "radiohead_kid_a",
		personalNote: {
			content: "The sound of a band abandoning expectations and reinventing itself.",
			lastEdited: new Date("2025-01-18"),
		},
		dimensions: {
			emotional: ["dreamy", "introspective", "peaceful"],
			sonic: ["experimental", "synthetic", "minimalist"],
		},
		tags: ["electronic", "reinvention"],
		listeningContext: {
			firstListen: new Date("2013-04-20"),
			lastListen: new Date("2025-03-01"),
			frequency: "regular",
			context: "Focus sessions.",
		},
		releaseCountry: "United Kingdom",
		externalUrl: "https://rateyourmusic.com/release/album/radiohead/kid-a/",
		rating: 10,
		favourite: true,
		connections: [],
	},

	{
		title: "In Rainbows",
		artists: ["Radiohead"],
		format: "LP",
		releaseDate: new Date("2007-10-10"),
		labels: ["XL Recordings"],
		genres: ["Art Rock", "Alternative Rock"],
		scenes: ["Oxford"],
		movements: ["Art Rock"],
		coverArtId: "radiohead_in_rainbows",
		personalNote: {
			content: "Their warmest and most human record. Beautifully understated.",
			lastEdited: new Date("2025-01-20"),
		},
		dimensions: {
			emotional: ["euphoric", "joyful", "introspective"],
			sonic: ["organic", "layered", "polished"],
		},
		tags: ["warm", "intimate"],
		listeningContext: {
			firstListen: new Date("2014-01-10"),
			lastListen: new Date("2025-02-01"),
			frequency: "regular",
			context: "Evening listening.",
		},
		releaseCountry: "United Kingdom",
		externalUrl: "https://rateyourmusic.com/release/album/radiohead/in-rainbows/",
		rating: 9.5,
		favourite: true,
		connections: [],
	},

	// =====================================================
	// FRANK OCEAN
	// =====================================================

	{
		title: "Channel Orange",
		artists: ["Frank Ocean"],
		format: "LP",
		releaseDate: new Date("2012-07-10"),
		labels: ["Def Jam"],
		genres: ["R&B", "Neo Soul"],
		scenes: ["Los Angeles"],
		movements: ["Alternative R&B"],
		coverArtId: "frank_channel_orange",
		personalNote: {
			content: "Storytelling, atmosphere and emotional depth in perfect balance.",
			lastEdited: new Date("2025-01-25"),
		},
		dimensions: {
			emotional: ["nostalgic", "melancholic", "introspective"],
			sonic: ["organic", "polished", "layered"],
		},
		tags: ["r&b", "classic"],
		listeningContext: {
			firstListen: new Date("2014-09-01"),
			lastListen: new Date("2025-01-10"),
			frequency: "regular",
			context: "Late-night drives.",
		},
		releaseCountry: "United States",
		externalUrl: "https://rateyourmusic.com/release/album/frank-ocean/channel-orange/",
		rating: 9,
		favourite: true,
		connections: [],
	},

	{
		title: "Blonde",
		artists: ["Frank Ocean"],
		format: "LP",
		releaseDate: new Date("2016-08-20"),
		labels: ["Boys Don't Cry"],
		genres: ["Alternative R&B", "Art Pop"],
		scenes: ["Los Angeles"],
		movements: ["Alternative R&B"],
		coverArtId: "frank_blonde",
		personalNote: {
			content: "One of the most emotionally vulnerable albums of the century.",
			lastEdited: new Date("2025-02-01"),
		},
		dimensions: {
			emotional: ["melancholic", "peaceful", "introspective"],
			sonic: ["minimalist", "spacious", "organic"],
		},
		tags: ["modern-classic"],
		listeningContext: {
			firstListen: new Date("2017-01-10"),
			lastListen: new Date("2025-02-15"),
			frequency: "obsessive",
			context: "Night listening.",
		},
		releaseCountry: "United States",
		externalUrl: "https://rateyourmusic.com/release/album/frank-ocean/blonde/",
		rating: 10,
		favourite: true,
		connections: [],
	},

	// =====================================================
	// BJÖRK
	// =====================================================

	{
		title: "Homogenic",
		artists: ["Björk"],
		format: "LP",
		releaseDate: new Date("1997-09-22"),
		labels: ["One Little Independent"],
		genres: ["Electronic", "Art Pop"],
		scenes: ["Reykjavik"],
		movements: ["Art Pop"],
		coverArtId: "bjork_homogenic",
		personalNote: {
			content: "Volcanic, emotional and futuristic all at the same time.",
			lastEdited: new Date("2025-01-05"),
		},
		dimensions: {
			emotional: ["euphoric", "rebellious", "contemplative"],
			sonic: ["synthetic", "layered", "atmospheric"],
		},
		tags: ["electronic", "art-pop"],
		releaseCountry: "Iceland",
		externalUrl: "https://rateyourmusic.com/release/album/bjork/homogenic/",
		rating: 9.5,
		favourite: true,
		connections: [],
	},

	{
		title: "Vespertine",
		artists: ["Björk"],
		format: "LP",
		releaseDate: new Date("2001-08-27"),
		labels: ["One Little Independent"],
		genres: ["Art Pop", "Electronic"],
		scenes: ["Reykjavik"],
		movements: ["Microhouse"],
		coverArtId: "bjork_vespertine",
		personalNote: {
			content: "A delicate masterpiece built from tiny sounds and huge emotions.",
			lastEdited: new Date("2025-01-11"),
		},
		dimensions: {
			emotional: ["peaceful", "dreamy", "introspective"],
			sonic: ["minimalist", "atmospheric", "organic"],
		},
		tags: ["winter", "intimate"],
		releaseCountry: "Iceland",
		externalUrl: "https://rateyourmusic.com/release/album/bjork/vespertine/",
		rating: 10,
		favourite: true,
		connections: [],
	},

	// =====================================================
	// EP
	// =====================================================

	{
		title: "EP2",
		artists: ["FKA twigs"],
		format: "EP",
		releaseDate: new Date("2013-09-17"),
		labels: ["Young"],
		genres: ["Electronic", "Alternative R&B"],
		scenes: ["London"],
		movements: ["Alternative R&B"],
		coverArtId: "fka_twigs_ep2",
		personalNote: {
			content: "Early glimpse of an artist already operating on another level.",
			lastEdited: new Date("2025-01-15"),
		},
		dimensions: {
			emotional: ["dreamy", "anxious"],
			sonic: ["experimental", "synthetic", "spacious"],
		},
		tags: ["ep", "experimental"],
		releaseCountry: "United Kingdom",
		externalUrl: "https://rateyourmusic.com/release/ep/fka-twigs/ep2/",
		rating: 8.5,
		favourite: false,
		connections: [],
	},
	// =====================================================
	// DREAM POP / INDIE
	// =====================================================

	{
		title: "Bloom",
		artists: ["Beach House"],
		format: "LP",
		releaseDate: new Date("2012-05-15"),
		labels: ["Sub Pop", "Bella Union"],
		genres: ["Dream Pop"],
		scenes: ["Baltimore"],
		movements: ["Dream Pop"],
		coverArtId: "beach_house_bloom",
		personalNote: {
			content: "Weightless melodies that somehow feel both nostalgic and infinite.",
			lastEdited: new Date("2025-01-18"),
		},
		dimensions: {
			emotional: ["dreamy", "peaceful", "nostalgic"],
			sonic: ["atmospheric", "layered", "spacious"],
		},
		tags: ["dream-pop", "night"],
		listeningContext: {
			firstListen: new Date("2017-05-12"),
			lastListen: new Date("2025-02-01"),
			frequency: "regular",
			context: "Late-night walks.",
		},
		releaseCountry: "United States",
		externalUrl: "https://rateyourmusic.com/release/album/beach-house/bloom/",
		rating: 9,
		favourite: true,
		connections: [],
	},

	{
		title: "Depression Cherry",
		artists: ["Beach House"],
		format: "LP",
		releaseDate: new Date("2015-08-28"),
		labels: ["Sub Pop"],
		genres: ["Dream Pop"],
		scenes: ["Baltimore"],
		movements: ["Dream Pop"],
		coverArtId: "beach_house_depression_cherry",
		personalNote: {
			content: "A slow-burning record that rewards complete immersion.",
			lastEdited: new Date("2025-01-12"),
		},
		dimensions: {
			emotional: ["melancholic", "dreamy", "peaceful"],
			sonic: ["atmospheric", "minimalist", "organic"],
		},
		tags: ["dream-pop"],
		releaseCountry: "United States",
		externalUrl: "https://rateyourmusic.com/release/album/beach-house/depression-cherry/",
		rating: 8.5,
		favourite: false,
		connections: [],
	},

	// =====================================================
	// ALVVAYS
	// =====================================================

	{
		title: "Blue Rev",
		artists: ["Alvvays"],
		format: "LP",
		releaseDate: new Date("2022-10-07"),
		labels: ["Polyvinyl"],
		genres: ["Indie Pop", "Shoegaze"],
		scenes: ["Toronto"],
		movements: ["Jangle Pop"],
		coverArtId: "alvvays_blue_rev",
		personalNote: {
			content: "Hooks everywhere without sacrificing atmosphere or emotion.",
			lastEdited: new Date("2025-01-20"),
		},
		dimensions: {
			emotional: ["joyful", "nostalgic", "dreamy"],
			sonic: ["layered", "organic", "dense"],
		},
		tags: ["indie", "favorite"],
		listeningContext: {
			firstListen: new Date("2022-10-08"),
			lastListen: new Date("2025-02-02"),
			frequency: "regular",
			context: "Sunny afternoons.",
		},
		releaseCountry: "Canada",
		externalUrl: "https://rateyourmusic.com/release/album/alvvays/blue-rev/",
		rating: 9.5,
		favourite: true,
		connections: [],
	},

	// =====================================================
	// CLAIRO
	// =====================================================

	{
		title: "Sling",
		artists: ["Clairo"],
		format: "LP",
		releaseDate: new Date("2021-07-16"),
		labels: ["Fader"],
		genres: ["Indie Folk", "Bedroom Pop"],
		scenes: ["Boston"],
		movements: ["Bedroom Pop"],
		coverArtId: "clairo_sling",
		personalNote: {
			content: "A subtle record that grows richer with every listen.",
			lastEdited: new Date("2025-01-15"),
		},
		dimensions: {
			emotional: ["peaceful", "contemplative", "joyful"],
			sonic: ["organic", "minimalist", "lo-fi"],
		},
		tags: ["folk", "soft"],
		releaseCountry: "United States",
		externalUrl: "https://rateyourmusic.com/release/album/clairo/sling/",
		rating: 8,
		favourite: false,
		connections: [],
	},

	// =====================================================
	// LORDE
	// =====================================================

	{
		title: "Melodrama",
		artists: ["Lorde"],
		format: "LP",
		releaseDate: new Date("2017-06-16"),
		labels: ["Republic Records"],
		genres: ["Art Pop", "Electropop"],
		scenes: ["Auckland"],
		movements: ["Art Pop"],
		coverArtId: "lorde_melodrama",
		personalNote: {
			content: "Every emotion feels larger than life without ever losing intimacy.",
			lastEdited: new Date("2025-01-10"),
		},
		dimensions: {
			emotional: ["euphoric", "melancholic", "nostalgic"],
			sonic: ["polished", "layered", "synthetic"],
		},
		tags: ["coming-of-age"],
		listeningContext: {
			firstListen: new Date("2018-01-01"),
			lastListen: new Date("2025-02-03"),
			frequency: "regular",
			context: "Night drives.",
		},
		releaseCountry: "New Zealand",
		externalUrl: "https://rateyourmusic.com/release/album/lorde/melodrama/",
		rating: 10,
		favourite: true,
		connections: [],
	},

	// =====================================================
	// PHOEBE BRIDGERS
	// =====================================================

	{
		title: "Punisher",
		artists: ["Phoebe Bridgers"],
		format: "LP",
		releaseDate: new Date("2020-06-18"),
		labels: ["Dead Oceans"],
		genres: ["Indie Folk"],
		scenes: ["Los Angeles"],
		movements: ["Indie Folk"],
		coverArtId: "phoebe_punisher",
		personalNote: {
			content: "Quiet, devastating songwriting with impeccable arrangements.",
			lastEdited: new Date("2025-01-18"),
		},
		dimensions: {
			emotional: ["melancholic", "contemplative", "peaceful"],
			sonic: ["organic", "spacious", "minimalist"],
		},
		tags: ["sad", "folk"],
		releaseCountry: "United States",
		externalUrl: "https://rateyourmusic.com/release/album/phoebe-bridgers/punisher/",
		rating: 9,
		favourite: true,
		connections: [],
	},

	// =====================================================
	// LIVE (enum)
	// =====================================================

	{
		title: "MTV Unplugged in New York",
		artists: ["Nirvana"],
		format: "Live",
		releaseDate: new Date("1994-11-01"),
		labels: ["DGC Records"],
		genres: ["Acoustic Rock"],
		scenes: ["Seattle"],
		movements: ["Grunge"],
		coverArtId: "nirvana_unplugged",
		personalNote: {
			content: "A live album that surpasses many studio recordings.",
			lastEdited: new Date("2025-01-15"),
		},
		dimensions: {
			emotional: ["melancholic", "peaceful"],
			sonic: ["organic", "raw"],
		},
		tags: ["live", "classic"],
		releaseCountry: "United States",
		externalUrl: "https://rateyourmusic.com/release/album/nirvana/mtv-unplugged-in-new-york/",
		rating: 10,
		favourite: true,
		connections: [],
	},

	// =====================================================
	// COMPILATION (enum)
	// =====================================================

	{
		title: "Greatest Hits",
		artists: ["Fleetwood Mac"],
		format: "Compilation",
		releaseDate: new Date("1988-11-15"),
		labels: ["Warner Bros."],
		genres: ["Rock", "Pop Rock"],
		scenes: ["California"],
		movements: ["Soft Rock"],
		coverArtId: "fleetwood_greatest_hits",
		personalNote: {
			content: "An ideal introduction to one of the greatest bands ever.",
			lastEdited: new Date("2025-01-08"),
		},
		dimensions: {
			emotional: ["joyful", "nostalgic"],
			sonic: ["polished", "organic"],
		},
		tags: ["hits"],
		releaseCountry: "United States",
		externalUrl: "https://rateyourmusic.com/release/comp/fleetwood-mac/greatest-hits/",
		rating: 8.5,
		favourite: false,
		connections: [],
	},

	// =====================================================
	// SILK SONIC
	// =====================================================

	{
		title: "An Evening with Silk Sonic",
		artists: ["Silk Sonic", "Bruno Mars", "Anderson .Paak"],
		format: "LP",
		releaseDate: new Date("2021-11-12"),
		labels: ["Aftermath", "Atlantic"],
		genres: ["Soul", "R&B", "Funk"],
		scenes: ["Las Vegas"],
		movements: ["Neo Soul"],
		coverArtId: "silk_sonic_evening",
		personalNote: {
			content: "Retro production executed with ridiculous precision.",
			lastEdited: new Date("2025-01-21"),
		},
		dimensions: {
			emotional: ["joyful", "euphoric"],
			sonic: ["polished", "organic", "layered"],
		},
		tags: ["collaboration", "funk"],
		releaseCountry: "United States",
		externalUrl: "https://rateyourmusic.com/release/album/silk-sonic/an-evening-with-silk-sonic/",
		rating: 8.5,
		favourite: false,
		connections: [],
	},
	// =====================================================
	// HIP HOP
	// =====================================================

	{
		title: "To Pimp a Butterfly",
		artists: ["Kendrick Lamar"],
		format: "LP",
		releaseDate: new Date("2015-03-15"),
		labels: ["Top Dawg Entertainment", "Aftermath", "Interscope"],
		genres: ["Hip Hop", "Jazz Rap", "Conscious Hip Hop"],
		scenes: ["Compton"],
		movements: ["Jazz Rap"],
		coverArtId: "kendrick_tpap",
		personalNote: {
			content: "A fearless fusion of jazz, funk and hip hop with unmatched lyrical ambition.",
			lastEdited: new Date("2025-02-01"),
		},
		dimensions: {
			emotional: ["rebellious", "angry", "contemplative"],
			sonic: ["organic", "dense", "layered"],
		},
		tags: ["hip-hop", "masterpiece", "political"],
		listeningContext: {
			firstListen: new Date("2016-03-10"),
			lastListen: new Date("2025-02-10"),
			frequency: "regular",
			context: "Focused listening.",
		},
		releaseCountry: "United States",
		externalUrl: "https://rateyourmusic.com/release/album/kendrick-lamar/to-pimp-a-butterfly/",
		rating: 10,
		favourite: true,
		connections: [],
	},

	// =====================================================
	// BOX SET (enum)
	// =====================================================

	{
		title: "Mono",
		artists: ["The Beatles"],
		format: "Box Set",
		releaseDate: new Date("2009-09-09"),
		labels: ["Apple Records"],
		genres: ["Rock"],
		scenes: ["Liverpool"],
		movements: ["British Invasion"],
		coverArtId: "beatles_mono_box",
		personalNote: {
			content: "The definitive way to experience the Beatles' mono mixes.",
			lastEdited: new Date("2025-01-11"),
		},
		dimensions: {
			emotional: ["joyful", "nostalgic"],
			sonic: ["organic", "polished"],
		},
		tags: ["box-set", "essential"],
		releaseCountry: "United Kingdom",
		externalUrl: "https://rateyourmusic.com/release/comp/the-beatles/the-beatles-in-mono/",
		rating: 9,
		favourite: false,
		connections: [],
	},

	// =====================================================
	// REMIX (enum)
	// =====================================================

	{
		title: "Bastards",
		artists: ["Björk"],
		format: "Remix",
		releaseDate: new Date("2012-11-19"),
		labels: ["One Little Independent"],
		genres: ["Electronic"],
		scenes: ["Reykjavik"],
		movements: ["Experimental Electronic"],
		coverArtId: "bjork_bastards",
		personalNote: {
			content: "Remixes that reinterpret Biophilia from unexpected perspectives.",
			lastEdited: new Date("2025-01-05"),
		},
		dimensions: {
			emotional: ["dreamy", "contemplative"],
			sonic: ["synthetic", "experimental", "abrasive"],
		},
		tags: ["remix"],
		releaseCountry: "Iceland",
		externalUrl: "https://rateyourmusic.com/release/album/bjork/bastards/",
		rating: 7,
		favourite: false,
		connections: [],
	},

	// =====================================================
	// INSTRUMENTAL (enum)
	// =====================================================

	{
		title: "Selected Ambient Works 85-92",
		artists: ["Aphex Twin"],
		format: "Instrumental",
		releaseDate: new Date("1992-02-12"),
		labels: ["Apollo Records"],
		genres: ["Ambient", "IDM"],
		scenes: ["Cornwall"],
		movements: ["Ambient Techno"],
		coverArtId: "aphex_selected",
		personalNote: {
			content: "Electronic minimalism that still feels futuristic decades later.",
			lastEdited: new Date("2025-01-25"),
		},
		dimensions: {
			emotional: ["peaceful", "dreamy"],
			sonic: ["minimalist", "synthetic", "spacious"],
		},
		tags: ["ambient"],
		releaseCountry: "United Kingdom",
		externalUrl: "https://rateyourmusic.com/release/album/aphex-twin/selected-ambient-works-85_92/",
		rating: 9.5,
		favourite: true,
		connections: [],
	},

	// =====================================================
	// MIXTAPE (enum)
	// =====================================================

	{
		title: "Acid Rap",
		artists: ["Chance the Rapper"],
		format: "Mixtape",
		releaseDate: new Date("2013-04-30"),
		labels: [],
		genres: ["Hip Hop"],
		scenes: ["Chicago"],
		movements: ["Alternative Hip Hop"],
		coverArtId: "chance_acid_rap",
		personalNote: {
			content: "A colorful mixtape full of personality and youthful optimism.",
			lastEdited: new Date("2025-01-30"),
		},
		dimensions: {
			emotional: ["joyful", "energetic"],
			sonic: ["layered", "organic"],
		},
		tags: ["mixtape"],
		releaseCountry: "United States",
		externalUrl: "https://rateyourmusic.com/release/mixtape/chance-the-rapper/acid-rap/",
		rating: 8.5,
		favourite: false,
		connections: [],
	},

	// =====================================================
	// HOLIDAY (enum)
	// =====================================================

	{
		title: "Merry Christmas",
		artists: ["Mariah Carey"],
		format: "Holiday",
		releaseDate: new Date("1994-10-28"),
		labels: ["Columbia Records"],
		genres: ["Christmas", "Pop"],
		scenes: ["New York"],
		movements: ["Contemporary Pop"],
		coverArtId: "mariah_christmas",
		personalNote: {
			content: "An unavoidable Christmas classic with legendary vocals.",
			lastEdited: new Date("2024-12-25"),
		},
		dimensions: {
			emotional: ["joyful", "peaceful", "nostalgic"],
			sonic: ["polished", "organic"],
		},
		tags: ["holiday"],
		releaseCountry: "United States",
		externalUrl: "https://rateyourmusic.com/release/album/mariah-carey/merry-christmas/",
		rating: 7.5,
		favourite: false,
		connections: [],
	},

	// =====================================================
	// SOUNDTRACK (enum)
	// =====================================================

	{
		title: "Interstellar",
		artists: ["Hans Zimmer"],
		format: "Soundtrack",
		releaseDate: new Date("2014-11-18"),
		labels: ["WaterTower Music"],
		genres: ["Film Score"],
		scenes: ["Hollywood"],
		movements: ["Modern Classical"],
		coverArtId: "zimmer_interstellar",
		personalNote: {
			content: "Massive, emotional and one of Zimmer's finest achievements.",
			lastEdited: new Date("2025-01-17"),
		},
		dimensions: {
			emotional: ["contemplative", "peaceful", "euphoric"],
			sonic: ["atmospheric", "dense", "organic"],
		},
		tags: ["soundtrack"],
		releaseCountry: "United States",
		externalUrl:
			"https://rateyourmusic.com/release/album/hans-zimmer/interstellar-original-motion-picture-soundtrack/",
		rating: 9,
		favourite: true,
		connections: [],
	},

	// =====================================================
	// REISSUE (enum)
	// =====================================================

	{
		title: "1989 (Taylor's Version)",
		artists: ["Taylor Swift"],
		format: "Reissue",
		releaseDate: new Date("2023-10-27"),
		labels: ["Republic Records"],
		genres: ["Pop", "Synthpop"],
		scenes: ["Nashville"],
		movements: ["Contemporary Pop"],
		coverArtId: "1989_taylors_version",
		personalNote: {
			content: "A successful re-recording that adds value beyond nostalgia.",
			lastEdited: new Date("2025-01-09"),
		},
		dimensions: {
			emotional: ["joyful", "nostalgic"],
			sonic: ["polished", "synthetic", "layered"],
		},
		tags: ["reissue"],
		releaseCountry: "United States",
		externalUrl: "https://rateyourmusic.com/release/album/taylor-swift/1989-taylors-version/",
		rating: 8,
		favourite: false,
		connections: [],
	},
	// =====================================================
	// SOPHIE
	// =====================================================

	{
		title: "OIL OF EVERY PEARL'S UN-INSIDES",
		artists: ["SOPHIE"],
		format: "LP",
		releaseDate: new Date("2018-06-15"),
		labels: ["Future Classic", "Transgressive"],
		genres: ["Electronic", "Hyperpop", "Experimental"],
		scenes: ["London"],
		movements: ["Hyperpop"],
		coverArtId: "sophie_oil",
		personalNote: {
			content: "A groundbreaking electronic record that completely reshaped pop music.",
			lastEdited: new Date("2025-01-20"),
		},
		dimensions: {
			emotional: ["euphoric", "rebellious", "dreamy"],
			sonic: ["synthetic", "experimental", "abrasive"],
		},
		tags: ["hyperpop", "experimental"],
		releaseCountry: "United Kingdom",
		externalUrl: "https://rateyourmusic.com/release/album/sophie/oil-of-every-pearls-un-insides/",
		rating: 9.5,
		favourite: true,
		connections: [],
	},

	// =====================================================
	// BOARDS OF CANADA
	// =====================================================

	{
		title: "Music Has the Right to Children",
		artists: ["Boards of Canada"],
		format: "LP",
		releaseDate: new Date("1998-04-20"),
		labels: ["Warp Records"],
		genres: ["IDM", "Ambient"],
		scenes: ["Edinburgh"],
		movements: ["IDM"],
		coverArtId: "boc_mhtrtc",
		personalNote: {
			content: "Nostalgic electronic music unlike anything else ever recorded.",
			lastEdited: new Date("2025-01-18"),
		},
		dimensions: {
			emotional: ["nostalgic", "dreamy", "peaceful"],
			sonic: ["lo-fi", "atmospheric", "layered"],
		},
		tags: ["idm", "ambient"],
		releaseCountry: "United Kingdom",
		externalUrl:
			"https://rateyourmusic.com/release/album/boards-of-canada/music-has-the-right-to-children/",
		rating: 10,
		favourite: true,
		connections: [],
	},

	// =====================================================
	// DAFT PUNK
	// =====================================================

	{
		title: "Discovery",
		artists: ["Daft Punk"],
		format: "LP",
		releaseDate: new Date("2001-03-12"),
		labels: ["Virgin Records"],
		genres: ["French House", "Electronic"],
		scenes: ["Paris"],
		movements: ["French House"],
		coverArtId: "daft_discovery",
		personalNote: {
			content: "Every track is memorable. Pure joy from beginning to end.",
			lastEdited: new Date("2025-01-30"),
		},
		dimensions: {
			emotional: ["joyful", "euphoric", "energetic"],
			sonic: ["polished", "layered", "synthetic"],
		},
		tags: ["dance", "classic"],
		releaseCountry: "France",
		externalUrl: "https://rateyourmusic.com/release/album/daft-punk/discovery/",
		rating: 9.5,
		favourite: true,
		connections: [],
	},

	// =====================================================
	// PORTISHEAD
	// =====================================================

	{
		title: "Dummy",
		artists: ["Portishead"],
		format: "LP",
		releaseDate: new Date("1994-08-22"),
		labels: ["Go! Beat"],
		genres: ["Trip Hop"],
		scenes: ["Bristol"],
		movements: ["Trip Hop"],
		coverArtId: "portishead_dummy",
		personalNote: {
			content: "The definitive trip-hop record. Dark, cinematic and timeless.",
			lastEdited: new Date("2025-01-11"),
		},
		dimensions: {
			emotional: ["melancholic", "contemplative", "anxious"],
			sonic: ["atmospheric", "organic", "dense"],
		},
		tags: ["trip-hop"],
		releaseCountry: "United Kingdom",
		externalUrl: "https://rateyourmusic.com/release/album/portishead/dummy/",
		rating: 10,
		favourite: true,
		connections: [],
	},

	// =====================================================
	// MASSIVE ATTACK
	// =====================================================

	{
		title: "Mezzanine",
		artists: ["Massive Attack"],
		format: "LP",
		releaseDate: new Date("1998-04-20"),
		labels: ["Virgin Records"],
		genres: ["Trip Hop"],
		scenes: ["Bristol"],
		movements: ["Trip Hop"],
		coverArtId: "massive_mezzanine",
		personalNote: {
			content: "Cold, hypnotic and endlessly influential.",
			lastEdited: new Date("2025-01-16"),
		},
		dimensions: {
			emotional: ["anxious", "contemplative", "melancholic"],
			sonic: ["dense", "atmospheric", "layered"],
		},
		tags: ["trip-hop", "dark"],
		releaseCountry: "United Kingdom",
		externalUrl: "https://rateyourmusic.com/release/album/massive-attack/mezzanine/",
		rating: 10,
		favourite: true,
		connections: [],
	},

	// =====================================================
	// COCTEAU TWINS
	// =====================================================

	{
		title: "Heaven or Las Vegas",
		artists: ["Cocteau Twins"],
		format: "LP",
		genres: ["Dream Pop"],
		rating: 9,
		favourite: false,
	},

	// =====================================================
	// WEYES BLOOD
	// =====================================================

	{
		title: "Titanic Rising",
		artists: ["Weyes Blood"],
		format: "LP",
		releaseDate: new Date("2019-04-05"),
		genres: ["Baroque Pop", "Dream Pop"],
		releaseCountry: "United States",
		rating: 8.5,
		favourite: false,
	},

	// =====================================================
	// THE MICROPHONES
	// =====================================================

	{
		title: "The Glow Pt. 2",
		artists: ["The Microphones"],
		format: "LP",
		releaseDate: new Date("2001-09-11"),
		genres: ["Indie Folk", "Lo-Fi"],
		personalNote: {
			content: "",
		},
		rating: 9.5,
		favourite: true,
	},
];

module.exports = albums;
