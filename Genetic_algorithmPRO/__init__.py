from flask import Blueprint, render_template

bp = Blueprint('genetic_algorithmPRO', __name__,
               template_folder='templates',
               static_folder='static')

@bp.route('/geneticPRO')
def genPRO():
    return render_template('geneticPRO.html')