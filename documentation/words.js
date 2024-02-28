const { KMR, HNN } = require('koalanlp/API');
const { initialize } = require('koalanlp/Util');
const { Tagger, Parser } = require('koalanlp/proc');

async function executor() {
  await initialize({
    packages: { HNN: '2.1.4' },
    verbose: true,
  });

  // let tagger = new Tagger(KMR);
  // let tagged = await tagger('안녕하세요. 눈이 오는 설날 아침입니다.');
  // for (const sent of tagged) {
  //   console.log(sent.toString());
  // }

  let parser = new Parser(HNN);
  let parsed = await parser('축구공은 어디 있나요?');
  for (const sent of parsed) {
    console.log(sent.toString());
    for (const dep of sent.dependencies) {
      console.log(dep.toString());
    }
  }
}

executor().then(
  () => console.log('finished!'),
  error => console.error('Error Occurred!', error),
);
