/* Carousel: slides laid out in one canvas, left to right or top to bottom, unlimited slides */
function carQ(){if(car)Q=Math.max(.3,Math.min(3,devicePixelRatio||1,Math.sqrt(8e6/(car.sw*car.sh))))}
function applyCar(fit){if(!car)return;
 const w=car.dir=='h'?car.sw*car.n:car.sw,h=car.dir=='v'?car.sh*car.n:car.sh;
 setCanvas(w,h,0);carQ();dirty=1;if(fit)setTimeout(fitView,40);else render()}
function addSlide(){if(!car)return;car.n++;applyCar(0);
 const r=stage.getBoundingClientRect(),k=view.s;fitMode=0;
 if(car.dir=='h')view.x=r.width/2-(car.n-.5)*car.sw*k;else view.y=r.height/2-(car.n-.5)*car.sh*k;
 render();toast('Slide '+car.n+' added')}
$('#addsl').addEventListener('click',addSlide);
$('#addsl').addEventListener('pointerdown',e=>e.stopPropagation());
