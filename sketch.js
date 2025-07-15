let AMP_MIN = 0.01; //calibración de lauty (este anda en tu pc solamente)
let AMP_MAX = 0.4;

let FREC_MIN = 31; //47
let FREC_MAX = 150; //200
// lo demás sonido
let audioContext;
let mic;
//let amp;
let pitch;
let gestorAmp;
let gestorPitch;

let haySonido;
let antesHabiaSonido;

let estado = "agregar";

let trazoS;
let imgTrazos = [];
let trazos = [];
let cantidad = 5;
let tiempoEntreTrazos = 300;
let ultimoTrazado = 0;

let posiciones = [];
let indiceTrazado = 0;

// prueba de columnas verticales  y horizontales
let porcentajeVertical;
let posX = [];
let cantX;

//------------------------------PARA LOS CAMBIOS DEL LIENZO--------------------
//let fondoOscilante = true;
let fondoColor;
let tamanios = [
  [900, 500],
  [500, 900],
  [1000, 800]
];
let coloresFondo = [];

//-----------------------------pruebaaaa----------------
const model_url = 'https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/';
                  

let dibujarTrazos = false;


let vibrar = false;
let fondo;

//MILLIS-----------------------------
let esperando = false;
let tiempoDeEspera = 4000; // 2 segundos
let tiempoInicioEspera = 0;

let marca;
let tiempoLimiteAgregar = 3000;
let tiempoLimiteGrosor = 3000;
let tiempoLimiteVibrar = 3000;

let bloqueadoPorReinicio = false;

let frecuencia;

function preload() {
  for (let i = 0; i < cantidad; i++) {
    let nombre = "Data/trazo" + nf(i, 2) + ".png";
    imgTrazos[i] = loadImage(nombre);
  }
  
}

function setup() {
  createCanvas(600, 900); //1400, 800
  audioContext=getAudioContext();//inicia el motor de audio 
  
  mic= new p5.AudioIn(); // inicia el microfono
  mic.start(startPitch);  //se enciende el micro y le transmito el analisis de frecuencia (pitch) al micro. Con esto conecto la libreria al microfono.
 
  userStartAudio(); 

  gestorAmp =  new GestorSenial( AMP_MIN, AMP_MAX);
  gestorPitch = new GestorSenial( FREC_MIN, FREC_MAX);

  antesHabiaSonido = false;

  //para las columnas vert y horiz
   porcentajeVertical = random(40,60); //PROB para colum verticales (alterar probando)
   cantX = int(random(2,5));
   for( let i=0 ; i<cantX ; i++ ){
   posX[i] = random(0.1,0.9); //porcentajes para los margenes de la pantalla
    
  }
  //----------------PARA FONDO--------
 fondoColor = color(241, 239, 233); //CAMBIAR PARA QUE NO SEA BLANC
    coloresFondo = [
    color(218, 214, 198),
    color(213, 219, 219),
    color(215, 211, 197)
  ];
}

function draw() {
//-------------------------COLOR DE FONDO----------------
  blendMode(BLEND);
  background(fondoColor);
  blendMode(MULTIPLY);
    frameRate(60);
  // -----------------INICIO EVENTOS CON EL PITCH------------------
  let vol = mic.getLevel(); // cargo en vol la amplitud del micrófono (señal cruda);
  gestorAmp.actualizar(vol);

  haySonido = gestorAmp.filtrada > 0.1; // umbral de ruido que define el estado haySonido

  let inicioElSonido = haySonido && !antesHabiaSonido; // evendo de INICIO de un sonido
  let finDelSonido = !haySonido && antesHabiaSonido; // evento de fIN de un sonido

  // ------------------FIN EVENTOS CON EL PITCH------------------
 if (bloqueadoPorReinicio) {
  if (millis() - tiempoInicioEspera > tiempoDeEspera) {
    bloqueadoPorReinicio = false;
    esperando = false;
    console.log(">> Fin del bloqueo tras reinicio");
  }else {
    return;
    }
}

//Inicio sonido
if (haySonido) {
    if (frecuencia >= 55 && frecuencia <= 60 && estado !== "Vibrar") {//"zumbido" desde el pecho // 46 y 52
      estado = "Vibrar";
      console.log(">> CAMBIO A ESTADO: Vibrar");
    }

    if (frecuencia > 70 && frecuencia < 78 && estado !== "grosor") {//"iiii" para alargar trazos //57 y 75
      estado = "grosor";
      console.log(">> CAMBIO A ESTADO: grosor");
    }

    if (frecuencia > 90 && frecuencia < 100 && estado !== "agregar") {//silbido para dibujar fiuum
      estado = "agregar";
      console.log(">> VOLVIÓ A ESTADO: agregar");
    }
    if (frecuencia >= 45 && frecuencia <= 50 && !esperando) { // Medir valor de "OHHH" // 33 y 44era
      reiniciarObra();
  estado = "agregar";
  esperando = true;
  bloqueadoPorReinicio = true;
  tiempoInicioEspera = millis(); // guarda el tiempo actual
  console.log(">> Reinicio iniciado, esperando 3 segundos...");
  return;
  }
  }

// ---------------------ESTADOS---------------------
  if (estado === "agregar") {
    if (inicioElSonido) {
      let trazoS = new Trazo();
      trazos.push(trazoS);
    }
  }

  else if (estado === "grosor") {
     if (haySonido && frecuencia > 70 && frecuencia < 78 ) { //69 y 75
    let cuantosCambiar = 6;
    let desde = max(0, trazos.length - cuantosCambiar);
    for (let i = desde; i < trazos.length; i++) {
      let t = trazos[i];
      let nuevaEscala = map(frecuencia, FREC_MIN, FREC_MAX, 1, 5);
      nuevaEscala = constrain(nuevaEscala, 1, 5);
      t.escala = nuevaEscala;
      t.ancho = imgTrazos[t.cual].width * t.escala;
      // t.alto  = imgTrazos[t.cual].height * t.escala;
    }
    console.log(">> AJUSTANDO GROSOR de los últimos trazos con frecuencia:", frecuencia);
  }
  }

  else if (estado === "Vibrar") {
    if (haySonido && frecuencia >= 55 && frecuencia <= 60) { //50 y 60
      for (let t of trazos) t.actualizarVibracion(true);
      console.log(">> VIBRANDO con nota:", frecuencia);
    } else {
      for (let t of trazos) t.actualizarVibracion(false);
    }
  }

 for (let t of trazos) {
    t.dibujar();
  }


  //para sonido---------------------------------------
 amp = mic.getLevel(); 
 console.log("AMP", amp)
// La pelotita----------------------------------
 /*
 push();

  textSize(20);
  fill(0);
  let texto = "Amplitud: " + nfc(amp, 3);
  text(texto, 50, 50);

  noStroke();
  fill(255, 0, 0);
  let posY = map(amp, AMP_MIN, AMP_MAX, height, 0);
  ellipse(width/2, posY, 30, 30);

  pop();
  // -----------------------confirma que se dibujaa-------------------------
text("Trazos: " + posiciones.length, 50, 80);*/
}

//----------------------------(((((((PITCH)))))))----------------------------------------
//inicia el modelo de Machine Learning para deteccion de pitch (altura tonal)
function startPitch() {
  pitch = ml5.pitchDetection(model_url, audioContext , mic.stream, modelLoaded);
}
//--------------------------------------------------------------------
function modelLoaded() {
//select('#status').html('Model Loaded');
getPitch();
//console.log( "entro aca !" );
}
//--------------------------------------------------------------------
function getPitch() {
  pitch.getPitch(function(err, frequency) {
    //aca ingresa la frecuencia 'cruda'
  if (frequency) {
    //transforma la frevcuencia en nota musical
    let numeroDeNota = freqToMidi(frequency);
    console.log( numeroDeNota );

  frecuencia = numeroDeNota;
    gestorPitch.actualizar( numeroDeNota );

  }

  getPitch();
})
}

function reiniciarObra() {
  trazos = []; 
  posiciones = [];
  
  let indice = floor(random(tamanios.length));
  let nuevoTam = tamanios[indice];
  resizeCanvas(nuevoTam[0], nuevoTam[1]);
  fondoColor = coloresFondo[indice];

}



