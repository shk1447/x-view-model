// Dependencies
import Path from "./path";

// Public
class Svg {
  points: Record<string, number>;
  colors: string[];
  constructor(image: ImageData) {
    const parsedImage = this.parse(image);
    this.points = parsedImage.points;
    this.colors = parsedImage.colors;
  }
  parse(image: ImageData) {
    let colors: string[] = [];
    let points: Record<string, number> = {};

    let i = 0;
    let channel = 0;
    while (image.data[channel] != null) {
      let x = i % image.width;
      let y = Math.floor(i / image.width);
      let r = image.data[channel++];
      let g = image.data[channel++];
      let b = image.data[channel++];
      let a = image.data[channel++];
      let rgba = `rgba(${r},${g},${b},${a})`;

      let j = colors.indexOf(rgba);
      if (j === -1) {
        j = colors.length;
        colors.push(rgba);
      }

      points[`${x},${y}`] = j;

      i++;
    }

    return { points, colors };
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

    let g = `<g>
      ${Object.keys(paths)
        .map((color) => {
          let path = `<path fill="${color}" d="${paths[color].toElement()}" />`;
          return path;
        })
        .join("")
        .toString()}
    </g>`;

    return g;
  }
}

export default Svg;
