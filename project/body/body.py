from flask import Blueprint, render_template, redirect, url_for, request, flash, abort, jsonify
from flask_login import current_user
from ..utils.models import BodyInfo
from project import db

# auth에 해당하는 라우팅 함수들.
bp = Blueprint('body', __name__, url_prefix="/body")

def convert_units(height_value, height_unit, weight_value, weight_unit, waist_value, waist_unit):
    if height_unit == 'inch':
        height_value = str(float(height_value) * 2.54)  # inch to cm
    if weight_unit == 'lb':
        weight_value = str(float(weight_value) * 0.453592)  # lb to kg
    if waist_unit == 'cm':
        waist_value = str(float(waist_value) / 2.54)  # cm to inch
    return height_value, weight_value, waist_value


@bp.route('/save', methods=['GET','POST'])
def save():
    data = request.get_json()
    
    height_value = data['height']['value']
    height_unit = data['height']['unit']
    weight_value = data['weight']['value']
    weight_unit = data['weight']['unit']
    waist_value = data['waist']['value']
    waist_unit = data['waist']['unit']

    height_value, weight_value, waist_value = convert_units(height_value, height_unit, weight_value, weight_unit, waist_value, waist_unit)

    body_info = BodyInfo(
        user_id = current_user.id,
        height=height_value,
        weight=weight_value,
        waist=waist_value,
    )
    db.session.add(body_info)
    db.session.commit()

    return jsonify({'success': True})

    





