var test=false;
var l=0;
var EasyStar=EasyStar||{};"function"==typeof define&&define.amd&&define("easystar",[],function(){return EasyStar}),"undefined"!=typeof module&&module.exports&&(module.exports=EasyStar),EasyStar.Node=function(t,i,n,e,s){this.parent=t,this.x=i,this.y=n,this.costSoFar=e,this.simpleDistanceToTarget=s,this.bestGuessDistance=function(){return this.costSoFar+this.simpleDistanceToTarget}},EasyStar.Node.OPEN_LIST=0,EasyStar.Node.CLOSED_LIST=1,EasyStar.PriorityQueue=function(t,i){this.length=0;var n=[],e=!1;if(i==EasyStar.PriorityQueue.MAX_HEAP)e=!0;else{if(i!=EasyStar.PriorityQueue.MIN_HEAP)throw i+" not supported.";e=!1}this.insert=function(i){if(!i.hasOwnProperty(t))throw"Cannot insert "+i+" because it does not have a property by the name of "+t+".";n.push(i),this.length++,s(this.length-1)},this.getHighestPriorityElement=function(){return n[0]},this.shiftHighestPriorityElement=function(){if(0===this.length)throw"There are no more elements in your priority queue.";if(1===this.length){var t=n[0];return n=[],this.length=0,t}var i=n[0],e=n.pop();return this.length--,n[0]=e,r(0),i};var s=function(t){if(0!==t){var i=u(t);o(t,i)&&(a(t,i),s(i))}},r=function(t){var i=l(t),n=h(t);if(o(i,t))a(t,i),r(i);else if(o(n,t))a(t,n),r(n);else{if(0==t)return;r(0)}},a=function(t,i){var e=n[t];n[t]=n[i],n[i]=e},o=function(i,s){if(void 0===n[s]||void 0===n[i])return!1;var r,a;return"function"==typeof n[i][t]?(r=n[i][t](),a=n[s][t]()):(r=n[i][t],a=n[s][t]),e?r>a?!0:!1:a>r?!0:!1},u=function(t){return Math.floor(t/2)-1},l=function(t){return 2*t+1},h=function(t){return 2*t+2}},EasyStar.PriorityQueue.MAX_HEAP=0,EasyStar.PriorityQueue.MIN_HEAP=1,EasyStar.instance=function(){this.isDoneCalculating=!0,this.pointsToAvoid={},this.startX,this.callback,this.startY,this.endX,this.endY,this.nodeHash={},this.openList},EasyStar.js=function(){var t,i,n,e=10,s=14,r={},a={},o=!0,u=[],l=Number.MAX_VALUE,h=!1;this.setAcceptableTiles=function(t){t instanceof Array?n=t:!isNaN(parseFloat(t))&&isFinite(t)&&(n=[t])},this.enableDiagonals=function(){h=!0},this.disableDiagonals=function(){h=!1},this.setGrid=function(i){t=i;for(var n=0;n<t.length;n++)for(var e=0;e<t[0].length;e++)a[t[n][e]]||(a[t[n][e]]=1)},this.setTileCost=function(t,i){a[t]=i},this.setIterationsPerCalculation=function(t){l=t},this.avoidAdditionalPoint=function(t,i){r[t+"_"+i]=1},this.stopAvoidingAdditionalPoint=function(t,i){delete r[t+"_"+i]},this.enableCornerCutting=function(){o=!0},this.disableCornerCutting=function(){o=!1},this.stopAvoidingAllAdditionalPoints=function(){r={}},this.findPath=function(i,s,r,a,o){if(void 0===n)throw new Error("You can't set a path without first calling setAcceptableTiles() on EasyStar.");if(void 0===t)throw new Error("You can't set a path without first calling setGrid() on EasyStar.");if(0>i||0>s||0>r||0>r||i>t[0].length-1||s>t.length-1||r>t[0].length-1||a>t.length-1)throw new Error("Your start or end point is outside the scope of your grid.");if(i===r&&s===a)return setTimeout(function(){o([])}),void 0;for(var l=t[a][r],h=!1,f=0;f<n.length;f++)if(l===n[f]){h=!0;break}if(h===!1)return setTimeout(function(){o(null)}),void 0;var c=new EasyStar.instance;c.openList=new EasyStar.PriorityQueue("bestGuessDistance",EasyStar.PriorityQueue.MIN_HEAP),c.isDoneCalculating=!1,c.nodeHash={},c.startX=i,c.startY=s,c.endX=r,c.endY=a,c.callback=o,c.openList.insert(y(c,c.startX,c.startY,null,e)),u.push(c)},this.calculate=function(){if(0!==u.length&&void 0!==t&&void 0!==n)for(i=0;l>i;i++){if(0===u.length)return;if(0!==u[0].openList.length){var r=u[0].openList.shiftHighestPriorityElement();if(r.list=EasyStar.Node.CLOSED_LIST,r.y>0&&(f(u[0],r,0,-1,e*a[t[r.y-1][r.x]]),u[0].isDoneCalculating===!0))u.shift();else if(r.x<t[0].length-1&&(f(u[0],r,1,0,e*a[t[r.y][r.x+1]]),u[0].isDoneCalculating===!0))u.shift();else if(r.y<t.length-1&&(f(u[0],r,0,1,e*a[t[r.y+1][r.x]]),u[0].isDoneCalculating===!0))u.shift();else if(r.x>0&&(f(u[0],r,-1,0,e*a[t[r.y][r.x-1]]),u[0].isDoneCalculating===!0))u.shift();else if(h){if(r.x>0&&r.y>0&&(o||c(t,n,r.x,r.y-1)&&c(t,n,r.x-1,r.y))&&(f(u[0],r,-1,-1,s*a[t[r.y-1][r.x-1]]),u[0].isDoneCalculating===!0)){u.shift();continue}if(r.x<t[0].length-1&&r.y<t.length-1&&(o||c(t,n,r.x,r.y+1)&&c(t,n,r.x+1,r.y))&&(f(u[0],r,1,1,s*a[t[r.y+1][r.x+1]]),u[0].isDoneCalculating===!0)){u.shift();continue}if(r.x<t[0].length-1&&r.y>0&&(o||c(t,n,r.x,r.y-1)&&c(t,n,r.x+1,r.y))&&(f(u[0],r,1,-1,s*a[t[r.y-1][r.x+1]]),u[0].isDoneCalculating===!0)){u.shift();continue}if(r.x>0&&r.y<t.length-1&&(o||c(t,n,r.x,r.y+1)&&c(t,n,r.x-1,r.y))&&(f(u[0],r,-1,1,s*a[t[r.y+1][r.x-1]]),u[0].isDoneCalculating===!0)){u.shift();continue}}}else{var y=u[0];setTimeout(function(){y.callback(null)}),u.shift()}}};var f=function(i,e,s,a,o){var u=e.x+s,l=e.y+a;if(void 0===r[u+"_"+l]){if(i.endX===u&&i.endY===l){i.isDoneCalculating=!0;var h=[],f=0;h[f]={x:u,y:l},f++,h[f]={x:e.x,y:e.y},f++;for(var d=e.parent;null!=d;)h[f]={x:d.x,y:d.y},f++,d=d.parent;h.reverse();var g=i,v=h;setTimeout(function(){g.callback(v)})}if(c(t,n,u,l)){var E=y(i,u,l,e,o);void 0===E.list?(E.list=EasyStar.Node.OPEN_LIST,i.openList.insert(E)):E.list===EasyStar.Node.OPEN_LIST&&e.costSoFar+o<E.costSoFar&&(E.costSoFar=e.costSoFar+o,E.parent=e)}}},c=function(t,i,n,e){for(var s=0;s<i.length;s++)if(t[e][n]===i[s])return!0;return!1},y=function(t,i,n,e,s){if(void 0!==t.nodeHash[i+"_"+n])return t.nodeHash[i+"_"+n];var r=d(i,n,t.endX,t.endY);if(null!==e)var a=e.costSoFar+s;else a=r;var o=new EasyStar.Node(e,i,n,a,r);return t.nodeHash[i+"_"+n]=o,o},d=function(t,i,n,s){return Math.sqrt(Math.abs(n-t)*Math.abs(n-t)+Math.abs(s-i)*Math.abs(s-i))*e}};
var easystar = new EasyStar.js();
var destination = true;
var destinationX=22
var destinationY=26

var twoDimensionalArray=worldMap=[
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
[ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];

easystar.setGrid(twoDimensionalArray);
easystar.setAcceptableTiles([0]);
easystar.enableDiagonals();
var myPath=[]


pc.script.create('client', function (context) {
    
    var counter=0;
    var tmpVec = new pc.Vec3();
    var uri = new pc.URI(window.location.href);
    var query = uri.getQuery();
    var gamepadNum = query.gamepad;

    var Client = function (entity) {
        this.entity = entity;
        this.id = null;
        this.moved=0;
        this.movement = [ 0, 0 ];
        this.pastLocations=[]
        context.keyboard = new pc.input.Keyboard(document.body);
        
        document.body.style.cursor = 'none';
    };
    var getParameterByName = function(name) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    Client.prototype = {
        initialize: function () {
            this.tanks = context.root.getChildren()[0].script.tanks;
            this.bullets = context.root.getChildren()[0].script.bullets;
            this.pickables = context.root.getChildren()[0].script.pickables;
            this.teams = context.root.getChildren()[0].script.teams;
            this.profile = context.root.getChildren()[0].script.profile;
            
            var self = this;
            var servers = {
                'local': 'http://localhost:30043/socket', // local
                'fsb': 'http://localhost:30043/socket',
                'us': 'http://54.67.22.188:30043/socket', // us
                'default': 'https://tanx.playcanvas.com/socket' // load balanced
            };

            var env = getParameterByName('server') || 'default';
            var url = env && servers[env] || servers['default'];

            var socket = this.socket = new Socket({ url: url });
            
            this.connected = false;
            
            socket.on('error', function(err) {
                console.log(err);
            });
            
            socket.on('init', function(data) {
                self.id = data.id;
                self.connected = true;
                
                users.on(self.id + ':name', function(name) {
                    self.profile.set(name);
                });
            });
            
            users.bind(socket);
            
            socket.on('tank.new', function(data) {
                self.tanks.new(data);
            });
            
            socket.on('tank.delete', function(data) {
                self.tanks.delete(data);

            });
            
            var dataQueue = [ ];
            
            socket.on('update', function(data) {
                // bullets add
                if (data.bullets) {
                    for(var i = 0; i < data.bullets.length; i++)
                        self.bullets.new(data.bullets[i]);
                }
                
                // bullets delete
                if (data.bulletsDelete) {
                    for(var i = 0; i < data.bulletsDelete.length; i++)
                        self.bullets.finish(data.bulletsDelete[i]);
                }
                
                // pickables add
                if (data.pickable) {
                    for(var i = 0; i < data.pickable.length; i++)
                        self.pickables.new(data.pickable[i]);
                }
                
                // pickable delete
                if (data.pickableDelete) {
                    for(var i = 0; i < data.pickableDelete.length; i++)
                        self.pickables.finish(data.pickableDelete[i]);
                }
                
                // tanks update
                if (data.tanks)
                    self.tanks.updateData(data.tanks);

                // tanks respawn
                if (data.tanksRespawn) {
                    for(var i = 0; i < data.tanksRespawn.length; i++)
                        self.tanks.respawn(data.tanksRespawn[i]);
                }
                
                // teams score
                if (data.teams) {
                    for(var i = 0; i < data.teams.length; i++) {
                        self.teams.teamScore(i, data.teams[i]);
                    }
                }
                
                // winner
                if (data.winner) {
                    self.shoot(false);
                    self.teams.teamWin(data.winner);
                }
            });

            context.mouse.on('mousedown', this.onMouseDown, this);
            context.mouse.on('mouseup', this.onMouseUp, this);
            
            this.gamepadConnected = false;
            this.gamepadActive = false;
            
            window.addEventListener('gamepadconnected', function () {
                this.gamepadConnected = true;
            }.bind(this));
            window.addEventListener('gamepaddisconnected', function () {
                this.gamepadConnected = false;
            }.bind(this));
            
            // Chrome doesn't have the gamepad events, and we can't
            // feature detect them in Firefox unfortunately.
            if ('chrome' in window) {
                // This is a lie, but it lets us begin polling.
                this.gamepadConnected = true;
            }
        },
    
    
    
    

    
    
        update: function (dt) {
           this.entity.script.TankAI.takeAction( tankPosition);
           // if(this.angle<180){
           //              this.angle+=3
           //              if(shootNow===true){
           //                  console.log("test")
           //                 this.angle-=3
           //              }
           //          }else{
           //              this.angle=-180;
           //          }
           // this.socket.send('target', 47); 
            // if(newPath===true){
            //     newPath=false;
            //     // console.log("pathing initiated");
            //     easystar.findPath(Math.round(tankPosition[0]), Math.round(tankPosition[2]), destinationX, destinationY, function( path ) {
            //         if (path === null) {
            //             console.log("Path was not found.");
            //         } else {
            //             // console.log("tank position: ", [tankPosition[0], tankPosition[2]],"destination: ", [destinationX, destinationY], path);
            //             myPath=path;
            //         }
            //     });
                
            //     easystar.calculate();
            //     destination=true;
            // }
            
            // this.pastLocations.push(tankPosition[0])
            // this.pastLocations.push(tankPosition[2])
            // if(this.pastLocations.length>80){
            //     this.pastLocations.shift()
            //     this.pastLocations.shift()
            // }
            // if(this.unstick>0){
            //     this.unstick--
            // }else{
            //     if(Math.abs(this.pastLocations[0]-this.pastLocations[78])+Math.abs(this.pastLocations[1]-this.pastLocations[79])<0.5){

            //         this.movementOne=Math.round(Math.random()*2-1)
            //         this.movementTwo=Math.round(Math.random()*2-1)
            //         this.unstick=100;
            //     }else{
            //         if (l>myPath.length-2){
            //            destination=false;
            //            l=0;
            //            currentPriority=0;
            //         //   console.log("No current destination")
            //         }
            //         if(destination===true&&myPath.length>0){
        
            //             if (Math.abs(tankPosition[0]-(myPath[l].x))+Math.abs(tankPosition[2]-(myPath[l].y))<1){ 
        
            //                 l++; 
            //             }
            //             if (tankPosition[0]<myPath[l].x&&tankPosition[2]>myPath[l].y){
            //                this.movementOne=1
            //                 this.movementTwo=(((Math.abs(tankPosition[2]-myPath[l].y)/(Math.abs(tankPosition[0]-myPath[l].x)+Math.abs(tankPosition[2]-myPath[l].y)))*-2)+1)
        
            //             }
            //             if (tankPosition[0]>myPath[l].x&&tankPosition[2]<myPath[l].y){
            //                 this.movementOne=-1
            //                 this.movementTwo=(((Math.abs(tankPosition[2]-myPath[l].y)/(Math.abs(tankPosition[0]-myPath[l].x)+Math.abs(tankPosition[2]-myPath[l].y)))*2)-1)
            //             }
            //             if(tankPosition[0]>myPath[l].x&&tankPosition[2]>myPath[l].y){
            //                this.movementTwo=-1
            //                this.movementOne=(((Math.abs(tankPosition[0]-myPath[l].x)/(Math.abs(tankPosition[0]-myPath[l].x)+Math.abs(tankPosition[2]-myPath[l].y)))*-2)+1)
        
            //             }
            //             if(tankPosition[0]<myPath[l].x&&tankPosition[2]<myPath[l].y){
            //                this.movementTwo=1
            //                this.movementOne=(((Math.abs(tankPosition[0]-myPath[l].x)/(Math.abs(tankPosition[0]-myPath[l].x)+Math.abs(tankPosition[2]-myPath[l].y)))*2)-1)
            //             }
            //         }else{
                    
            //             if (! this.connected)
            //                 return;
            //             //ian edit: Motion script
            
            //             if(shootNow===true){
            //                 this.shoot(true);
            //                 this.angle--;
            //             }else{
            //              this.shoot(false);   
            //             }
            //             if (this.moved===undefined){
            //                 this.moved=0;
            //             }
            //             if(this.braked===true){
            //                 this.moved=200;
            //             }
            //                     // console.log("too far", Math.abs(tankPosition[0]-(repairLoc.data[0]))+Math.abs(tankPosition[2]-(repairLoc.data[2])))
            //         }
            //         if(this.moved%200===0||this.moved===0){
            //         this.movementOne=Math.round(Math.random()*2-1)
            //         this.movementTwo=Math.round(Math.random()*2-1)
            //         while(this.movementOne===0 && this.movementTwo===0){
            //             this.movementOne=Math.round(Math.random()*2-1)
            //             this.movementTwo=Math.round(Math.random()*2-1)
            //             }
            //         }
            //     }
            // }
            
            
            // movement=[this.movementOne,this.movementTwo];
             
            // this.moved++;
            

            
            // // rotate vector
            // var t =       movement[0] * Math.sin(Math.PI * 0.75) - movement[1] * Math.cos(Math.PI * 0.75);
            // movement[1] = movement[1] * Math.sin(Math.PI * 0.75) + movement[0] * Math.cos(Math.PI * 0.75);
            // movement[0] = t;
            
            // // check if it is changed
            // if (movement[0] !== this.movement[0] || movement[1] != this.movement[1]) {
            //     this.movement = movement;
            //     this.socket.send('move', this.movement);
            // }
        },
        
        onMouseDown: function() {
            this.shoot(true);
            shootNow=true;
        },
        
        onMouseUp: function() {
            this.shoot(false);
            shootNow=false;
        },
        
        shoot: function(state) {
            if (! this.connected)
                return;
                
            if (this.shootingState !== state) {
                this.shootingState = state;
                // console.log(this.tank)
                this.socket.send('shoot', this.shootingState);
            }
        }
    };

    return Client;
});