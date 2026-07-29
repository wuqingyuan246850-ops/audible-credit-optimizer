const fs = require("fs");
const p = "C:\\Users\\My Windows\\Documents\\亚马逊有声书\\audiobookvalue.com\\books.json";
const d = JSON.parse(fs.readFileSync(p, "utf-8"));

d.categories = [
  {id:"arts-entertainment", name:"Arts & Entertainment", icon:"🎭"},
  {id:"biographies-memoirs", name:"Biographies & Memoirs", icon:"📖"},
  {id:"business", name:"Business & Careers", icon:"💼"},
  {id:"children", name:"Children's Audiobooks", icon:"🧒"},
  {id:"classics", name:"Classics", icon:"🏛️"},
  {id:"comedy", name:"Comedy & Humor", icon:"😂"},
  {id:"hobbies-home", name:"Crafts, Hobbies & Home", icon:"🛠️"},
  {id:"education", name:"Education & Learning", icon:"🎓"},
  {id:"fantasy", name:"Fantasy", icon:"🐉"},
  {id:"fiction", name:"Fiction & Literature", icon:"📚"},
  {id:"health-wellness", name:"Health & Wellness", icon:"🧠"},
  {id:"history", name:"History", icon:"📜"},
  {id:"language", name:"Language Instruction", icon:"🗣️"},
  {id:"lgbtq", name:"LGBTQ+", icon:"🌈"},
  {id:"medical", name:"Medical", icon:"🏥"},
  {id:"money-finance", name:"Money & Finance", icon:"💰"},
  {id:"mystery-thriller", name:"Mystery, Thriller & Suspense", icon:"🔍"},
  {id:"nonfiction", name:"Nonfiction", icon:"📓"},
  {id:"parenting-families", name:"Parenting & Families", icon:"👨‍👩‍👧‍👦"},
  {id:"politics-social", name:"Politics & Social Sciences", icon:"🗳️"},
  {id:"religion-spirituality", name:"Religion & Spirituality", icon:"🕊️"},
  {id:"romance", name:"Romance", icon:"💕"},
  {id:"science", name:"Science & Engineering", icon:"🔬"},
  {id:"sci-fi", name:"Science Fiction", icon:"👾"},
  {id:"self-improvement", name:"Self-Development", icon:"🚀"},
  {id:"sports-outdoors", name:"Sports & Outdoors", icon:"⚽"},
  {id:"technology", name:"Technology", icon:"💻"},
  {id:"teen-young-adult", name:"Teen & Young Adult", icon:"🧑"},
  {id:"travel", name:"Travel & Tourism", icon:"✈️"},
  {id:"true-crime", name:"True Crime", icon:"🔪"}
];

// Map old categories to new IDs where they changed
const catMap = {
  "health": "health-wellness"
};
for (const book of d.books) {
  book.categories = book.categories.map(c => catMap[c] || c);
}

fs.writeFileSync(p, JSON.stringify(d, null, 2));
console.log("Updated to " + d.categories.length + " categories, " + d.books.length + " books remapped");