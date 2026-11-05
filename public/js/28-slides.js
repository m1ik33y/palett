/* Slides: the "+" button in the editor toolbar appends a page and scrolls to it */
$('#addpg').onclick=()=>{if(!PG||!cur)return;if(PG.n>=100){toast('A slide deck can have up to 100 pages');return}
 PG.n++;fitMode=0;dirty=1;
 const r=stage.getBoundingClientRect(),p=pgPos(PG.n-1),s=view.s;
 view.x=(r.width-W*s)/2-p.x*s;view.y=(r.height-H0*s)/2-p.y*s;
 if(PG.dir=='h')view.y=(r.height-H0*s)/2;else view.x=(r.width-W*s)/2;
 render();toast('Page '+PG.n+' added')};
