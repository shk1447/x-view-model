// Dependencies
import Path from "./path";

// Public
class Svg {
  points: Record<string, number>;
  colors: string[];
  image: ImageData;
  constructor(image: ImageData) {
    this.image = image;
    this.points = {};
    this.colors = [];
    this.parse(image);
  }
  parse(image: ImageData) {
    let i = 0;
    let channel = 0;

    while (image.data[channel] != null) {
      let x = i % image.width;
      let y = Math.floor(i / image.width);

      let r = image.data[channel++];
      let g = image.data[channel++];
      let b = image.data[channel++];
      let a = image.data[channel++] / 255;
      let rgba = `rgba(${r},${g},${b},${a})`;
      if (
        (r == 0 && g == 0 && b == 0 && a == 0) ||
        (r == 255 && g == 255 && b == 255 && a == 1)
      ) {
        i++;
        continue;
      }

      let j = this.colors.indexOf(rgba);
      if (j === -1) {
        j = this.colors.length;
        this.colors.push(rgba);
      }

      this.points[`${x},${y}`] = j;

      i++;
    }
  }
  renderG() {
    let paths: Record<string, Path> = {};
    for (let point in this.points) {
      let [x, y] = point.split(",");
      let color = this.colors[this.points[point]];

      let path = paths[color];
      if (path == null) {
        path = new Path();
        paths[color] = path;
      }

      path.draw(x, y);
    }
    let testPaths = "";

    Object.keys(paths).map((color) => {
      const path = paths[color];

      try {
        const pathStrings = path.toPaths();

        pathStrings.map((d) => {
          testPaths += `<path fill="${color}" d="${d}" />`;
        });
      } catch (error) {
        console.log(error);
      }
    });

    let svg = `
    <svg  width="${this.image.width}" height="${this.image.height}" xmlns="http://www.w3.org/2000/svg">
      ${testPaths}
    </svg>
    `;
    console.log(svg);

    return paths;
  }
}

export default Svg;
