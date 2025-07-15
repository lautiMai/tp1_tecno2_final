class Forma {
  constructor(nombreArchivo) {
    this.imagen = loadImage(nombreArchivo); 
  }

  perteneceALaForma(x, y) {
    let xEnImagen = int(map(x, 0, width, 0, this.imagen.width));
    let yEnImagen = int(map(y, 0, height, 0, this.imagen.height));
    let estePixel = this.imagen.get(xEnImagen, yEnImagen);
    
    return red(estePixel) < 120;
  }

  dibujar() {
    image(this.imagen, 0, 0, width, height);
  }
}
