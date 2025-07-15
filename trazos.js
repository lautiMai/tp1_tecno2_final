class Trazo {
    constructor() {
    let cualColumna = int(random(cantX));
    this.x = (posX[cualColumna] + random(-0.1, 0.1)) * width;
    this.y = random(height);
    this.angulo = random(360);

    this.cual = int(random(imgTrazos.length));
    this.escala = map(frecuencia, FREC_MIN, FREC_MAX, 0.5, 2.5);
    this.escala = constrain(this.escala, 0.5, 2.5);

    this.ancho = imgTrazos[this.cual].width * this.escala;
    this.alto  = imgTrazos[this.cual].height * this.escala;

    //var de vibracion
    this.vibrarX = 0;
    this.vibrarY = 0;
    this.vibrarA = 0;
  }

  actualizarVibracion(activar) {
    if (activar) {
      this.vibrarX = random(-6, 6);
      this.vibrarY = random(-6, 6);
      this.vibrarA = random(-10, 10);
    } else {
      this.vibrarX = 0;
      this.vibrarY = 0;
      this.vibrarA = 0;
    }
  }

  dibujar() {
    push();
    translate(this.x + this.vibrarX, this.y + this.vibrarY);
    rotate(radians(this.angulo + this.vibrarA));
    imageMode(CENTER);
    image(imgTrazos[this.cual], 0, 0, this.ancho, this.alto);
    pop();
  }
}
