document.addEventListener('click', function(e) {
    if (e.target.closest('button, img')) return;
    const point = document.createElement('div');
    point.className = 'point';
    point.style.top = `${e.y}px`;
    point.style.left = `${e.x}px`;
    document.body.appendChild(point);
});

document.getElementById('clear').addEventListener('click', function() {
    document.querySelectorAll('.point').forEach(point => point.remove());
});