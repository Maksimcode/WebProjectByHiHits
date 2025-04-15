from flask import Blueprint, render_template

bp = Blueprint('main_page', __name__,
               template_folder='templates',
               static_folder='static')

@bp.route('/')
def main_page():
    return render_template('index.html')