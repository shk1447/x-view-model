// Dependencies
import Svg from "./svg";
import Path from "./path";
import D from "./d";

// Public
export class PixelUtils {
  constructor() {}
  convert(image: ImageData) {
    return new Svg(image);
  }
}
