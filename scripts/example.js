const url = 'https://thesimpsonsquoteapi.glitch.me/quotes?count=10';

async function fileJSON(url) {
  let data = await fetch(url);
  let file = await data.json();
  return file;
}

let getData = fileJSON(url);

getData
  .then(file =>
    file.forEach(element => {
      let title = element.quote;
      let name = element.character;
      let srcIMG = element.image;
      let politicalParty = element.characterDirection;
      console.log(title + ', ' + name + ', ' + srcIMG + ', ' + politicalParty);
    })
  )
  .catch(error => console.log(error));
