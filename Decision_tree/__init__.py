from flask import Blueprint, render_template

bp = Blueprint('decision_tree', __name__,
               template_folder='templates',
               static_folder='static')

@bp.route('/tree')
def decision_tree():
    return render_template('tree.html')