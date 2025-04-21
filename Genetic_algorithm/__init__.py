from flask import Blueprint, render_template

bp = Blueprint('genetic_algorithm', __name__,
               template_folder='templates',
               static_folder='static')

@bp.route('/genetic')
def genetic():
    return render_template('genetic.html')