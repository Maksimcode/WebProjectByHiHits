from flask import Blueprint, render_template

bp = Blueprint('AStar_algorithm', __name__,
               template_folder='templates',
               static_folder='static')

@bp.route('/astar')
def astar():
    return render_template('AStar.html')