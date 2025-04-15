from flask import Blueprint, render_template

bp = Blueprint('clusterization', __name__,
               template_folder='templates',
               static_folder='static')

@bp.route('/clusterization')
def clusterization():
    return render_template('clusterization.html')