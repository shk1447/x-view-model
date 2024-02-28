import fs from 'fs';
import path from 'path';

const tempPath = './routes.json';

let routes: any = [];

export default context => {
  const { siteConfig } = context;
  console.log(siteConfig.title);

  return {
    name: 'docusaurus-plugin-generate_pdf',
    async loadContent() {
      console.log('tt');
    },
    async contentLoaded(args) {
      const baseUrl =
        args.allContent['docusaurus-plugin-content-docs'].default[
          'loadedVersions'
        ][0]['path'].toString();
      const sorted = args.allContent['docusaurus-plugin-content-docs'].default[
        'loadedVersions'
      ][0].docs.sort((a, b) => a.sidebarPosition - b.sidebarPosition);
      const locale = baseUrl.replaceAll('/', '').replaceAll('docs', '');
      console.log(locale);

      fs.writeFileSync(
        path.resolve(__dirname, `./route_${locale ? locale : 'en'}.json`),
        JSON.stringify(sorted.map(d => d.permalink)),
      );
    },
    async postBuild({ siteConfig = {}, routesPaths = [], outDir }) {
      // console.log('aaa', siteConfig);
      // // Print out to console all the rendered routes.
      // console.log(routesPaths);
      // routes = routesPaths.filter(route => {
      //   return route.includes('/docs/');
      // });
      // const locale = siteConfig['baseUrl'].replaceAll('/', '');
      // fs.writeFileSync(
      //   path.resolve(__dirname, `./route_${locale ? locale : 'en'}.json`),
      //   JSON.stringify(routes),
      // );

      return {};
    },
    injectHtmlTags({ content }) {
      console.log(content);
      return {};
    },
  };
};
