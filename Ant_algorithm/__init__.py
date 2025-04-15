from flask import Blueprint, render_template

bp = Blueprint('Ant_algorithm', __name__,
               template_folder='templates',
               static_folder='static')

@bp.route('/ant')
def ant():
    return render_template('Ant.html')