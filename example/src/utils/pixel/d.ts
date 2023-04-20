// No dependency

// Public
class D {
  [index: string]: any;
  x: any;
  y: any;
  width: number;
  height: number;
  // 동
  east?: D;
  // 서
  west?: D;
  // 남
  south?: D;
  // 북
  north?: D;
  // 서북
  north_west?: D;
  // 동남
  south_east?: D;
  // 북동
  north_east?: D;
  // 서남
  south_west?: D;
  _inner: boolean;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.width = 1;
    this.height = 1;
    this._inner = false;
  }

  inner() {
    if (
      this.east &&
      this.west &&
      this.north &&
      this.south &&
      this.north_east &&
      this.north_west &&
      this.south_east &&
      this.south_west
    ) {
      this._inner = true;
    } else {
      this._inner = false;
    }
    return this._inner;
  }
  toString() {
    let { x, y, width, height } = this;

    // 1pixel = <path d='M0,0 h1 v1 h-1 z'>
    return "M" + x + "," + y + "h" + width + "v" + height + "h-" + width + "Z";
  }
}

export default D;
