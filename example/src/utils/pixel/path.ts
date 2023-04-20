// Dependencies
import D from "./d";

// Public
class Path {
  lines: Record<string, D>;
  objects: D[][];
  constructor() {
    this.lines = {};
    this.objects = [];
  }

  _removeInner(_d: D) {
    if (_d.inner()) {
      delete this.lines[`${_d.x},${_d.y}`];
    }
  }
  draw(_x: string = "0", _y: string = "0", i: string = "0") {
    const x = parseInt(_x);
    const y = parseInt(_y);
    // points to line
    let west = this.lines[`${x - 1},${y}`];
    let east = this.lines[`${x + 1},${y}`];
    let south = this.lines[`${x},${y + 1}`];
    let north = this.lines[`${x},${y - 1}`];

    let north_west = this.lines[`${x - 1},${y + 1}`];
    let north_east = this.lines[`${x + 1},${y + 1}`];
    let south_west = this.lines[`${x - 1},${y - 1}`];
    let south_east = this.lines[`${x + 1},${y - 1}`];

    let center = new D(x, y);

    this.lines[`${x},${y}`] = center;
    if (west) {
      west.east = center;
      this._removeInner(west);
    }
    if (east) {
      east.west = center;
      this._removeInner(east);
    }
    if (north) {
      north.south = center;
      this._removeInner(north);
    }
    if (south) {
      south.north = center;
      this._removeInner(south);
    }

    if (north_west) {
      north_west.south_east = center;
      this._removeInner(north_west);
    }
    if (north_east) {
      north_east.south_west = center;
      this._removeInner(north_east);
    }
    if (south_west) {
      south_west.north_east = center;
      this._removeInner(south_west);
    }
    if (south_east) {
      south_east.north_west = center;
      this._removeInner(south_east);
    }

    this.lines[`${x},${y}`].west = west;
    this.lines[`${x},${y}`].east = east;
    this.lines[`${x},${y}`].south = south;
    this.lines[`${x},${y}`].north = north;

    this.lines[`${x},${y}`].north_west = north_west;
    this.lines[`${x},${y}`].north_east = north_east;
    this.lines[`${x},${y}`].south_west = south_west;
    this.lines[`${x},${y}`].south_east = south_east;

    this._removeInner(center);
  }

  same(a: D, b: D) {
    return a.x == b.x && a.y == b.y;
  }

  next(curr: D, prev: D, points: any, keys: any, first: D) {
    const nextD: D[] = [];
    if (curr.west && curr.west != prev && !curr.west._inner)
      nextD.push(curr.west);

    if (curr.south && curr.south != prev && !curr.south._inner)
      nextD.push(curr.south);

    if (curr.east && curr.east != prev && !curr.east._inner)
      nextD.push(curr.east);

    if (curr.north && curr.north != prev && !curr.north._inner)
      nextD.push(curr.north);

    if (nextD.length !== 0) {
      if (nextD[0] != first) {
        points.push(nextD[0]);
        keys.splice(keys.indexOf(`${nextD[0].x},${nextD[0].y}`), 1);
        this.next(nextD[0], curr, points, keys, first);
      }
    }
  }
  toObjects() {
    const keys = Object.keys(this.lines);

    let firstPoint = undefined;
    let path = [];

    while (keys.length > 0) {
      const key = keys.pop() as any;
      firstPoint = this.lines[key];
      path.push(firstPoint);

      this.next(firstPoint, firstPoint, path, keys, firstPoint);

      this.objects.push(path);
      path = [];
    }

    return this.objects;
  }

  toPaths() {
    this.toObjects();

    const paths: string[] = [];
    this.objects.map((_d) => {
      let path = "";
      _d.map((point, i) => {
        if (i == 0) path += "M" + point.x + "," + point.y + "h1 v1 h-1";
        else path += "L" + point.x + "," + point.y + "h1 v1 h-1";
      });
      path += "Z";
      paths.push(path);
    });
    return paths;
  }
}

export default Path;
