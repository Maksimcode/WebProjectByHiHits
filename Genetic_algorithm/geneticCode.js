const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");

let flagPoints = true;

canvas.addEventListener("click",  function(mouseEvent) // ставит точки на экране
{
    if(flagPoints === true)
    {
        let rectCanvas = canvas.getBoundingClientRect(); //тут размеры канваса делаются
        let x = mouseEvent.clientX - rectCanvas.left;
        let y = mouseEvent.clientY - rectCanvas.top;
        let point = {
            pointX: x,
            pointY: y,
        }
        context.strokeStyle = 'blueviolet';
        context.fillStyle='black';
        context.beginPath(); //тут чтоб не сливались точечки
        context.arc(x, y, 10, 0, 2 * Math.PI);
        context.stroke();
        context.fill();
    }

    return points;    
});