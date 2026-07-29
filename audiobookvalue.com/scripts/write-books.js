const fs = require("fs");
const p = "C:\\Users\\My Windows\\Documents\\亚马逊有声书\\audiobookvalue.com\\books.json";
const site = {
  name: "AudibleCreditOptimizer",
  domain: "audiobookvalue.com",
  tag: "yuanyuan07-20",
  description: "Find the best value Audible audiobooks.",
  affiliateDisclaimer: "As an Amazon Associate we earn from qualifying purchases."
};
const categories = [
  { id: "self-improvement", name: "Self-Improvement", icon: "🚀" },
  { id: "business", name: "Business & Finance", icon: "💼" },
  { id: "fiction", name: "Fiction & Literature", icon: "📚" },
  { id: "history", name: "History & Biography", icon: "🏛️" },
  { id: "science", name: "Science & Technology", icon: "🔬" },
  { id: "health", name: "Health & Wellness", icon: "🧠" }
];
const d = { site, categories, books: [] };
const b = d.books;
const bk = (as, sl, t, au, na, co, du, duM, ra, raC, liP, ca, ta, de, re) => {
  b.push({ asin: as, slug: sl, title: t, author: au, narrator: na, coverUrl: co, duration: du, durationMinutes: duM, rating: ra, ratingCount: raC, listPrice: liP, audiblePrice: 0, isCreditEligible: true, isPlusCatalog: false, categories: ca, tags: ta, description: de, releaseDate: re });
};
bk("B01EI1V7GQ","atomic-habits-james-clear","Atomic Habits","James Clear","James Clear","https://m.media-amazon.com/images/I/51b1lXR29JL._SL500_.jpg","5h 35m",335,4.8,185000,14.95,["self-improvement"],["best-seller","top-rated","quick-read"],"No matter your goals, Atomic Habits offers a proven framework for improving every day.","2018-10-16");
bk("B07BZ3T3K","can-hurt-me-david-goggins","Can't Hurt Me","David Goggins","David Goggins, Adam Skolnick","https://m.media-amazon.com/images/I/41wMPMMhD-L._SL500_.jpg","13h 44m",824,4.9,120000,17.95,["self-improvement","health"],["best-seller","top-rated","long-read"],"David Goggins story of transformation from depressed young man to US Armed Forces icon.","2018-11-15");
bk("B002V5A2JQ","the-power-of-now-eckhart-tolle","The Power of Now","Eckhart Tolle","Eckhart Tolle","https://m.media-amazon.com/images/I/51dG-PdMXKL._SL500_.jpg","7h 28m",448,4.7,95000,13.95,["self-improvement","health"],["best-seller","top-rated","classic"],"Eckhart Tolle guide to present-moment awareness and inner peace.","2008-03-01");
bk("B07QWH8L5G","the-psychology-of-money-morgan-housel","The Psychology of Money","Morgan Housel","Chris Hill","https://m.media-amazon.com/images/I/51iWwXN6J6L._SL500_.jpg","5h 41m",341,4.7,95000,13.99,["business","self-improvement"],["best-seller","top-rated","quick-read"],"Timeless lessons on wealth greed and happiness.","2020-09-08");
bk("B079D2LJ5R","educated-tara-westover","Educated","Tara Westover","Julia Whelan","https://m.media-amazon.com/images/I/51tWeWrR3lL._SL500_.jpg","12h 5m",725,4.6,110000,16.95,["history","self-improvement"],["best-seller","top-rated","long-read"],"A memoir about leaving a survivalist family to earn a PhD from Cambridge.","2018-02-20");
bk("B00H7QDS3M","the-subtle-art-of-not-giving-a-fck-mark-manson","The Subtle Art of Not Giving a F*ck","Mark Manson","Roger Wayne","https://m.media-amazon.com/images/I/41pR-fDkdUL._SL500_.jpg","5h 42m",342,4.6,140000,12.99,["self-improvement"],["best-seller","top-rated","quick-read"],"Mark Manson counterintuitive approach to living a good life.","2016-09-13");
bk("B07DJX91Q3","deep-work-cal-newport","Deep Work","Cal Newport","Jeff Bottoms","https://m.media-amazon.com/images/I/4101NwT0DPL._SL500_.jpg","7h 50m",470,4.6,55000,14.95,["business","self-improvement","science"],["top-rated","productivity"],"Deep work: the ability to focus without distraction on demanding tasks.","2016-01-05");
bk("B00NQ4E0GS","sapiens-yuval-noah-harari","Sapiens","Yuval Noah Harari","Derek Perkins","https://m.media-amazon.com/images/I/51F8RoL8TZL._SL500_.jpg","15h 19m",919,4.6,130000,19.95,["history","science"],["best-seller","top-rated","long-read"],"A brief history of humankind from the Cognitive Revolution to today.","2015-02-10");
bk("B01COQ1E4I","when-breath-becomes-air-paul-kalanithi","When Breath Becomes Air","Paul Kalanithi","Sunil Malhotra","https://m.media-amazon.com/images/I/51dKfUy2hWL._SL500_.jpg","5h 26m",326,4.8,75000,11.99,["health","history"],["best-seller","top-rated","quick-read"],"A neurosurgeon reflects on life and meaning in the face of terminal cancer.","2016-04-06");
bk("B08D4YQJ2Q","the-almanack-of-naval-ravikant-eric-jorgenson","The Almanack of Naval Ravikant","Eric Jorgenson","Vikas Adam","https://m.media-amazon.com/images/I/41n4K7+7qkL._SL500_.jpg","7h 28m",448,4.7,25000,13.99,["business","self-improvement"],["top-rated","wealth"],"Wisdom on wealth happiness and building a purposeful life.","2020-09-08");
bk("B00DI1I1GK","thinking-fast-and-slow-daniel-kahneman","Thinking Fast and Slow","Daniel Kahneman","Patrick Egan","https://m.media-amazon.com/images/I/414dPTV-4hL._SL500_.jpg","20h 8m",1208,4.6,70000,21.99,["science","business","self-improvement"],["top-rated","long-read","classic"],"Nobel Prize winner reveals the two systems of thought that drive our decisions.","2011-10-25");
bk("B07P2YJFSX","the-richest-man-in-babylon-george-s-clason","The Richest Man in Babylon","George S Clason","Jeffrey Gitt","https://m.media-amazon.com/images/I/41ZwWjRSs6L._SL500_.jpg","4h 2m",242,4.7,50000,9.99,["business","self-improvement"],["classic","top-rated"],"Timeless parables of wealth and success set in ancient Babylon.","2018-12-05");
bk("B07KPY46ML","dare-to-lead-brene-brown","Dare to Lead","Brene Brown","Brene Brown","https://m.media-amazon.com/images/I/513IYj3d7nL._SL500_.jpg","8h 3m",483,4.7,40000,14.95,["business","self-improvement"],["top-rated","leadership"],"Brene Brown research-backed guide to brave leadership.","2018-10-09");
bk("B000H2NJU0","1984-george-orwell","1984","George Orwell","Simon Prebble","https://m.media-amazon.com/images/I/51m6s4bM8eL._SL500_.jpg","11h 19m",679,4.6,85000,14.95,["fiction"],["classic","top-rated","long-read"],"George Orwell dystopian masterpiece of surveillance and totalitarianism.","2006-03-06");
bk("B01J4VWY9E","the-7-habits-of-highly-effective-people-stephen-covey","The 7 Habits of Highly Effective People","Stephen R Covey","Stephen R Covey","https://m.media-amazon.com/images/I/41KFPvMaoNL._SL500_.jpg","14h 52m",892,4.6,60000,17.95,["self-improvement","business"],["classic","top-rated","long-read"],"Principle-centered approach for personal and professional effectiveness.","2010-12-15");
bk("B07N4L385Y","the-body-keeps-the-score-bessel-van-der-kolk","The Body Keeps the Score","Bessel van der Kolk","Sean Pratt","https://m.media-amazon.com/images/I/51gQObNVTwL._SL500_.jpg","17h 40m",1060,4.7,50000,19.95,["health","science"],["best-seller","top-rated","long-read"],"How traumatic experiences reshape both body and brain.","2019-04-16");
bk("B01MSZS1CX","mans-search-for-meaning-viktor-frankl","Man's Search for Meaning","Viktor E Frankl","Simon Vance","https://m.media-amazon.com/images/I/51jAR-Gn3pL._SL500_.jpg","5h 57m",357,4.7,70000,12.95,["health","self-improvement","history"],["classic","top-rated"],"Viktor Frankl memoir of survival in Nazi camps and finding meaning.","2006-09-25");
bk("B07QH6BJN1","the-infinite-game-simon-sinek","The Infinite Game","Simon Sinek","Simon Sinek","https://m.media-amazon.com/images/I/415aEALVqbL._SL500_.jpg","6h 57m",417,4.6,25000,14.99,["business","self-improvement"],["top-rated","leadership"],"Why leaders who adopt an infinite mindset will thrive.","2019-10-15");
bk("B07BBN3V2P","factfulness-hans-rosling","Factfulness","Hans Rosling","Simon Vance","https://m.media-amazon.com/images/I/51hMvVRE7zL._SL500_.jpg","8h 46m",526,4.7,35000,14.99,["science","self-improvement"],["best-seller","top-rated"],"Hans Rosling reveals the ten instincts that distort our view of the world.","2018-04-03");
bk("B0031TJA0S","a-short-history-of-nearly-everything-bill-bryson","A Short History of Nearly Everything","Bill Bryson","Richard Matthews","https://m.media-amazon.com/images/I/51N6KAo3GVL._SL500_.jpg","18h 32m",1112,4.6,45000,19.95,["science","history"],["long-read","top-rated","classic"],"Bill Bryson journey through the cosmos Earth history and evolution of life.","2003-05-06");
fs.writeFileSync(p, JSON.stringify(d, null, 2));
console.log("OK " + d.books.length + " books written");