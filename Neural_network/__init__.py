from flask import Blueprint, render_template

bp = Blueprint('neural_network', __name__,
               template_folder='templates',
               static_folder='static')

@bp.route('/neuro')
def neuro():
    return render_template('neuro.html')